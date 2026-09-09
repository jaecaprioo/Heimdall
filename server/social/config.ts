import { PlatformAuthConfig, SupportedSocialPlatform } from './types';

export const SUPPORTED_PLATFORMS: Record<SupportedSocialPlatform, PlatformAuthConfig> = {
  instagram: {
    platform: 'instagram',
    displayName: 'Instagram',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    revokeUrl: 'https://graph.facebook.com/v19.0/me/permissions',
    clientIdEnv: 'INSTAGRAM_CLIENT_ID', // Meta App ID
    clientSecretEnv: 'INSTAGRAM_CLIENT_SECRET', // Meta App Secret
    requiredScopes: [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
      'business_management'
    ],
    scopeDescriptions: {
      'instagram_basic': 'Read basic Instagram profile info, follower count, and media.',
      'instagram_manage_insights': 'Access deep analytics: reach, impressions, audience demographics, and Reel engagement.',
      'pages_show_list': 'List Facebook Pages linked to the Instagram Business/Creator account.',
      'pages_read_engagement': 'Verify authentic page identity and audience interactions.',
      'business_management': 'Connect Creator accounts managed in Meta Business Suite.'
    },
    developerApprovalRequired: true,
    approvalNotes: 'Requires Meta App Review for "instagram_manage_insights" in Production. Personal accounts must be converted to Creator or Business accounts linked to a Facebook Page to expose Insights API.',
    documentationUrl: 'https://developers.facebook.com/docs/instagram-api/',
    supportsWebhooks: true,
    rateLimitDetails: '200 calls per hour per user under Graph API application tier.'
  },

  youtube: {
    platform: 'youtube',
    displayName: 'YouTube',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    clientIdEnv: 'YOUTUBE_CLIENT_ID', // Google Cloud OAuth Client ID
    clientSecretEnv: 'YOUTUBE_CLIENT_SECRET', // Google Cloud OAuth Client Secret
    requiredScopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid'
    ],
    scopeDescriptions: {
      'https://www.googleapis.com/auth/youtube.readonly': 'Read public channel metadata, subscriber count, total video count, and public playlist metrics.',
      'https://www.googleapis.com/auth/yt-analytics.readonly': 'Access YouTube Analytics API for watch time hours, estimated revenue, viewer retention, and average view duration.',
      'https://www.googleapis.com/auth/userinfo.profile': 'Retrieve authenticated Google creator profile image and display name.'
    },
    developerApprovalRequired: true,
    approvalNotes: 'Google Cloud Project verification and OAuth Consent Screen review is mandatory for "yt-analytics.readonly" sensitive scopes in public production.',
    documentationUrl: 'https://developers.google.com/youtube/v3/getting-started',
    supportsWebhooks: true,
    rateLimitDetails: '10,000 quota units per day baseline on Google Developer Console.'
  },

  tiktok: {
    platform: 'tiktok',
    displayName: 'TikTok',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    revokeUrl: 'https://open.tiktokapis.com/v2/oauth/revoke/',
    clientIdEnv: 'TIKTOK_CLIENT_KEY',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
    requiredScopes: [
      'user.info.basic',
      'user.info.profile',
      'user.info.stats',
      'video.list'
    ],
    scopeDescriptions: {
      'user.info.basic': 'Retrieve open_id, union_id, and avatar URL.',
      'user.info.profile': 'Read display name, bio description, profile deep-link, and verified badge status.',
      'user.info.stats': 'Read verified follower count, following count, total likes count, and public video count.',
      'video.list': 'Retrieve published public TikTok videos, views, likes, shares, comments, and duration.'
    },
    developerApprovalRequired: true,
    approvalNotes: 'TikTok for Developers requires App Review for "user.info.stats" and "video.list" permissions. Research API or Commercial Content API requires separate commercial partner whitelisting.',
    documentationUrl: 'https://developers.tiktok.com/doc/overview/',
    supportsWebhooks: false,
    rateLimitDetails: 'TikTok Login Kit & Display API v2 standard rate limits per minute per open_id.'
  },

  x: {
    platform: 'x',
    displayName: 'X (Twitter)',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
    clientIdEnv: 'X_CLIENT_ID',
    clientSecretEnv: 'X_CLIENT_SECRET',
    requiredScopes: [
      'tweet.read',
      'users.read',
      'offline.access'
    ],
    scopeDescriptions: {
      'tweet.read': 'Read public posts, impressions, retweet count, like count, and replies.',
      'users.read': 'Read verified followers count, following count, verified blue badge status, and profile bio.',
      'offline.access': 'Issue a long-lived refresh token for background automated synchronization.'
    },
    developerApprovalRequired: true,
    approvalNotes: 'Requires Twitter Developer Portal App with OAuth 2.0 PKCE flow enabled. Basic or Pro Developer tier needed for production volume.',
    documentationUrl: 'https://developer.x.com/en/docs/twitter-api',
    supportsWebhooks: false,
    rateLimitDetails: '100 requests per 15-minute window per user token under Twitter API v2.'
  },

  facebook: {
    platform: 'facebook',
    displayName: 'Facebook',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    revokeUrl: 'https://graph.facebook.com/v19.0/me/permissions',
    clientIdEnv: 'FACEBOOK_APP_ID',
    clientSecretEnv: 'FACEBOOK_APP_SECRET',
    requiredScopes: [
      'pages_show_list',
      'pages_read_engagement',
      'read_insights',
      'pages_manage_posts'
    ],
    scopeDescriptions: {
      'pages_show_list': 'List all creator fan pages managed by the user.',
      'pages_read_engagement': 'Read follower counts, page likes, and audience engagement stats.',
      'read_insights': 'Retrieve Page level reach, impressions, post video watch time, and audience demographics.'
    },
    developerApprovalRequired: true,
    approvalNotes: 'Meta App Review and Business Verification required for "read_insights" in live production.',
    documentationUrl: 'https://developers.facebook.com/docs/graph-api/',
    supportsWebhooks: true,
    rateLimitDetails: 'Graph API standard 200 calls/hr/user.'
  },

  linkedin: {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
    clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    requiredScopes: [
      'openid',
      'profile',
      'email',
      'w_member_social',
      'r_organization_social'
    ],
    scopeDescriptions: {
      'openid': 'Verify member identity using OpenID Connect standard.',
      'profile': 'Retrieve creator first/last name, headline, vanity name, and profile picture.',
      'r_organization_social': 'Retrieve page analytics, post impressions, and follower growth for creator newsletter/company pages.'
    },
    developerApprovalRequired: true,
    approvalNotes: 'LinkedIn Developer Portal requires "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect" products. Community Management API requires LinkedIn partner review.',
    documentationUrl: 'https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2',
    supportsWebhooks: false,
    rateLimitDetails: 'LinkedIn REST API standard daily request thresholds.'
  }
};

export function getPlatformConfig(platform: SupportedSocialPlatform): PlatformAuthConfig {
  const config = SUPPORTED_PLATFORMS[platform];
  if (!config) {
    throw new Error(`Unsupported social platform: ${platform}`);
  }
  return config;
}

export function isPlatformConfigured(platform: SupportedSocialPlatform): boolean {
  const config = getPlatformConfig(platform);
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  return Boolean(clientId && clientSecret);
}

export function getBaseCallbackUrl(reqHost?: string): string {
  // Use explicit environment variable if defined, or derive from request host
  if (process.env.APP_BASE_URL) {
    return `${process.env.APP_BASE_URL.replace(/\/$/, '')}/api/social/oauth/callback`;
  }
  if (reqHost) {
    const protocol = reqHost.includes('localhost') || reqHost.includes('127.0.0.1') ? 'http' : 'https';
    return `${protocol}://${reqHost}/api/social/oauth/callback`;
  }
  return 'http://localhost:3000/api/social/oauth/callback';
}
