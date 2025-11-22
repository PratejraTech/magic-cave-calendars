-- Create template_catalog table for content templates
CREATE TABLE template_catalog (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_type_id UUID REFERENCES product_type(product_type_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    preview_image_url TEXT,
    compatible_themes TEXT[] DEFAULT '{}',
    default_custom_data_schema JSONB,
    product_specific_config JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_template_catalog_product_type_id ON template_catalog(product_type_id);
CREATE INDEX idx_template_catalog_is_active ON template_catalog(is_active);
CREATE INDEX idx_template_catalog_name ON template_catalog(name);

-- Add RLS policies
ALTER TABLE template_catalog ENABLE ROW LEVEL SECURITY;

-- Templates are viewable by all authenticated users
CREATE POLICY "Templates are viewable by authenticated users" ON template_catalog
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Only admins can manage templates (for now, allow all authenticated users)
CREATE POLICY "Templates are manageable by authenticated users" ON template_catalog
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_template_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_catalog_updated_at
    BEFORE UPDATE ON template_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_template_catalog_updated_at();

-- Insert sample templates for calendar product type
INSERT INTO template_catalog (product_type_id, name, description, compatible_themes, default_custom_data_schema) VALUES
((SELECT product_type_id FROM product_type WHERE name = 'calendar'),
 'Magical Christmas Adventure',
 'A magical journey through the Christmas season with personalized stories and surprises',
 ARRAY['snow', 'forest', 'cabin'],
 '{
    "type": "object",
    "properties": {
        "child_name": {"type": "string", "description": "Child''s name for personalization"},
        "favorite_color": {"type": "string", "description": "Child''s favorite color"},
        "special_memory": {"type": "string", "description": "A special family memory to include"}
    },
    "required": ["child_name"]
 }'),
((SELECT product_type_id FROM product_type WHERE name = 'calendar'),
 'Winter Wonderland',
 'Explore a winter wonderland with snowy adventures and holiday magic',
 ARRAY['snow', 'winter'],
 '{
    "type": "object",
    "properties": {
        "child_name": {"type": "string"},
        "winter_activity": {"type": "string", "description": "Favorite winter activity"},
        "magical_creature": {"type": "string", "description": "Favorite magical winter creature"}
    },
    "required": ["child_name"]
 }');