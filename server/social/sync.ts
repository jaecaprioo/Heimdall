import { getStoredToken, exchangeAuthorizationCode } from './oauth';
import { getPlatformConfig } from './config';
import { normalizePlatformData } from './normalizer';
import { NormalizedSocialProfile, SocialSnapshot, SupportedSocialPlatform } from './types';

// In-memory snapshots cache to back historical trends
const snapshotDatabase = new Map<string, SocialSnapshot[]>();
const normalizedProfilesStore = new Map<string, Map<SupportedSocialPlatform, NormalizedSocialProfile>>();

export function getSnapshotsForUser(userId: string, platform?: SupportedSocialPlatform): SocialSnapshot[] {
  const userSnapshots = snapshotDatabase.get(userId) || [];
  if (platform) {
    return userSnapshots.filter(s => s.platform === platform);
  }
  return userSnapshots;
}

export function saveSnapshotForUser(userId: string, snapshot: SocialSnapshot) {
  const userSnapshots = snapshotDatabase.get(userId) || [];
  userSnapshots.push(snapshot);
  snapshotDatabase.set(userId, userSnapshots);
}

export function getNormalizedProfiles(userId: string): NormalizedSocialProfile[] {
  const userMap = normalizedProfilesStore.get(userId);
  if (!userMap) return [];
  return Array.from(userMap.values());
}

export function saveNormalizedProfile(userId: string, profile: NormalizedSocialProfile) {
  let userMap = normalizedProfilesStore.get(userId);
  if (!userMap) {
    userMap = new Map();
    normalizedProfilesStore.set(userId, userMap);
  }
  userMap.set(profile.platform, profile);
}

/**
 * Perform live, real synchronization against official platform REST APIs
 */
export async function syncPlatformData(
  userId: string,
  platform: SupportedSocialPlatform
): Promise<{
  success: boolean;
  profile?: NormalizedSocialProfile;
  snapshot?: SocialSnapshot;
  error?: string;
  errorCode?: 'TOKEN_EXPIRED' | 'PERMISSION_REQUIRED' | 'RATE_LIMIT' | 'NOT_CONNECTED' | 'API_ERROR';
}> {
  const token = await getStoredToken(userId, platform);
  const config = getPlatformConfig(platform);

  if (!token) {
    return {
      success: false,
      errorCode: 'NOT_CONNECTED',
      error: `${config.displayName} is not connected or token expired. Please complete the OAuth handshake.`
    };
  }

  try {
    let rawPayload: any = null;

    if (platform === 'instagram') {
      // 1. Fetch user's linked pages to locate Instagram Business ID with rich details
      const meUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${token.accessToken}&fields=name,id,instagram_business_account{id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website,is_verified,media.limit(20){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count}}`;
      const meRes = await fetch(meUrl);
      const meData = await meRes.json();

      if (meData.error) {
        throw new Error(meData.error.message || 'Failed to query Instagram account from Meta Graph');
      }

      const pageWithIg = meData.data?.find((p: any) => p.instagram_business_account);
      if (pageWithIg && pageWithIg.instagram_business_account) {
        const igBusiness = pageWithIg.instagram_business_account;
        
        // 2. Fetch insights (impressions, reach, profile views, audience demographics)
        let insightsData: any = null;
        try {
          const insightsUrl = `https://graph.facebook.com/v19.0/${igBusiness.id}/insights?metric=impressions,reach,audience_country,audience_gender_age,audience_city&period=days_28&access_token=${token.accessToken}`;
          const insightsRes = await fetch(insightsUrl);
          const iJson = await insightsRes.json();
          if (!iJson.error) {
            insightsData = iJson;
          }
        } catch (e) {
          console.warn('[Instagram Insights warning]:', e);
        }

        // Calculate media aggregates
        const mediaItems = igBusiness.media?.data || [];
        let totalRecentLikes = 0;
        let totalRecentComments = 0;
        for (const item of mediaItems) {
          totalRecentLikes += item.like_count || 0;
          totalRecentComments += item.comments_count || 0;
        }

        rawPayload = {
          instagram_business_account: igBusiness,
          insights: insightsData,
          media_count: igBusiness.media_count,
          recent_media: mediaItems,
          total_recent_likes: totalRecentLikes,
          total_recent_comments: totalRecentComments
        };
      } else {
        // Direct basic fallback if not converted to business
        const directMe = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${token.accessToken}`);
        rawPayload = await directMe.json();
      }
    } else if (platform === 'youtube') {
      // Fetch channel details from YouTube Data API v3
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,status,topicDetails,brandingSettings&mine=true&access_token=${token.accessToken}`;
      const channelRes = await fetch(channelUrl);
      const channelData = await channelRes.json();

      if (channelData.error) {
        throw new Error(channelData.error.message || 'YouTube Data API error');
      }

      const channel = channelData.items?.[0];
      const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;
      let recentVideos: any[] = [];

      // Fetch recent 10 videos if playlist exists
      if (uploadsPlaylistId) {
        try {
          const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=10&access_token=${token.accessToken}`;
          const playlistRes = await fetch(playlistUrl);
          const playlistData = await playlistRes.json();
          
          if (playlistData.items && playlistData.items.length > 0) {
            const videoIds = playlistData.items.map((it: any) => it.contentDetails?.videoId).filter(Boolean).join(',');
            if (videoIds) {
              const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&access_token=${token.accessToken}`;
              const videosRes = await fetch(videosUrl);
              const vData = await videosRes.json();
              recentVideos = vData.items || [];
            }
          }
        } catch (e) {
          console.warn('[YouTube videos fetch warning]:', e);
        }
      }

      // Try fetching estimated watch time and metrics from YouTube Analytics API
      let analyticsData: any = null;
      try {
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${thirtyDaysAgo}&endDate=${today}&metrics=estimatedMinutesWatched,averageViewDuration,views,likes,comments,shares,subscribersGained,subscribersLost&access_token=${token.accessToken}`;
        const analyticsRes = await fetch(analyticsUrl);
        const aJson = await analyticsRes.json();
        if (aJson.rows && aJson.rows[0]) {
          analyticsData = {
            estimatedMinutesWatched: aJson.rows[0][0],
            averageViewDuration: aJson.rows[0][1],
            views30d: aJson.rows[0][2],
            likes30d: aJson.rows[0][3],
            comments30d: aJson.rows[0][4],
            shares30d: aJson.rows[0][5],
            subscribersGained: aJson.rows[0][6],
            subscribersLost: aJson.rows[0][7]
          };
        }
      } catch (e) {
        // Analytics API may require explicit scope review
      }

      rawPayload = {
        ...channelData,
        recent_videos: recentVideos,
        analytics: analyticsData
      };
    } else if (platform === 'tiktok') {
      // Fetch user info from TikTok Display API v2
      const userUrl = 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count';
      const userRes = await fetch(userUrl, {
        headers: { 'Authorization': `Bearer ${token.accessToken}` }
      });
      const userData = await userRes.json();

      if (userData.error?.code && userData.error?.code !== 'ok') {
        throw new Error(userData.error.message || 'TikTok API error');
      }

      rawPayload = userData;
    } else if (platform === 'x') {
      // Fetch user profile & public metrics from Twitter API v2
      const xUrl = 'https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url,verified,verified_type,description';
      const xRes = await fetch(xUrl, {
        headers: { 'Authorization': `Bearer ${token.accessToken}` }
      });
      const xData = await xRes.json();

      if (xData.errors && xData.errors.length > 0) {
        throw new Error(xData.errors[0].message || 'X API error');
      }

      rawPayload = xData;
    } else if (platform === 'facebook') {
      // Fetch Facebook Pages managed by user
      const fbUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=name,id,fan_count,followers_count,picture,is_verified,link&access_token=${token.accessToken}`;
      const fbRes = await fetch(fbUrl);
      rawPayload = await fbRes.json();
    } else if (platform === 'linkedin') {
      // Fetch User profile from OpenID Connect UserInfo endpoint
      const liUrl = 'https://api.linkedin.com/v2/userinfo';
      const liRes = await fetch(liUrl, {
        headers: { 'Authorization': `Bearer ${token.accessToken}` }
      });
      rawPayload = await liRes.json();
    }

    if (!rawPayload) {
      throw new Error(`Received empty payload from ${config.displayName} API.`);
    }

    // Normalize real response
    const normalized = normalizePlatformData(platform, rawPayload);
    saveNormalizedProfile(userId, normalized);

    // Build historical snapshot
    const previousSnapshots = getSnapshotsForUser(userId, platform);
    const lastSnapshot = previousSnapshots[previousSnapshots.length - 1];

    const currentFollowers = normalized.followers ?? normalized.subscriber_count ?? 0;
    const currentViews = normalized.average_views ?? 0;
    const currentEngagement = normalized.engagement_rate ?? 0;

    let deltaFollowers = 0;
    let deltaFollowersPercent = 0;
    let deltaViews = 0;
    let deltaEngagement = 0;
    let changeClassification: SocialSnapshot['change_classification'] = 'NORMAL';

    if (lastSnapshot) {
      const prevFollowers = lastSnapshot.followers ?? 0;
      deltaFollowers = currentFollowers - prevFollowers;
      if (prevFollowers > 0) {
        deltaFollowersPercent = Number(((deltaFollowers / prevFollowers) * 100).toFixed(1));
      }
      deltaViews = currentViews - (lastSnapshot.average_views ?? 0);
      deltaEngagement = Number((currentEngagement - (lastSnapshot.engagement_rate ?? 0)).toFixed(2));

      if (deltaFollowersPercent >= 50 || deltaViews >= 15000) {
        changeClassification = 'BREAKOUT';
      } else if (deltaFollowersPercent >= 20 || deltaViews >= 5000) {
        changeClassification = 'MAJOR';
      } else if (deltaFollowersPercent >= 5 || deltaEngagement >= 1.5) {
        changeClassification = 'SIGNIFICANT';
      }
    }

    const now = new Date();
    const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const newSnapshot: SocialSnapshot = {
      id: `snap_${Date.now()}_${platform}`,
      userId,
      platform,
      timestamp: now.toISOString(),
      dateLabel,
      followers: currentFollowers,
      following: normalized.following,
      average_views: currentViews,
      total_views: normalized.total_views,
      reach: normalized.reach,
      impressions: normalized.impressions,
      engagement_rate: currentEngagement,
      post_count: normalized.post_count,
      source: normalized.data_source,
      delta_followers: deltaFollowers,
      delta_followers_percent: deltaFollowersPercent,
      delta_views: deltaViews,
      delta_engagement: deltaEngagement,
      change_classification: changeClassification
    };

    saveSnapshotForUser(userId, newSnapshot);

    return {
      success: true,
      profile: normalized,
      snapshot: newSnapshot
    };
  } catch (err: any) {
    console.error(`[Sync Engine Failure][${platform}]:`, err);
    
    let errorCode: any = 'API_ERROR';
    const msg = err.message?.toLowerCase() || '';
    if (msg.includes('expired') || msg.includes('token') || msg.includes('oauth')) {
      errorCode = 'TOKEN_EXPIRED';
    } else if (msg.includes('permission') || msg.includes('scope') || msg.includes('access denied')) {
      errorCode = 'PERMISSION_REQUIRED';
    } else if (msg.includes('rate limit') || msg.includes('quota')) {
      errorCode = 'RATE_LIMIT';
    }

    return {
      success: false,
      errorCode,
      error: err.message || `Failed to sync verified data from ${config.displayName}`
    };
  }
}
