-- 0004_init_chat_memory.sql
-- Chat and Memory Management System

BEGIN;

-- chat_session_v2: Enhanced chat session tracking
CREATE TABLE chat_session_v2 (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account_v2(account_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child_profile_v2(child_id) ON DELETE CASCADE,
    calendar_id UUID REFERENCES advent_calendar_v2(calendar_id) ON DELETE SET NULL,
    session_token TEXT UNIQUE NOT NULL,
    persona_used TEXT NOT NULL,
    total_messages INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- chat_message_v2: Enhanced message storage
CREATE TABLE chat_message_v2 (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_session_v2(session_id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('child', 'parent_agent', 'system')),
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice')),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    token_count INT,
    processing_time_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- memory_fragment: Short-term memory storage
CREATE TABLE memory_fragment (
    fragment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_session_v2(session_id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES child_profile_v2(child_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    importance_score DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- memory_embedding: Long-term memory with vector embeddings
CREATE TABLE memory_embedding (
    embedding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child_profile_v2(child_id) ON DELETE CASCADE,
    content_hash TEXT NOT NULL,
    content_preview TEXT NOT NULL,
    embedding_vector VECTOR(1536), -- OpenAI ada-002 dimensions
    source_type TEXT NOT NULL CHECK (source_type IN ('chat_message', 'calendar_day', 'manual_entry')),
    source_id UUID NOT NULL,
    relevance_score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    access_count INT NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 year')
);

-- Indexes for performance
CREATE INDEX idx_chat_session_account ON chat_session_v2(account_id);
CREATE INDEX idx_chat_session_child ON chat_session_v2(child_id);
CREATE INDEX idx_chat_session_token ON chat_session_v2(session_token);
CREATE INDEX idx_chat_message_session_time ON chat_message_v2(session_id, created_at);
CREATE INDEX idx_memory_fragment_session_recent ON memory_fragment(session_id, created_at DESC);
CREATE INDEX idx_memory_embedding_child_vector ON memory_embedding USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_memory_embedding_child_content ON memory_embedding(child_id, content_hash);

COMMIT;