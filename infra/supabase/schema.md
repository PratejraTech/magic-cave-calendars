# Advent Calendar Builder - Database Schema

This document provides a comprehensive overview of the Advent Calendar Builder database schema, including all tables, fields, constraints, and relationships.

## Overview

The schema supports a multi-tenant advent calendar system where:
- Each account can have exactly one child
- Each child can have one calendar per year
- Calendars contain 24 days with customizable content
- Chat functionality with memory and analytics tracking
- Surprise content via YouTube URL arrays

## Core Tables

### account
Represents a parent/guardian account in the system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| account_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the account |
| email | TEXT | UNIQUE, NOT NULL | Account email address for authentication |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation timestamp |
| plan | TEXT | NULL | Subscription plan (future use) |
| settings_json | JSONB | NULL | Account-level settings and preferences |

**Constraints:**
- Email must be unique across all accounts

### child
Represents a child associated with an account. Enforces 1:1 relationship with accounts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| child_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the child |
| account_id | UUID | NOT NULL, REFERENCES account(account_id) ON DELETE CASCADE | Parent account ID |
| child_name | TEXT | NOT NULL | Child's display name |
| hero_photo_url | TEXT | NULL | URL to child's hero photo |
| chat_persona | TEXT | NOT NULL, CHECK (chat_persona IN ('mummy', 'daddy', 'custom')) | Chat persona type |
| custom_chat_prompt | TEXT | NULL | Custom prompt text for chat persona |
| theme | TEXT | NOT NULL, DEFAULT 'snow' | UI theme selection |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Child record creation timestamp |

**Constraints:**
- One account can have exactly one child (enforced by unique index on account_id)
- Chat persona must be one of: 'mummy', 'daddy', 'custom'

**Indexes:**
- `idx_child_account_unique` - UNIQUE on account_id (enforces 1:1 relationship)

### calendar
Represents an advent calendar for a specific child and year.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| calendar_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the calendar |
| account_id | UUID | NOT NULL, REFERENCES account(account_id) ON DELETE CASCADE | Owner account ID |
| child_id | UUID | NOT NULL, REFERENCES child(child_id) ON DELETE CASCADE | Associated child ID |
| share_uuid | UUID | NOT NULL, DEFAULT gen_random_uuid() | Public sharing identifier |
| is_published | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether calendar is publicly accessible |
| year | INT | NOT NULL | Calendar year (e.g., 2025 for December 2025) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Calendar creation timestamp |

**Constraints:**
- One calendar per child per year (enforced by unique index)

**Indexes:**
- `idx_calendar_child_year_unique` - UNIQUE on (child_id, year)
- `idx_calendar_child_id` - Index on child_id for faster lookups

### calendar_day
Represents individual days within a calendar (1-24).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| calendar_day_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the calendar day |
| calendar_id | UUID | NOT NULL, REFERENCES calendar(calendar_id) ON DELETE CASCADE | Parent calendar ID |
| day_number | INT | NOT NULL, CHECK (day_number BETWEEN 1 AND 24) | Day of December (1-24) |
| photo_url | TEXT | NULL | URL to day's photo |
| text_content | TEXT | NULL | Custom text content for the day |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Day record creation timestamp |

**Constraints:**
- Day number must be between 1 and 24
- Only one record per calendar per day (enforced by unique index)

**Indexes:**
- `idx_calendar_day_unique` - UNIQUE on (calendar_id, day_number)

## Chat System Tables

### chat_record
Represents a chat session between a child and the AI parent persona.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| chat_record_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the chat record |
| account_id | UUID | NOT NULL, REFERENCES account(account_id) ON DELETE CASCADE | Owner account ID |
| child_id | UUID | NOT NULL, REFERENCES child(child_id) ON DELETE CASCADE | Associated child ID |
| session_id | TEXT | NOT NULL | Session identifier for grouping messages |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Chat session creation timestamp |

**Indexes:**
- `idx_chat_record_child_id_created_at` - Composite index on (child_id, created_at)
- `idx_chat_record_session_id` - Index on session_id

### chat_message
Individual messages within a chat session.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| message_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the message |
| chat_record_id | UUID | NOT NULL, REFERENCES chat_record(chat_record_id) ON DELETE CASCADE | Parent chat record ID |
| sender | TEXT | NOT NULL, CHECK (sender IN ('child', 'parent_agent')) | Message sender type |
| message_text | TEXT | NOT NULL | Message content |
| timestamp | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Message timestamp |

**Constraints:**
- Sender must be either 'child' or 'parent_agent'

**Indexes:**
- `idx_chat_message_chat_record_id_timestamp` - Composite index on (chat_record_id, timestamp)

## Analytics Tables

### analytics_event
Tracks user interactions and system events for analytics.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| analytics_event_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the analytics event |
| account_id | UUID | NOT NULL, REFERENCES account(account_id) ON DELETE CASCADE | Owner account ID |
| child_id | UUID | NULL, REFERENCES child(child_id) ON DELETE SET NULL | Associated child ID (nullable) |
| calendar_id | UUID | NULL, REFERENCES calendar(calendar_id) ON DELETE SET NULL | Associated calendar ID (nullable) |
| event_type | TEXT | NOT NULL | Type of analytics event |
| event_payload | JSONB | NULL | Additional event data as JSON |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Event creation timestamp |

**Indexes:**
- `idx_analytics_account_created_at` - Composite index on (account_id, created_at)
- `idx_analytics_calendar_created_at` - Composite index on (calendar_id, created_at)
- `idx_analytics_event_type_created_at` - Composite index on (event_type, created_at)

## Surprise Content Tables

### surprise_config
Configuration for surprise content (YouTube videos) associated with a calendar.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| surprise_config_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the surprise config |
| calendar_id | UUID | NOT NULL, REFERENCES calendar(calendar_id) ON DELETE CASCADE | Associated calendar ID |
| youtube_urls | TEXT[] | NOT NULL, DEFAULT '{}' | Array of YouTube video URLs |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Config creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Config last update timestamp |

**Constraints:**
- One surprise config per calendar (enforced by unique index)
- YouTube URLs stored as PostgreSQL array

**Indexes:**
- `idx_surprise_config_calendar_unique` - UNIQUE on calendar_id

**Triggers:**
- `update_surprise_config_updated_at` - Automatically updates updated_at on record changes

## Relationships

```
account (1) ──── (1) child
    │                   │
    └── (1)             └── (1)
       calendar ──────── calendar_day (24)
           │                   │
           ├── (1)             │
           │   surprise_config │
           │                   │
           └── (many)          │
               chat_record ─── chat_message (many)
                   │
                   └── (many)
                       analytics_event
```

## Data Flow

1. **Account Creation**: Parent creates account with email
2. **Child Setup**: Account creates exactly one child profile with persona settings
3. **Calendar Creation**: Child gets one calendar per year with 24 empty days
4. **Content Population**: Parent fills calendar days with photos and text
5. **Publishing**: Calendar becomes accessible via share_uuid
6. **Interaction**: Child opens days, chats with AI persona, views surprises
7. **Analytics**: All interactions tracked for insights

## Security Considerations

- ✅ Row Level Security (RLS) implemented on all tables
- ✅ Access control based on account_id ownership
- ✅ Public access only for published calendars via share_uuid
- 🔄 Signed URLs for media assets (planned)
- ✅ Input validation and sanitization implemented
- ✅ Content Security Policy (CSP) implemented
- ✅ Rate limiting and security headers configured
- ✅ Authentication hardening with email confirmation

## Migration Notes

- Schema designed for Supabase with built-in auth integration
- UUIDs used for all primary keys for global uniqueness
- Cascading deletes ensure referential integrity
- Indexes optimized for common query patterns
- JSONB used for flexible event payload storage