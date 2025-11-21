-- migration_data_transfer.sql
-- Data migration script: Old Schema → New Schema
-- Run this AFTER applying all new schema migrations (0001-0006)

BEGIN;

-- =============================================================================
-- PHASE 1: Migrate Identity & Access Data
-- =============================================================================

-- Migrate accounts to account_v2
INSERT INTO account_v2 (
    account_id,
    email,
    email_verified,
    auth_provider,
    created_at,
    updated_at,
    plan,
    settings,
    preferences,
    is_active
)
SELECT
    account_id,
    email,
    FALSE as email_verified, -- Default to unverified
    'supabase' as auth_provider,
    created_at,
    created_at as updated_at, -- Set updated_at to created_at initially
    COALESCE(plan, 'free') as plan,
    COALESCE(settings_json, '{}') as settings,
    '{}' as preferences, -- Default empty preferences
    TRUE as is_active
FROM account
WHERE NOT EXISTS (
    SELECT 1 FROM account_v2 WHERE account_v2.email = account.email
);

-- =============================================================================
-- PHASE 2: Migrate Family Domain Data
-- =============================================================================

-- Migrate children to child_profile_v2
INSERT INTO child_profile_v2 (
    child_id,
    account_id,
    child_name,
    hero_photo_url, -- Will be migrated to media_asset later
    chat_persona,
    custom_persona_prompt,
    theme,
    created_at,
    updated_at
)
SELECT
    child_id,
    account_id,
    child_name,
    hero_photo_url,
    chat_persona,
    custom_chat_prompt,
    COALESCE(theme, 'snow') as theme,
    created_at,
    created_at as updated_at
FROM child
WHERE NOT EXISTS (
    SELECT 1 FROM child_profile_v2 WHERE child_profile_v2.child_id = child.child_id
);

-- Migrate family settings (create defaults)
INSERT INTO family_settings (
    account_id,
    child_id,
    privacy_level,
    content_filter_enabled,
    analytics_enabled,
    backup_enabled
)
SELECT
    c.account_id,
    c.child_id,
    'family' as privacy_level,
    TRUE as content_filter_enabled,
    TRUE as analytics_enabled,
    FALSE as backup_enabled
FROM child_profile_v2 c
WHERE NOT EXISTS (
    SELECT 1 FROM family_settings fs WHERE fs.account_id = c.account_id AND fs.child_id = c.child_id
);

-- =============================================================================
-- PHASE 3: Migrate Calendar Domain Data
-- =============================================================================

-- Migrate calendars to advent_calendar_v2
INSERT INTO advent_calendar_v2 (
    calendar_id,
    account_id,
    child_id,
    share_uuid,
    title,
    year,
    theme,
    is_published,
    published_at,
    created_at,
    updated_at
)
SELECT
    calendar_id,
    account_id,
    child_id,
    share_uuid,
    'Advent Calendar' as title, -- Default title
    year,
    'snow' as theme, -- Default theme
    is_published,
    CASE WHEN is_published THEN now() ELSE NULL END as published_at,
    created_at,
    created_at as updated_at
FROM calendar
WHERE NOT EXISTS (
    SELECT 1 FROM advent_calendar_v2 WHERE advent_calendar_v2.calendar_id = calendar.calendar_id
);

-- Migrate calendar days to calendar_day_v2
INSERT INTO calendar_day_v2 (
    day_id,
    calendar_id,
    day_number,
    title,
    message,
    photo_url, -- Will be migrated to media_asset later
    text_content,
    is_opened,
    opened_at,
    created_at,
    updated_at
)
SELECT
    calendar_day_id as day_id,
    calendar_id,
    day_number,
    'Day ' || day_number as title, -- Default title
    COALESCE(text_content, 'A special message for you!') as message,
    photo_url,
    text_content,
    FALSE as is_opened, -- Reset opened status for safety
    NULL as opened_at,
    created_at,
    created_at as updated_at
FROM calendar_day
WHERE NOT EXISTS (
    SELECT 1 FROM calendar_day_v2 WHERE calendar_day_v2.day_id = calendar_day.calendar_day_id::uuid
);

-- =============================================================================
-- PHASE 4: Migrate Chat & Memory Data
-- =============================================================================

-- Migrate chat records to chat_session_v2
INSERT INTO chat_session_v2 (
    session_id,
    account_id,
    child_id,
    session_token,
    persona_used,
    total_messages,
    last_activity_at,
    created_at,
    expires_at
)
SELECT
    gen_random_uuid() as session_id, -- Generate new session IDs
    cr.account_id,
    cr.child_id,
    cr.session_id as session_token,
    'mummy' as persona_used, -- Default persona
    COUNT(cm.message_id) as total_messages,
    MAX(cm.timestamp) as last_activity_at,
    cr.created_at,
    cr.created_at + INTERVAL '30 days' as expires_at
FROM chat_record cr
LEFT JOIN chat_message cm ON cr.chat_record_id = cm.chat_record_id
GROUP BY cr.chat_record_id, cr.account_id, cr.child_id, cr.session_id, cr.created_at
HAVING NOT EXISTS (
    SELECT 1 FROM chat_session_v2 WHERE chat_session_v2.session_token = cr.session_id
);

-- Migrate chat messages to chat_message_v2
INSERT INTO chat_message_v2 (
    session_id,
    sender,
    content,
    created_at
)
SELECT
    cs.session_id,
    CASE
        WHEN cm.sender = 'parent_agent' THEN 'parent_agent'
        WHEN cm.sender = 'child' THEN 'child'
        ELSE 'system'
    END as sender,
    cm.message_text as content,
    cm.timestamp as created_at
FROM chat_message cm
JOIN chat_session_v2 cs ON cs.session_token = (
    SELECT cr.session_id FROM chat_record cr WHERE cr.chat_record_id = cm.chat_record_id
)
WHERE NOT EXISTS (
    SELECT 1 FROM chat_message_v2 WHERE chat_message_v2.created_at = cm.timestamp
);

-- =============================================================================
-- PHASE 5: Migrate Content Domain Data
-- =============================================================================

-- Create surprise collections for existing calendars
INSERT INTO surprise_collection_v2 (
    calendar_id,
    title,
    description
)
SELECT
    calendar_id,
    'Surprise Videos' as title,
    'Curated surprise videos for ' || EXTRACT(YEAR FROM now()) as description
FROM advent_calendar_v2
WHERE NOT EXISTS (
    SELECT 1 FROM surprise_collection_v2 WHERE surprise_collection_v2.calendar_id = advent_calendar_v2.calendar_id
);

-- Migrate surprise config data to surprise videos
INSERT INTO surprise_video (
    collection_id,
    youtube_video_id,
    title,
    is_active,
    sort_order
)
SELECT
    sc.collection_id,
    unnest(sc.youtube_urls) as youtube_video_id,
    'Surprise Video' as title,
    TRUE as is_active,
    generate_series(1, array_length(sc.youtube_urls, 1)) as sort_order
FROM surprise_config sc
JOIN surprise_collection_v2 sc2 ON sc2.calendar_id = sc.calendar_id
WHERE array_length(sc.youtube_urls, 1) > 0
AND NOT EXISTS (
    SELECT 1 FROM surprise_video WHERE surprise_video.collection_id = sc2.collection_id
);

-- =============================================================================
-- PHASE 6: Migrate Analytics Data
-- =============================================================================

-- Note: Old analytics_event table has generic structure
-- We'll create basic calendar analytics from available data

-- Create calendar view events for published calendars
INSERT INTO calendar_analytics (
    calendar_id,
    account_id,
    child_id,
    event_type,
    metadata
)
SELECT
    calendar_id,
    account_id,
    child_id,
    'calendar_publish' as event_type,
    jsonb_build_object('migrated_from', 'legacy_schema') as metadata
FROM advent_calendar_v2
WHERE is_published = TRUE;

-- =============================================================================
-- PHASE 7: Data Validation
-- =============================================================================

-- Validate migration counts
DO $$
DECLARE
    old_account_count INTEGER;
    new_account_count INTEGER;
    old_child_count INTEGER;
    new_child_count INTEGER;
    old_calendar_count INTEGER;
    new_calendar_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_account_count FROM account;
    SELECT COUNT(*) INTO new_account_count FROM account_v2;
    SELECT COUNT(*) INTO old_child_count FROM child;
    SELECT COUNT(*) INTO new_child_count FROM child_profile_v2;
    SELECT COUNT(*) INTO old_calendar_count FROM calendar;
    SELECT COUNT(*) INTO new_calendar_count FROM advent_calendar_v2;

    RAISE NOTICE 'Migration Validation:';
    RAISE NOTICE 'Accounts: % → %', old_account_count, new_account_count;
    RAISE NOTICE 'Children: % → %', old_child_count, new_child_count;
    RAISE NOTICE 'Calendars: % → %', old_calendar_count, new_calendar_count;

    -- Basic validation
    IF old_account_count != new_account_count THEN
        RAISE EXCEPTION 'Account count mismatch!';
    END IF;

    IF old_child_count != new_child_count THEN
        RAISE EXCEPTION 'Child count mismatch!';
    END IF;

    IF old_calendar_count != new_calendar_count THEN
        RAISE EXCEPTION 'Calendar count mismatch!';
    END IF;
END $$;

-- =============================================================================
-- PHASE 8: Cleanup (Optional - Run after validation)
-- =============================================================================

-- This section can be uncommented after successful validation and testing
/*
-- Drop old tables (CAUTION: Only run after thorough testing)
/*
DROP TABLE IF EXISTS analytics_event CASCADE;
DROP TABLE IF EXISTS chat_message CASCADE;
DROP TABLE IF EXISTS chat_record CASCADE;
DROP TABLE IF EXISTS surprise_config CASCADE;
DROP TABLE IF EXISTS calendar_day CASCADE;
DROP TABLE IF EXISTS calendar CASCADE;
DROP TABLE IF EXISTS child CASCADE;
DROP TABLE IF EXISTS account CASCADE;
*/
*/

COMMIT;

-- =============================================================================
-- POST-MIGRATION NOTES
-- =============================================================================
/*
1. Test all application functionality with new schema
2. Update TypeScript types to match new schema
3. Update repository classes to use new table names
4. Update any hardcoded table references in application code
5. Run full test suite
6. Only then consider dropping old tables (uncomment cleanup section)
7. Update schema.md documentation
8. Update any migration references in infra/supabase/migrations/
*/