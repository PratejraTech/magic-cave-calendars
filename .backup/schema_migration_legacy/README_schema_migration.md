# Schema Migration Guide: Legacy → New Architecture

## Overview

This document outlines the complete migration from the legacy Advent Calendar schema to the new domain-driven architecture. The migration addresses critical issues including legacy table conflicts, missing memory management, and unstructured analytics.

## Migration Files

### New Schema Files (Apply First)
1. `0001_init_identity_access.sql` - Identity and access management
2. `0002_init_family_domain.sql` - Child profiles and family settings
3. `0003_init_calendar_domain.sql` - Calendar and day management
4. `0004_init_chat_memory.sql` - Chat sessions and memory system
5. `0005_init_content_domain.sql` - Media assets and surprise content
6. `0006_init_analytics_domain.sql` - Structured analytics system

### Data Migration
- `migration_data_transfer.sql` - Complete data migration script

## Key Improvements

### 1. **Resolved Legacy Conflicts**
- ❌ **Before**: `advent_days` table conflicted with `calendar_day`
- ✅ **After**: Clean `calendar_day_v2` table with proper structure

### 2. **Memory Management System**
- ❌ **Before**: No database-level memory management
- ✅ **After**: `memory_fragment` (short-term) + `memory_embedding` (long-term)

### 3. **Structured Analytics**
- ❌ **Before**: Generic `analytics_event` with `event_type` TEXT
- ✅ **After**: Specific tables: `calendar_analytics`, `day_analytics`, `chat_analytics`, `user_engagement`

### 4. **Type Safety Alignment**
- ❌ **Before**: Frontend `AdventDay` ≠ Backend `CalendarDay`
- ✅ **After**: Unified types across frontend/backend

### 5. **Enhanced Security**
- ❌ **Before**: Basic foreign keys
- ✅ **After**: Comprehensive constraints, session management, IP tracking

## Migration Steps

### Phase 1: Schema Deployment
```bash
# Apply new schema migrations in order
supabase migration up 0001
supabase migration up 0002
supabase migration up 0003
supabase migration up 0004
supabase migration up 0005
supabase migration up 0006
```

### Phase 2: Data Migration
```sql
-- Run the data migration script
\i migration_data_transfer.sql
```

### Phase 3: Application Updates
1. **Update TypeScript Types**
   - Replace old interfaces with new schema-aligned types
   - Update repository classes to use new table names
   - Update API endpoints and DTOs

2. **Update Repository Classes**
   - Change table references from `account` → `account_v2`
   - Update column names to match new schema
   - Implement new memory management methods

3. **Update Frontend Types**
   - Align `AdventDay` interface with `calendar_day_v2` table
   - Update API client calls
   - Update React components

### Phase 4: Testing & Validation
1. **Unit Tests**: Update all repository and service tests
2. **Integration Tests**: Test full data flow
3. **End-to-End Tests**: Validate user journeys
4. **Performance Tests**: Verify query performance

### Phase 5: Cleanup (After Validation)
```sql
-- Only run after thorough testing
DROP TABLE IF EXISTS analytics_event CASCADE;
DROP TABLE IF EXISTS chat_message CASCADE;
DROP TABLE IF EXISTS chat_record CASCADE;
DROP TABLE IF EXISTS surprise_config CASCADE;
DROP TABLE IF EXISTS calendar_day CASCADE;
DROP TABLE IF EXISTS calendar CASCADE;
DROP TABLE IF EXISTS child CASCADE;
DROP TABLE IF EXISTS account CASCADE;
```

## Table Mapping

| Legacy Table | New Table(s) | Migration Notes |
|-------------|-------------|-----------------|
| `account` | `account_v2` | Enhanced with auth fields |
| `child` | `child_profile_v2` | Better validation, media asset FK |
| `calendar` | `advent_calendar_v2` | Enhanced features, locking |
| `calendar_day` | `calendar_day_v2` | Aligned with frontend types |
| `chat_record` | `chat_session_v2` | Session-based with expiration |
| `chat_message` | `chat_message_v2` | Enhanced metadata |
| `surprise_config` | `surprise_collection_v2` + `surprise_video` | Normalized structure |
| `analytics_event` | `calendar_analytics`, `day_analytics`, `chat_analytics`, `user_engagement` | Structured by domain |

## New Features Enabled

### Memory System
- **Short-term Memory**: `memory_fragment` table for recent context
- **Long-term Memory**: `memory_embedding` with vector search
- **Automatic Cleanup**: TTL-based expiration

### Enhanced Analytics
- **Calendar Analytics**: Views, shares, publish events
- **Day Analytics**: Open events with timing data
- **Chat Analytics**: Session tracking and engagement
- **User Engagement**: Streak tracking and scoring

### Media Management
- **Centralized Assets**: `media_asset` table for all media
- **Processing Status**: Track upload/processing state
- **Signed URLs**: Secure access to private assets

### Security Improvements
- **Session Management**: `account_session` for secure sessions
- **IP Tracking**: Monitor access patterns
- **Audit Trail**: Comprehensive event logging

## Rollback Plan

If migration fails:

1. **Immediate Rollback**: Restore from backup
2. **Partial Rollback**: Keep new schema, re-migrate data
3. **Staged Rollback**: Gradually revert components

## Success Criteria

- ✅ All data migrated without loss
- ✅ Application functions with new schema
- ✅ Performance meets or exceeds current levels
- ✅ All tests pass
- ✅ Type safety maintained across stack
- ✅ Memory system operational
- ✅ Analytics properly structured

## Next Steps

After successful migration:

1. Update `infra/supabase/schema.md` with new schema documentation
2. Update API documentation
3. Implement memory management features
4. Add advanced analytics dashboards
5. Consider calendar templates system

## Risk Mitigation

- **Data Loss**: Comprehensive backups before migration
- **Downtime**: Blue-green deployment strategy
- **Performance**: Query optimization and indexing
- **Testing**: Extensive test coverage before/after migration

---

**Migration Status**: Ready for implementation
**Estimated Downtime**: 2-4 hours for full migration
**Rollback Time**: < 30 minutes with proper backups</content>
</xai:function_call ><xai:function_call name="list">
<parameter name="path">tasks/data_model