-- 0003_init_calendar_domain.sql
-- Calendar and Day Management

BEGIN;

-- advent_calendar_v2: Enhanced calendar with better features
CREATE TABLE advent_calendar_v2 (
    calendar_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child_profile_v2(child_id) ON DELETE CASCADE,
    template_id UUID, -- FK to calendar_template added later
    share_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    public_slug TEXT UNIQUE,
    title TEXT NOT NULL DEFAULT 'Advent Calendar',
    description TEXT,
    year INT NOT NULL CHECK (year >= 2024 AND year <= 2030),
    theme TEXT NOT NULL DEFAULT 'snow',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lock_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One calendar per child per year
CREATE UNIQUE INDEX idx_calendar_child_year_unique ON advent_calendar_v2(child_id, year);

-- calendar_day_v2: Enhanced day structure matching frontend types
CREATE TABLE calendar_day_v2 (
    day_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES advent_calendar_v2(calendar_id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 24),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    photo_asset_id UUID, -- FK to media_asset added later
    voice_asset_id UUID, -- FK to media_asset added later
    music_asset_id UUID, -- FK to media_asset added later
    confetti_type TEXT CHECK (confetti_type IN ('snow', 'stars', 'candy', 'reindeer')),
    unlock_effect TEXT CHECK (unlock_effect IN ('fireworks', 'snowstorm', 'aurora', 'gingerbread')),
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    opened_at TIMESTAMPTZ,
    opened_by_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One day per calendar per day number
CREATE UNIQUE INDEX idx_calendar_day_unique ON calendar_day_v2(calendar_id, day_number);

-- Indexes for performance
CREATE INDEX idx_calendar_account ON advent_calendar_v2(account_id);
CREATE INDEX idx_calendar_child ON advent_calendar_v2(child_id);
CREATE INDEX idx_calendar_published ON advent_calendar_v2(is_published);
CREATE INDEX idx_day_calendar_opened ON calendar_day_v2(calendar_id, is_opened);

COMMIT;