# MANUAL SCHEMA DEPLOYMENT GUIDE
# Complete these steps in Supabase Dashboard SQL Editor

## Step 1: Check Current Database State
Run this query to see existing tables:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

## Step 2: Clean Database (if old tables exist)
If you see old tables (account, child, calendar, etc.), run:
```sql
DROP TABLE IF EXISTS analytics_event CASCADE;
DROP TABLE IF EXISTS chat_message CASCADE;
DROP TABLE IF EXISTS chat_record CASCADE;
DROP TABLE IF EXISTS surprise_config CASCADE;
DROP TABLE IF EXISTS calendar_day CASCADE;
DROP TABLE IF EXISTS calendar CASCADE;
DROP TABLE IF EXISTS child CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS advent_days CASCADE;
```

## Step 3: Apply New Schema
Execute each migration file in order. Copy the contents of each file from `tasks/data_model/` and run in SQL Editor:

### 3.1 Identity & Access Domain
**File**: `tasks/data_model/0001_init_identity_access.sql`
**Purpose**: Account management and sessions

### 3.2 Family Domain
**File**: `tasks/data_model/0002_init_family_domain.sql`
**Purpose**: Child profiles and family settings

### 3.3 Calendar Domain
**File**: `tasks/data_model/0003_init_calendar_domain.sql`
**Purpose**: Calendar and day management

### 3.4 Chat & Memory Domain
**File**: `tasks/data_model/0004_init_chat_memory.sql`
**Purpose**: Chat sessions and memory system

### 3.5 Content Domain
**File**: `tasks/data_model/0005_init_content_domain.sql`
**Purpose**: Media assets and surprise content

### 3.6 Analytics Domain
**File**: `tasks/data_model/0006_init_analytics_domain.sql`
**Purpose**: Structured analytics system

## Step 4: Validation
After applying all migrations, run:
```sql
-- Check total tables (should be 17)
SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname = 'public';

-- Check extensions installed
SELECT * FROM pg_extension WHERE extname IN ('pgcrypto', 'vector');

-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

## Expected Results:
- **Total Tables**: 17
- **Extensions**: pgcrypto, vector
- **Tables**: account_v2, child_profile_v2, advent_calendar_v2, calendar_day_v2, chat_session_v2, chat_message_v2, memory_fragment, memory_embedding, media_asset, surprise_collection_v2, surprise_video, calendar_analytics, day_analytics, chat_analytics, user_engagement, account_session, family_settings

## Step 5: Confirm Success
Once validation passes, reply with the table count and list to confirm deployment success.