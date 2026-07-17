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
