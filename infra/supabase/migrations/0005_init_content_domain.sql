-- 0005_init_content_domain.sql
-- Content and Media Management

BEGIN;

-- media_asset: Centralized media asset management
CREATE TABLE media_asset (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('photo', 'voice', 'music', 'video')),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes INT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    signed_url_expires_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update child_profile_v2 with media asset FK
ALTER TABLE child_profile_v2 ADD CONSTRAINT fk_child_hero_photo
    FOREIGN KEY (hero_photo_asset_id) REFERENCES media_asset(asset_id) ON DELETE SET NULL;

-- Update calendar_day_v2 with media asset FKs
ALTER TABLE calendar_day_v2 ADD CONSTRAINT fk_day_photo
    FOREIGN KEY (photo_asset_id) REFERENCES media_asset(asset_id) ON DELETE SET NULL;
ALTER TABLE calendar_day_v2 ADD CONSTRAINT fk_day_voice
    FOREIGN KEY (voice_asset_id) REFERENCES media_asset(asset_id) ON DELETE SET NULL;
ALTER TABLE calendar_day_v2 ADD CONSTRAINT fk_day_music
    FOREIGN KEY (music_asset_id) REFERENCES media_asset(asset_id) ON DELETE SET NULL;

-- surprise_collection_v2: Enhanced surprise content management
CREATE TABLE surprise_collection_v2 (
    collection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES advent_calendar_v2(calendar_id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Surprise Videos',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One collection per calendar
CREATE UNIQUE INDEX idx_surprise_collection_calendar_unique ON surprise_collection_v2(calendar_id);

-- surprise_video: Individual YouTube video entries
CREATE TABLE surprise_video (
    video_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES surprise_collection_v2(collection_id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration_seconds INT,
    view_count INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_media_asset_account ON media_asset(account_id);
CREATE INDEX idx_media_asset_type ON media_asset(asset_type);
CREATE INDEX idx_surprise_video_collection_order ON surprise_video(collection_id, sort_order);

COMMIT;