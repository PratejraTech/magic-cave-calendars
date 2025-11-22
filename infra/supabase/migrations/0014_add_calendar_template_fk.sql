-- Add foreign key constraint from calendar to template_catalog
-- This completes the template integration for calendars

BEGIN;

-- Add foreign key constraint to advent_calendar_v2 table
-- Only allow templates that are for calendar product type
ALTER TABLE advent_calendar_v2
ADD CONSTRAINT fk_calendar_template
FOREIGN KEY (template_id)
REFERENCES template_catalog(template_id)
ON DELETE SET NULL;

-- Add index for template queries
CREATE INDEX idx_calendar_template_id ON advent_calendar_v2(template_id);

-- Update RLS policies to allow template access
-- Users can see templates for calendar product type
DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON template_catalog;
CREATE POLICY "Templates are viewable by authenticated users" ON template_catalog
    FOR SELECT USING (
        auth.role() = 'authenticated'
        AND is_active = true
        AND product_type_id IN (
            SELECT product_type_id FROM product_type WHERE name = 'calendar'
        )
    );

-- Users can manage templates for calendar product type (for now, allow all authenticated)
DROP POLICY IF EXISTS "Templates are manageable by authenticated users" ON template_catalog;
CREATE POLICY "Templates are manageable by authenticated users" ON template_catalog
    FOR ALL USING (
        auth.role() = 'authenticated'
        AND product_type_id IN (
            SELECT product_type_id FROM product_type WHERE name = 'calendar'
        )
    );

COMMIT;