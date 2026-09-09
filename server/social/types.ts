export type SupportedSocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook' | 'linkedin';

export type SocialConnectionState = 
  | 'connected'
  | 'syncing'
  | 'permission_required'
  | 'expired'
  | 'error'
  | 'disconnected'
  | 'not_configured';

export interface PlatformAuthConfig {
  platform: SupportedSocialPlatform;
  displayName: string;
  authUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  requiredScopes: string[];
  scopeDescriptions: Record<string, string>;
  developerApprovalRequired: boolean;
  approvalNotes: string;
  documentationUrl: string;
  supportsWebhooks: boolean;
  rateLimitDetails: string;
}

export interface StoredOAuthTokens {
  platform: SupportedSocialPlatform;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt: number; // Unix timestamp ms
  scope: string;
  platformUserId: string;
  platformUsername?: string;
  connectedAt: string; // ISO string
}

export interface NormalizedSocialProfile {
  platform: SupportedSocialPlatform;
  platform_user_id: string;
  username: string;
  display_name: string;
  profile_url: string | null;
  profile_image: string | null;
  verified_status: boolean;
  account_type: 'personal' | 'creator' | 'business' | 'organization' | null;
  
  // Follower & Graph Counts (null if not permitted)
  followers: number | null;
  following: number | null;
  subscriber_count: number | null;
  video_count: number | null;
  post_count: number | null;
  
  // Global Aggregate Performance (null if platform scope lacks permission)
  total_likes: number | null;
  total_views: number | null;
  reach: number | null;
  impressions: number | null;
  average_views: number | null;
  watch_time_hours: number | null;
  engagement_rate: number | null; // e.g. 5.4 for 5.4%
  
  // Demographics (null if restricted or <100 followers threshold)
  audience_demographics: {
    top_countries?: { country: string; percentage: number }[];
    age_brackets?: { range: string; percentage: number }[];
    gender_distribution?: { male: number; female: number; other: number };
  } | null;
  
  // Metadata & Audit
  data_source: string; // e.g. "Meta Graph API v19.0", "YouTube Data API v3", "TikTok Display API v2"
  data_timestamp: string; // ISO
  last_synced: string; // ISO
  permission_status: 'full_verified' | 'limited_basic' | 'analytics_restricted' | 'expired';
  missing_permissions?: string[];
}

export interface SocialSnapshot {
  id: string;
  userId: string;
  platform: SupportedSocialPlatform | 'all';
  timestamp: string;
  dateLabel: string;
  followers: number | null;
  following: number | null;
  average_views: number | null;
  total_views: number | null;
  reach: number | null;
  impressions: number | null;
  engagement_rate: number | null;
  post_count: number | null;
  source: string;
  
  // Delta compared to previous snapshot
  delta_followers?: number;
  delta_followers_percent?: number;
  delta_views?: number;
  delta_views_percent?: number;
  delta_engagement?: number;
  delta_engagement_percent?: number;
  change_classification?: 'NORMAL' | 'SIGNIFICANT' | 'MAJOR' | 'BREAKOUT';
}

export interface IntelligenceEvent {
  id: string;
  userId: string;
  type: 
    | 'FOLLOWER_GROWTH' 
    | 'FOLLOWER_LOSS' 
    | 'ENGAGEMENT_SURGE' 
    | 'VIRAL_CONTENT' 
    | 'REACH_SPIKE' 
    | 'VIEW_SPIKE' 
    | 'AUDIENCE_SHIFT' 
    | 'PERFORMANCE_DECLINE'
    | 'PERMISSION_WARNING';
  platform: SupportedSocialPlatform;
  source: string;
  change: string; // e.g. "+100%", "+5,000 followers", "Engagement 4.2% -> 8.1%"
  previous_value: string | number;
  current_value: string | number;
  description: string;
  timestamp: string;
  detected_at: string;
  acknowledged: boolean;
}

export interface SocialContentRecord {
  id: string;
  userId: string;
  platform: SupportedSocialPlatform;
  content_id: string;
  url: string | null;
  published_date: string;
  content_type: 'video' | 'short' | 'reel' | 'photo' | 'carousel' | 'post' | 'tweet' | 'article';
  title_or_caption: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  reach: number | null;
  impressions: number | null;
  watch_time_seconds: number | null;
  engagement_rate: number | null;
  performance_score: number | null; // 0 - 100 relative to creator baseline
}

export interface RateCardCalculation {
  previousRecommendedRate: number;
  newRecommendedRate: number;
  rateRange: { min: number; max: number };
  changePercentage: number;
  reasons: string[];
  supportingMetrics: {
    followerCount: number;
    averageViews: number;
    engagementRate: number;
    growthVelocity: number;
  };
  confidence: number; // 0 - 100
  lastUpdated: string;
}

export interface UnifiedSocialAnalytics {
  totalAudience: number;
  totalReach: number;
  totalViews: number;
  averageEngagementRate: number;
  monthlyGrowthPercent: number;
  topPlatform: SupportedSocialPlatform | null;
  fastestGrowingPlatform: SupportedSocialPlatform | null;
  bestContentFormat: string | null;
  creatorValueScore: number; // 0 - 100
  connectedPlatformsCount: number;
  lastSyncedTimestamp: string | null;
  dataSources: {
    platform: SupportedSocialPlatform;
    isVerified: boolean;
    sourceName: string;
    lastSync: string;
  }[];
}
