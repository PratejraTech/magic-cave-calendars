-- 0001_init_account_child_calendar.sql
-- Core entities: account, child, calendar, calendar_day

BEGIN;

-- Enable UUID generation if not already enabled (Supabase usually has pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. account
CREATE TABLE IF NOT EXISTS account (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    plan TEXT NULL,
    settings_json JSONB NULL
);

-- 2. child
-- One account -> one child (enforced by UNIQUE(account_id))
CREATE TABLE IF NOT EXISTS child (
    child_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,

    child_name TEXT NOT NULL,
    hero_photo_url TEXT NULL,

    chat_persona TEXT NOT NULL CHECK (chat_persona IN ('mummy', 'daddy', 'custom')),
    custom_chat_prompt TEXT NULL,

    theme TEXT NOT NULL DEFAULT 'snow',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce 1:1 mapping between account and child
CREATE UNIQUE INDEX IF NOT EXISTS idx_child_account_unique ON child(account_id);

-- 3. calendar
CREATE TABLE IF NOT EXISTS calendar (
    calendar_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child(child_id) ON DELETE CASCADE,

    share_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    year INT NOT NULL, -- e.g., 2025 for Dec 2025

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: one calendar per child per year
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_child_year_unique
ON calendar(child_id, year);

CREATE INDEX IF NOT EXISTS idx_calendar_child_id ON calendar(child_id);

-- 4. calendar_day
CREATE TABLE IF NOT EXISTS calendar_day (
    calendar_day_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendar(calendar_id) ON DELETE CASCADE,

    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 24),
    photo_url TEXT NULL,
    text_content TEXT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure only one row per (calendar, day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_day_unique
ON calendar_day(calendar_id, day_number);

COMMIT;