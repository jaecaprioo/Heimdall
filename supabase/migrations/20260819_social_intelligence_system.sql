-- =========================================================================
-- HEIMDALL SOCIAL MEDIA INTELLIGENCE API SYSTEM SCHEMA (POSTGRES / SUPABASE)
-- =========================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SOCIAL CONNECTIONS TABLE (OAuth credentials, refresh tokens, status)
CREATE TABLE IF NOT EXISTS public.social_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'x', 'facebook', 'linkedin')),
    platform_user_id TEXT NOT NULL,
    platform_username TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ NOT NULL,
    granted_scopes TEXT NOT NULL,
    connection_status TEXT NOT NULL DEFAULT 'connected' CHECK (connection_status IN ('connected', 'syncing', 'permission_required', 'expired', 'error', 'disconnected')),
    last_synced_at TIMESTAMPTZ,
    last_error_code TEXT,
    last_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- 2. SOCIAL PROFILES TABLE (Normalized current verified creator profile)
CREATE TABLE IF NOT EXISTS public.social_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    platform TEXT NOT NULL,
    platform_user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    display_name TEXT NOT NULL,
    profile_url TEXT,
    profile_image TEXT,
    verified_status BOOLEAN DEFAULT FALSE,
    account_type TEXT CHECK (account_type IN ('personal', 'creator', 'business', 'organization')),
    followers BIGINT,
    following BIGINT,
    subscriber_count BIGINT,
    video_count BIGINT,
    post_count BIGINT,
    total_likes BIGINT,
    total_views BIGINT,
    reach BIGINT,
    impressions BIGINT,
    average_views BIGINT,
    watch_time_hours BIGINT,
    engagement_rate NUMERIC(5,2),
    audience_demographics JSONB,
    permission_status TEXT DEFAULT 'full_verified' CHECK (permission_status IN ('full_verified', 'limited_basic', 'analytics_restricted', 'expired')),
    missing_permissions TEXT[],
    data_source TEXT NOT NULL,
    data_timestamp TIMESTAMPTZ NOT NULL,
    last_synced TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- 3. SOCIAL METRIC SNAPSHOTS TABLE (Immutable historical time-series ledger)
CREATE TABLE IF NOT EXISTS public.social_metric_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    platform TEXT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    date_label TEXT NOT NULL,
    followers BIGINT,
    following BIGINT,
    average_views BIGINT,
    total_views BIGINT,
    reach BIGINT,
    impressions BIGINT,
    engagement_rate NUMERIC(5,2),
    post_count BIGINT,
    source TEXT NOT NULL,
    delta_followers BIGINT DEFAULT 0,
    delta_followers_percent NUMERIC(5,2) DEFAULT 0,
    delta_views BIGINT DEFAULT 0,
    delta_views_percent NUMERIC(5,2) DEFAULT 0,
    delta_engagement NUMERIC(5,2) DEFAULT 0,
    change_classification TEXT DEFAULT 'NORMAL' CHECK (change_classification IN ('NORMAL', 'SIGNIFICANT', 'MAJOR', 'BREAKOUT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INTELLIGENCE EVENTS TABLE (Automatic change and surge detection)
CREATE TABLE IF NOT EXISTS public.intelligence_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('FOLLOWER_GROWTH', 'FOLLOWER_LOSS', 'ENGAGEMENT_SURGE', 'VIRAL_CONTENT', 'REACH_SPIKE', 'VIEW_SPIKE', 'AUDIENCE_SHIFT', 'PERFORMANCE_DECLINE', 'PERMISSION_WARNING')),
    platform TEXT NOT NULL,
    source TEXT NOT NULL,
    change TEXT NOT NULL,
    previous_value TEXT NOT NULL,
    current_value TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE
);

-- 5. RATE CARD RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.rate_card_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    previous_rate NUMERIC(10,2) NOT NULL,
    recommended_rate NUMERIC(10,2) NOT NULL,
    min_rate NUMERIC(10,2) NOT NULL,
    max_rate NUMERIC(10,2) NOT NULL,
    change_percentage NUMERIC(5,2) NOT NULL,
    reasons TEXT[] NOT NULL,
    supporting_metrics JSONB NOT NULL,
    confidence_score NUMERIC(5,2) DEFAULT 95.0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'edited', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATOR VALUE SCORES TABLE
CREATE TABLE IF NOT EXISTS public.creator_value_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    audience_score INT,
    engagement_score INT,
    diversification_score INT,
    authority_score INT,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SOCIAL CONTENT & CONTENT PERFORMANCE TABLE
CREATE TABLE IF NOT EXISTS public.social_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    platform TEXT NOT NULL,
    content_id TEXT NOT NULL,
    url TEXT,
    published_date TIMESTAMPTZ NOT NULL,
    content_type TEXT NOT NULL,
    caption TEXT,
    views BIGINT,
    likes BIGINT,
    comments BIGINT,
    shares BIGINT,
    reach BIGINT,
    impressions BIGINT,
    engagement_rate NUMERIC(5,2),
    performance_score INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform, content_id)
);

-- 8. SOCIAL SYNC JOBS & AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.social_sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    platform TEXT NOT NULL,
    sync_type TEXT DEFAULT 'manual' CHECK (sync_type IN ('initial', 'incremental', 'manual', 'scheduled')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'rate_limited')),
    records_updated INT DEFAULT 0,
    error_message TEXT
);

-- Indexes for lightning fast queries and time-series aggregation
CREATE INDEX IF NOT EXISTS idx_social_snapshots_user_platform ON public.social_metric_snapshots(user_id, platform, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_events_user ON public.intelligence_events(user_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_content_user ON public.social_content(user_id, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_social_profiles_user ON public.social_profiles(user_id);

-- Enable Row Level Security (RLS) across all tables
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_card_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_value_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_sync_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Creator can only select and modify their own records
CREATE POLICY "Users can manage their own social connections" ON public.social_connections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social profiles" ON public.social_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own metric snapshots" ON public.social_metric_snapshots
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own intelligence events" ON public.intelligence_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own rate card recommendations" ON public.rate_card_recommendations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own creator value scores" ON public.creator_value_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social content" ON public.social_content
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own sync jobs" ON public.social_sync_jobs
    FOR SELECT USING (auth.uid() = user_id);
