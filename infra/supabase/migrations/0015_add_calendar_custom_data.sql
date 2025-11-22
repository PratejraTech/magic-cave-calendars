-- Add custom_data column to advent_calendar_v2 table
-- This allows storing template-specific custom data for calendars

BEGIN;

-- Add custom_data column as JSONB to store template form data
ALTER TABLE advent_calendar_v2
ADD COLUMN custom_data JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN advent_calendar_v2.custom_data IS 'Custom data from template forms, stored as JSONB';

-- Add index for custom_data queries (if needed for performance)
CREATE INDEX idx_calendar_custom_data ON advent_calendar_v2 USING GIN (custom_data);

COMMIT;