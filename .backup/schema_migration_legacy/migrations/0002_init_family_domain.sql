-- 0002_init_family_domain.sql
-- Family and Child Profile Management

BEGIN;

-- child_profile_v2: Enhanced child profile with better validation
CREATE TABLE child_profile_v2 (
    child_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    child_name TEXT NOT NULL CHECK (length(child_name) >= 1 AND length(child_name) <= 100),
    display_name TEXT CHECK (length(display_name) <= 50),
    date_of_birth DATE,
    hero_photo_asset_id UUID, -- FK to media_asset added later
    chat_persona TEXT NOT NULL CHECK (chat_persona IN ('mummy', 'daddy', 'custom')),
    custom_persona_prompt TEXT,
    theme TEXT NOT NULL DEFAULT 'snow' CHECK (theme IN ('snow', 'forest', 'candy', 'stars')),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce 1:1 account-child relationship
CREATE UNIQUE INDEX idx_child_profile_account_unique ON child_profile_v2(account_id);

-- family_settings: Family-level preferences and privacy
CREATE TABLE family_settings (
    family_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child_profile_v2(child_id) ON DELETE CASCADE,
    privacy_level TEXT NOT NULL DEFAULT 'family' CHECK (privacy_level IN ('private', 'family', 'public')),
    content_filter_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    analytics_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    backup_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_child_profile_account ON child_profile_v2(account_id);
CREATE UNIQUE INDEX idx_family_settings_unique ON family_settings(account_id, child_id);

COMMIT;