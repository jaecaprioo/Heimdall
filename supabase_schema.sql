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
