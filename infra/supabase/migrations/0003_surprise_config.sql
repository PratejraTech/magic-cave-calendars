-- 0003_surprise_config.sql
-- Surprise configuration with array of YouTube URLs

BEGIN;

-- 1. surprise_config
-- One record per calendar containing an array of YouTube URLs
CREATE TABLE IF NOT EXISTS surprise_config (
    surprise_config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendar(calendar_id) ON DELETE CASCADE,

    youtube_urls TEXT[] NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure only one surprise config per calendar
CREATE UNIQUE INDEX IF NOT EXISTS idx_surprise_config_calendar_unique
ON surprise_config(calendar_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_surprise_config_updated_at
    BEFORE UPDATE ON surprise_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;