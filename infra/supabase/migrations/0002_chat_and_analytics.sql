-- 0002_chat_and_analytics.sql
-- Chat records, chat messages, analytics events

BEGIN;

-- 1. chat_record
CREATE TABLE IF NOT EXISTS chat_record (
    chat_record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child(child_id) ON DELETE CASCADE,

    session_id TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_record_child_id_created_at
ON chat_record(child_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_record_session_id
ON chat_record(session_id);

-- 2. chat_message
CREATE TABLE IF NOT EXISTS chat_message (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_record_id UUID NOT NULL REFERENCES chat_record(chat_record_id) ON DELETE CASCADE,

    sender TEXT NOT NULL CHECK (sender IN ('child', 'parent_agent')),
    message_text TEXT NOT NULL,

    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_message_chat_record_id_timestamp
ON chat_message(chat_record_id, timestamp);

-- 3. analytics_event
CREATE TABLE IF NOT EXISTS analytics_event (
    analytics_event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,

    child_id UUID NULL REFERENCES child(child_id) ON DELETE SET NULL,
    calendar_id UUID NULL REFERENCES calendar(calendar_id) ON DELETE SET NULL,

    event_type TEXT NOT NULL,
    event_payload JSONB NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_account_created_at
ON analytics_event(account_id, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_calendar_created_at
ON analytics_event(calendar_id, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type_created_at
ON analytics_event(event_type, created_at);

COMMIT;