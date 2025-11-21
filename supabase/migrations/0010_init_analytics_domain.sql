-- 0006_init_analytics_domain.sql
-- Structured Analytics System

BEGIN;

-- calendar_analytics: Calendar-specific events
CREATE TABLE calendar_analytics (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES advent_calendar_v2(calendar_id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child_profile_v2(child_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('calendar_view', 'calendar_share', 'calendar_publish', 'calendar_unpublish')),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- day_analytics: Day-specific events
CREATE TABLE day_analytics (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID NOT NULL REFERENCES calendar_day_v2(day_id) ON DELETE CASCADE,
    calendar_id UUID NOT NULL REFERENCES advent_calendar_v2(calendar_id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('day_open', 'day_view', 'day_share')),
    time_to_open_seconds INT,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- chat_analytics: Chat-specific events
CREATE TABLE chat_analytics (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_session_v2(session_id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child_profile_v2(child_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('chat_start', 'message_sent', 'chat_end', 'persona_switch')),
    message_count INT,
    session_duration_seconds INT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_engagement: User engagement metrics
CREATE TABLE user_engagement (
    engagement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child_profile_v2(child_id) ON DELETE CASCADE,
    engagement_type TEXT NOT NULL CHECK (engagement_type IN ('daily_visit', 'weekly_active', 'monthly_active', 'feature_usage')),
    engagement_score DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    streak_days INT NOT NULL DEFAULT 0,
    last_engagement_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for analytics performance
CREATE INDEX idx_calendar_analytics_calendar_time ON calendar_analytics(calendar_id, created_at);
CREATE INDEX idx_day_analytics_day_time ON day_analytics(day_id, created_at);
CREATE INDEX idx_chat_analytics_session_time ON chat_analytics(session_id, created_at);
CREATE INDEX idx_user_engagement_account_type ON user_engagement(account_id, engagement_type);

COMMIT;