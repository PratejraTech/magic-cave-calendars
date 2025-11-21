-- 0003_surprise_config.sql
-- Surprise configuration: array of YouTube URLs per calendar

BEGIN;

CREATE TABLE IF NOT EXISTS surprise_config (
    calendar_id UUID PRIMARY KEY REFERENCES calendar(calendar_id) ON DELETE CASCADE,

    youtube_urls TEXT[] NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
