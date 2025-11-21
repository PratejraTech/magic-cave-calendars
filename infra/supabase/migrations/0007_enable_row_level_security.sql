-- 0007_enable_row_level_security.sql
-- Row Level Security Implementation for All Tables

BEGIN;

-- Enable RLS on all tables
ALTER TABLE account_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profile_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE advent_calendar_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_day_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_session_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_fragment ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_embedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE surprise_collection_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE surprise_video ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ACCOUNT_V2 POLICIES
-- =============================================

-- Users can read/update their own account
CREATE POLICY "Users can access own account"
  ON account_v2
  FOR ALL
  USING (auth.uid()::text = email)
  WITH CHECK (auth.uid()::text = email);

-- =============================================
-- ACCOUNT_SESSION POLICIES
-- =============================================

-- Users can access their own sessions
CREATE POLICY "Users can access own sessions"
  ON account_session
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

-- =============================================
-- CHILD_PROFILE_V2 POLICIES
-- =============================================

-- Users can access children associated with their account
CREATE POLICY "Users can access own children"
  ON child_profile_v2
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

-- =============================================
-- FAMILY_SETTINGS POLICIES
-- =============================================

-- Users can access family settings for their account
CREATE POLICY "Users can access own family settings"
  ON family_settings
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

-- =============================================
-- ADVENT_CALENDAR_V2 POLICIES
-- =============================================

-- Users can access calendars they own
CREATE POLICY "Users can access own calendars"
  ON advent_calendar_v2
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

-- Public read access for published calendars
CREATE POLICY "Public can read published calendars"
  ON advent_calendar_v2
  FOR SELECT
  USING (is_published = true);

-- =============================================
-- CALENDAR_DAY_V2 POLICIES
-- =============================================

-- Users can access days from calendars they own
CREATE POLICY "Users can access own calendar days"
  ON calendar_day_v2
  FOR ALL
  USING (
    calendar_id IN (
      SELECT calendar_id FROM advent_calendar_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    calendar_id IN (
      SELECT calendar_id FROM advent_calendar_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  );

-- Public read access for days in published calendars
CREATE POLICY "Public can read days from published calendars"
  ON calendar_day_v2
  FOR SELECT
  USING (
    calendar_id IN (
      SELECT calendar_id FROM advent_calendar_v2
      WHERE is_published = true
    )
  );

-- =============================================
-- CHAT_SESSION_V2 POLICIES
-- =============================================

-- Users can access chat sessions for their account
CREATE POLICY "Users can access own chat sessions"
  ON chat_session_v2
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

-- =============================================
-- CHAT_MESSAGE_V2 POLICIES
-- =============================================

-- Users can access messages from their chat sessions
CREATE POLICY "Users can access own chat messages"
  ON chat_message_v2
  FOR ALL
  USING (
    session_id IN (
      SELECT session_id FROM chat_session_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT session_id FROM chat_session_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  );

-- =============================================
-- MEMORY_FRAGMENT POLICIES
-- =============================================

-- Users can access memory fragments for their children
CREATE POLICY "Users can access own memory fragments"
  ON memory_fragment
  FOR ALL
  USING (
    child_id IN (
      SELECT child_id FROM child_profile_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT child_id FROM child_profile_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  );

-- =============================================
-- MEMORY_EMBEDDING POLICIES
-- =============================================

-- Users can access memory embeddings for their children
CREATE POLICY "Users can access own memory embeddings"
  ON memory_embedding
  FOR ALL
  USING (
    child_id IN (
      SELECT child_id FROM child_profile_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT child_id FROM child_profile_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  );

-- =============================================
-- MEDIA_ASSET POLICIES
-- =============================================

-- Users can access media assets they own
CREATE POLICY "Users can access own media assets"
  ON media_asset
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

-- =============================================
-- SURPRISE_COLLECTION_V2 POLICIES
-- =============================================

-- Users can access surprise collections for their calendars
CREATE POLICY "Users can access own surprise collections"
  ON surprise_collection_v2
  FOR ALL
  USING (
    calendar_id IN (
      SELECT calendar_id FROM advent_calendar_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  )
  WITH CHECK (
    calendar_id IN (
      SELECT calendar_id FROM advent_calendar_v2
      WHERE account_id IN (
        SELECT account_id FROM account_v2
        WHERE email = auth.uid()::text
      )
    )
  );

-- =============================================
-- SURPRISE_VIDEO POLICIES
-- =============================================

-- Users can access surprise videos for their collections
CREATE POLICY "Users can access own surprise videos"
  ON surprise_video
  FOR ALL
  USING (
    collection_id IN (
      SELECT collection_id FROM surprise_collection_v2
      WHERE calendar_id IN (
        SELECT calendar_id FROM advent_calendar_v2
        WHERE account_id IN (
          SELECT account_id FROM account_v2
          WHERE email = auth.uid()::text
        )
      )
    )
  )
  WITH CHECK (
    collection_id IN (
      SELECT collection_id FROM surprise_collection_v2
      WHERE calendar_id IN (
        SELECT calendar_id FROM advent_calendar_v2
        WHERE account_id IN (
          SELECT account_id FROM account_v2
          WHERE email = auth.uid()::text
        )
      )
    )
  );

-- =============================================
-- ANALYTICS TABLES POLICIES
-- =============================================

-- Users can access their own analytics data
CREATE POLICY "Users can access own calendar analytics"
  ON calendar_analytics
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

CREATE POLICY "Users can access own day analytics"
  ON day_analytics
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

CREATE POLICY "Users can access own chat analytics"
  ON chat_analytics
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

CREATE POLICY "Users can access own user engagement"
  ON user_engagement
  FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_v2
      WHERE email = auth.uid()::text
    )
  );

COMMIT;