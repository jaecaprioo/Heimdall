-- Supabase PostgreSQL Schema for Heimdall
-- Copy and paste this script into your Supabase SQL Editor to initialize all tables and security policies.

-- 1. CREATOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS "creator_profiles" (
  "userId" TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "creatorName" TEXT,
  "bio" TEXT,
  "country" TEXT,
  "niches" JSONB DEFAULT '[]'::jsonb,
  "services" JSONB DEFAULT '[]'::jsonb,
  "basePricing" JSONB DEFAULT '{}'::jsonb,
  "portfolioUrl" TEXT,
  "instagramUrl" TEXT,
  "tiktokUrl" TEXT,
  "youtubeUrl" TEXT,
  "linkedinUrl" TEXT,
  "followersCount" JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE "creator_profiles" ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own profile" ON "creator_profiles"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 2. SAVED BRANDS TABLE
CREATE TABLE IF NOT EXISTS "saved_brands" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "brandId" TEXT NOT NULL,
  "brandName" TEXT NOT NULL,
  "savedAt" TEXT NOT NULL,
  "brandDetail" JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE "saved_brands" ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own saved brands" ON "saved_brands"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 3. CRM PIPELINE TABLE
CREATE TABLE IF NOT EXISTS "crm_pipeline" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "brandId" TEXT NOT NULL,
  "brandName" TEXT NOT NULL,
  "website" TEXT,
  "industry" TEXT,
  "stage" TEXT NOT NULL DEFAULT 'Saved',
  "dealValue" INTEGER DEFAULT 500,
  "contactPerson" TEXT,
  "contactEmail" TEXT,
  "notes" TEXT DEFAULT '',
  "followUpDate" TEXT,
  "updatedAt" TEXT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE "crm_pipeline" ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own crm pipeline" ON "crm_pipeline"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 4. PORTFOLIO TABLE
CREATE TABLE IF NOT EXISTS "portfolio" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT DEFAULT '',
  "mediaType" TEXT NOT NULL DEFAULT 'link',
  "mediaUrl" TEXT NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb,
  "brandPartner" TEXT DEFAULT '',
  "testimonial" JSONB DEFAULT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE "portfolio" ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own portfolio items" ON "portfolio"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "read" BOOLEAN DEFAULT FALSE,
  "createdAt" TEXT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own notifications" ON "notifications"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 6. CONNECTED SOCIAL ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS "social_accounts" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "platform" TEXT NOT NULL, -- 'instagram', 'tiktok', 'youtube', 'x', 'linkedin', etc.
  "accountId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "profileUrl" TEXT,
  "profileImage" TEXT,
  "followerCount" INTEGER DEFAULT 0,
  "followingCount" INTEGER DEFAULT 0,
  "postsCount" INTEGER DEFAULT 0,
  "engagementRate" NUMERIC(5,2) DEFAULT 0.0,
  "reach" INTEGER DEFAULT 0,
  "impressions" INTEGER DEFAULT 0,
  "averageViews" INTEGER DEFAULT 0,
  "averageLikes" INTEGER DEFAULT 0,
  "averageComments" INTEGER DEFAULT 0,
  "averageShares" INTEGER DEFAULT 0,
  "category" TEXT DEFAULT 'General',
  "audienceDemographics" JSONB DEFAULT '{}'::jsonb,
  "lastSyncTimestamp" TEXT NOT NULL,
  "connectionStatus" TEXT DEFAULT 'connected',
  "authType" TEXT DEFAULT 'oauth',
  "historicalGrowthRate" NUMERIC(5,2) DEFAULT 0.0
);

ALTER TABLE "social_accounts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own social accounts" ON "social_accounts"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 7. SOCIAL METRICS SNAPSHOTS TABLE (Historical Snapshots for Tracking Growth)
CREATE TABLE IF NOT EXISTS "social_metrics_snapshots" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "timestamp" TEXT NOT NULL,
  "dateLabel" TEXT NOT NULL,
  "followerCount" INTEGER NOT NULL,
  "engagementRate" NUMERIC(5,2) NOT NULL,
  "averageViews" INTEGER NOT NULL,
  "reach" INTEGER DEFAULT 0,
  "impressions" INTEGER DEFAULT 0,
  "source" TEXT NOT NULL,
  "changeClassification" TEXT DEFAULT 'NORMAL', -- 'NORMAL', 'SIGNIFICANT', 'MAJOR', 'BREAKOUT'
  "deltaFollowers" INTEGER DEFAULT 0,
  "deltaViews" INTEGER DEFAULT 0,
  "deltaEngagement" NUMERIC(5,2) DEFAULT 0.0,
  "notes" TEXT
);

ALTER TABLE "social_metrics_snapshots" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own snapshots" ON "social_metrics_snapshots"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 8. DYNAMIC RATE CARDS TABLE
CREATE TABLE IF NOT EXISTS "rate_cards" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "serviceKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "deliverableType" TEXT NOT NULL,
  "currentPrice" INTEGER NOT NULL,
  "previousPrice" INTEGER NOT NULL,
  "recommendedPrice" INTEGER NOT NULL,
  "priceChangePercentage" NUMERIC(5,2) DEFAULT 0.0,
  "pricingRationale" TEXT NOT NULL,
  "confidenceScore" INTEGER DEFAULT 95,
  "lastUpdated" TEXT NOT NULL,
  "status" TEXT DEFAULT 'active',
  "marketBenchmarkRange" JSONB DEFAULT '{"min": 100, "max": 1000}'::jsonb
);

ALTER TABLE "rate_cards" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own rate cards" ON "rate_cards"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 9. RATE CARD PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS "rate_card_proposals" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "detectedChangeType" TEXT NOT NULL,
  "triggerEvent" TEXT NOT NULL,
  "detectedAt" TEXT NOT NULL,
  "sourcePlatform" TEXT NOT NULL,
  "metricsSummary" JSONB NOT NULL,
  "services" JSONB NOT NULL,
  "geminiAnalysis" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'edited', 'rejected'
  "nicheEvolutionRecommendation" JSONB DEFAULT NULL
);

ALTER TABLE "rate_card_proposals" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own proposals" ON "rate_card_proposals"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");


-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "timestamp" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "userAction" TEXT,
  "deltaSummary" TEXT
);

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own audit logs" ON "audit_logs"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

