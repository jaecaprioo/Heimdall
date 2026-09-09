export interface CreatorProfile {
  userId: string;
  fullName: string;
  creatorName: string;
  bio: string;
  country: string;
  niches: string[]; // e.g. ["Tech", "Lifestyle", "Fitness"]
  services: string[]; // e.g. ["UGC Video", "Dedicated YouTube Video", "Instagram Reel"]
  basePricing: { [key: string]: number }; // e.g. { "UGC Video": 250, "Instagram Reel": 200 }
  portfolioUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  followersCount?: { [key: string]: any }; // e.g. { instagram: "50k", tiktok: "120k", youtube: "15k" }
}

export interface Brand {
  id: string;
  name: string;
  website: string;
  industry: string;
  category: string;
  country: string;
  creatorProgramPage?: string;
  partnershipPage?: string;
  publicMarketingContact?: string;
  publicPartnershipContact?: string;
  instagram?: string;
  linkedin?: string;
  notes?: string;
}

export interface SavedBrand {
  id: string;
  userId: string;
  brandId: string;
  brandName: string;
  savedAt: string; // ISO string
  brandDetail: Brand;
}

export type CRMStage =
  | 'Saved'
  | 'Contacted'
  | 'Waiting'
  | 'Replied'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export interface CRMOpportunity {
  id: string;
  userId: string;
  brandId: string;
  brandName: string;
  website: string;
  industry: string;
  stage: CRMStage;
  dealValue: number;
  contactPerson?: string;
  contactEmail?: string;
  notes: string;
  followUpDate?: string; // YYYY-MM-DD
  updatedAt: string;
}

export interface OutreachContent {
  id: string;
  userId: string;
  brandId: string;
  brandName: string;
  subjectLine: string;
  emailBody: string;
  instagramDm: string;
  linkedinMessage: string;
  followUpEmail: string;
  createdAt: string;
}

export interface CampaignContent {
  id: string;
  userId: string;
  brandId: string;
  brandName: string;
  title: string;
  concepts: {
    id: string;
    title: string;
    description: string;
    hooks: string[];
    callToAction: string;
  }[];
  storyboards: {
    id: string;
    sceneNumber: number;
    visualDescription: string;
    audioVoiceover: string;
    shotType: string;
    duration: string;
  }[];
  shotLists: string[];
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  mediaType: 'video' | 'image' | 'link';
  mediaUrl: string;
  tags: string[];
  brandPartner?: string;
  testimonial?: {
    author: string;
    role: string;
    text: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'recommendation';
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    type: 'pitch' | 'research' | 'campaign' | 'discovery';
    params: any;
  }[];
}

export type PlatformId = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook' | 'linkedin' | 'twitch' | 'threads';

export interface SocialAccount {
  id: string;
  userId: string;
  platform: PlatformId;
  accountId: string;
  username: string;
  displayName?: string;
  profileUrl: string;
  profileImage: string;
  followerCount: number;
  followingCount?: number;
  postsCount?: number;
  videoCount?: number;
  subscriberCount?: number;
  engagementRate: number; // e.g. 5.4 for 5.4%
  reach: number;
  impressions: number;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  watchTimeHours?: number;
  category: string;
  audienceDemographics?: {
    topCountries: { country: string; percentage: number }[];
    ageGroups?: { range: string; percentage: number }[];
    genderSplit?: { male: number; female: number; other: number };
  };
  lastSyncTimestamp: string; // ISO string
  connectionStatus: 'connected' | 'syncing' | 'permission_required' | 'expired' | 'error' | 'disconnected' | 'not_configured' | 'needs_reauth';
  authType: 'oauth' | 'manual_entry' | 'csv_import' | 'screenshot_import';
  historicalGrowthRate?: number;
  dataSource?: string;
  isVerified?: boolean;
  permissionStatus?: 'full_verified' | 'limited_basic' | 'analytics_restricted' | 'expired';
  missingPermissions?: string[];
}

export interface SocialMetricsSnapshot {
  id: string;
  userId: string;
  platform: PlatformId | 'all';
  timestamp: string; // ISO string
  dateLabel: string; // e.g. "Aug 15"
  followerCount: number;
  engagementRate: number;
  averageViews: number;
  reach: number;
  impressions: number;
  source: string; // e.g. "Instagram Official OAuth", "Manual Confirmed", "Simulated Breakout"
  changeClassification?: 'NORMAL' | 'SIGNIFICANT' | 'MAJOR' | 'BREAKOUT';
  deltaFollowers?: number;
  deltaViews?: number;
  deltaEngagement?: number;
  notes?: string;
}

export interface UnifiedCreatorMetrics {
  totalFollowers: number;
  primaryAudience: string[];
  averageEngagement: number;
  averageViews: number;
  totalMonthlyReach: number;
  growthRate30d: number; // e.g. 34.5%
  growthVelocity: number; // followers gained per day/week
  topPerformingPlatform: PlatformId;
  topPerformingContent: {
    title: string;
    platform: PlatformId;
    views: number;
    engagement: number;
    format: string;
    url?: string;
  }[];
  audienceQualityScore: number; // 0 - 100
  creatorAuthorityScore: number; // 0 - 100
  commercialPotentialScore: number; // 0 - 100
  estimatedCommercialValue: number; // calculated $ value
  lastRecalculatedAt: string;
}

export interface RateCardServiceItem {
  id: string;
  serviceKey: string; // e.g. "instagram_reel", "tiktok_video", "youtube_integration", "ugc_video"
  name: string;
  platform: PlatformId | 'multi' | 'ugc';
  deliverableType: 'Reel' | 'Video' | 'Short' | 'Post' | 'Story' | 'UGC' | 'Bundle' | 'Retainer' | 'Integration';
  currentPrice: number;
  previousPrice: number;
  recommendedPrice: number;
  priceChangePercentage: number;
  pricingRationale: string;
  confidenceScore: number; // 0 - 100%
  lastUpdated: string;
  status: 'active' | 'pending_approval' | 'rejected';
  marketBenchmarkRange?: { min: number; max: number };
}

export interface RateCardProposal {
  id: string;
  userId: string;
  detectedChangeType: 'NORMAL' | 'SIGNIFICANT' | 'MAJOR' | 'BREAKOUT';
  triggerEvent: string;
  detectedAt: string;
  sourcePlatform: PlatformId | 'multi';
  metricsSummary: {
    oldFollowers: number;
    newFollowers: number;
    oldViews: number;
    newViews: number;
    oldEngagement: number;
    newEngagement: number;
  };
  services: {
    serviceKey: string;
    name: string;
    platform?: PlatformId | 'multi' | 'ugc';
    deliverableType?: string;
    oldPrice: number;
    newRecommendedPrice: number;
    changePercent: number;
    reason: string;
    confidenceScore?: number;
  }[];
  geminiAnalysis: string;
  status: 'pending' | 'accepted' | 'edited' | 'rejected';
  nicheEvolutionRecommendation?: {
    currentNiches: string[];
    suggestedNiches: string[];
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  timestamp: string;
  eventType: 'sync' | 'rate_recalculation' | 'rate_accepted' | 'rate_edited' | 'rate_rejected' | 'account_connected' | 'portfolio_updated' | 'niche_updated';
  source: string;
  title: string;
  details: string;
  userAction?: 'Auto-Applied' | 'Accepted' | 'Edited' | 'Rejected' | 'Manual Override' | 'System';
  deltaSummary?: string;
}

export interface RateCardSettings {
  autoUpdateRateCard: boolean;
  autoUpdatePortfolio: boolean;
  autoUpdateMediaKit: boolean;
  changeDetectionSensitivity: 'NORMAL' | 'SIGNIFICANT' | 'MAJOR';
  minRateChangeThreshold: number; // % min change to trigger proposal, e.g. 5%
  enableAiExplanations: boolean;
}

// =========================================================================
// TWO-SIDED ARCHITECTURE: CREATOR & BRAND TYPES
// =========================================================================

export type AppMode = 'creator' | 'brand';

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  tagline: string;
  logo: string;
  website: string;
  industry: string;
  category: string;
  country: string;
  description: string;
  verifiedStatus: boolean;
  trustScore: number;
  paymentReliabilityRating: number; // 0 - 100%
  totalCampaignsRun: number;
  totalCreatorsHired: number;
  totalBudgetDeployed: number;
  preferredNiches: string[];
  targetAudience: {
    ageGroups: string[];
    geography: string[];
    genders: string[];
  };
  creatorProgramUrl?: string;
  contactEmail: string;
  activeCampaignCount: number;
}

export interface CreatorMarketplaceItem {
  id: string;
  creatorName: string;
  fullName: string;
  avatar: string;
  bio: string;
  country: string;
  niches: string[];
  primaryPlatform: PlatformId;
  totalFollowers: number;
  engagementRate: number;
  averageViews: number;
  startingPrice: number;
  matchScore: number;
  matchReasons: string[];
  trustScore: number;
  hasVerifiedTelemetry: boolean;
  services: { name: string; price: number; type: string }[];
  audienceTopCountries: string[];
}

export type DealStage = 
  | 'Discovery'
  | 'Offer'
  | 'Negotiation'
  | 'Contract'
  | 'Payment'
  | 'Content'
  | 'Approval'
  | 'Publishing'
  | 'Analytics'
  | 'Completion';

export interface DealDeliverable {
  id: string;
  title: string;
  platform: PlatformId | 'multi' | 'ugc';
  type: string;
  dueDate: string;
  status: 'pending' | 'in_production' | 'submitted_for_review' | 'revision_requested' | 'approved' | 'published';
  price: number;
  draftUrl?: string;
  liveUrl?: string;
  feedbackNotes?: string;
}

export interface ScopeCreepAlert {
  id: string;
  detectedAt: string;
  sourceMessage: string;
  originalDeliverablesSummary: string;
  detectedNewScope: string;
  recommendedFee: number;
  impactAnalysis: string;
  status: 'active' | 'negotiated' | 'accepted' | 'dismissed';
}

export interface DealRoom {
  id: string;
  dealTitle: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  totalBudget: number;
  currentStage: DealStage;
  deliverables: DealDeliverable[];
  scopeCreepAlerts: ScopeCreepAlert[];
  contractSummary?: {
    paymentTerms: string;
    usageRights: string;
    whitelistingDuration: string;
    exclusivityTerms: string;
    ipOwnership: string;
    contractSigned: boolean;
    contractFileUrl?: string;
  };
  paymentStatus: 'unfunded' | 'in_escrow' | 'milestone_released' | 'fully_paid';
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'creator' | 'brand' | 'system';
    content: string;
    timestamp: string;
    attachmentUrl?: string;
  }[];
  campaignMilestones: {
    title: string;
    status: 'completed' | 'in_progress' | 'upcoming';
    date: string;
  }[];
  finalAnalytics?: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    roiScore: number;
    completedAt: string;
  };
  updatedAt: string;
  createdAt: string;
}

export interface ContractAnalysis {
  id: string;
  contractTitle: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0 - 100 (100 = highest risk)
  executiveSummary: string;
  clauses: {
    category: 'Payment Terms' | 'Usage Rights' | 'Whitelisting' | 'Exclusivity' | 'Duration & Territory' | 'Deliverables & Revisions' | 'Cancellation & Kill Fees' | 'IP Ownership' | 'Liability & Indemnity';
    extractedText: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    explanation: string;
    recommendedAdjustment: string;
  }[];
  paymentTerms: string;
  usageRights: string;
  whitelisting: string;
  exclusivity: string;
  duration: string;
  territory: string;
  deliverables: string;
  revisions: string;
  cancellation: string;
  killFees: string;
  ipOwnership: string;
  liability: string;
  disclaimer: string;
}

export type NegotiationTone = 'Professional' | 'Confident' | 'Firm' | 'Relationship-first';

export interface NegotiationOption {
  tone: NegotiationTone;
  strategyName: string;
  subject: string;
  emailBody: string;
  proposedCounterPrice: number;
  adjustedTerms: string[];
  rationale: string;
}

export interface NegotiationResult {
  id: string;
  brandName: string;
  originalOfferPrice: number;
  recommendedCounterPrice: number;
  fairPriceRange: { min: number; max: number };
  dealHealthScore: number; // 0 - 100
  options: NegotiationOption[];
}

export interface OpportunityEvaluation {
  id: string;
  targetName: string;
  entityType: 'brand' | 'creator';
  evaluationType: 'creator_evaluating_brand' | 'brand_evaluating_creator';
  overallMatchScore: number; // 0 - 100
  worthWorkingWithVerdict: 'STRONGLY RECOMMENDED' | 'VIABLE WITH COUNTERTERMS' | 'CAUTION ADVISED' | 'HIGH RISK / DECLINE';
  verdictSummary: string;
  fitScore: number;
  estimatedValue: number;
  fairPrice: number;
  campaignComplexity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  usageRightsAssessment: string;
  exclusivityImpact: string;
  paymentTermsRisk: string;
  dealHealthMetric: number;
  strengths: string[];
  risksAndWatchouts: string[];
  recommendedNextStep: string;
}

export interface ReputationPassport {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'creator' | 'brand';
  avatar: string;
  trustScore: number; // 0 - 100
  trustTier: 'Elite' | 'Verified Partner' | 'Standard' | 'Insufficient History';
  hasInsufficientHistory: boolean;
  totalCompletedDeals: number;
  campaignCompletionRate: number; // e.g. 98.5%
  onTimeDeliveryRate: number; // e.g. 96.0%
  paymentReliabilityScore: number; // e.g. 100%
  repeatPartnershipRate: number; // e.g. 42%
  disputeRate: number; // e.g. 0.0%
  averageResponseTimeHours: number; // e.g. 1.8 hrs
  verifiedTelemetryAccuracy: number; // e.g. 100%
  verifiedSignals: {
    label: string;
    score: number;
    verified: boolean;
    description: string;
  }[];
  reviews: {
    id: string;
    authorName: string;
    authorRole: 'Brand Partner' | 'Creator';
    rating: number; // 1 - 5
    campaignTitle: string;
    comment: string;
    date: string;
    verifiedDeal: boolean;
  }[];
}

export interface CampaignAutopsy {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  totalBudget: number;
  actualSpend: number;
  creatorsEngaged: number;
  totalDeliverablesCompleted: number;
  totalImpressions: number;
  totalReach: number;
  totalEngagements: number;
  averageEngagementRate: number;
  costPerView: number;
  costPerEngagement: number;
  roiScore: number;
  whatWorked: string[];
  whatDidnt: string[];
  topPerformingCreators: {
    name: string;
    avatar: string;
    platform: PlatformId;
    views: number;
    engagementRate: number;
    costEfficiencyScore: number;
    recommendForFuture: boolean;
  }[];
  bestPerformingPlatform: string;
  recommendationsForNextCampaign: string[];
  reactivationOpportunities: {
    creatorId: string;
    creatorName: string;
    reason: string;
    proposedAngle: string;
    suggestedBudget: number;
    priority: 'HIGH' | 'MEDIUM';
  }[];
}

export type ThemeId = 'pearl-mist' | 'amber-hearth' | 'aurora-sage' | 'obsidian-void' | 'cyber-slate';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  subtitle: string;
  sourceImageRef: string;
  mode: 'light' | 'dark';
  previewColors: string[];
  description: string;
}


