-- Create product_type table for generalized product system
CREATE TABLE product_type (
    product_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    default_content_schema JSONB,
    supported_features TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial product types
INSERT INTO product_type (name, description, default_content_schema, supported_features) VALUES
('calendar', 'Traditional advent calendar with 24 days', '{
    "type": "object",
    "properties": {
        "day_number": {"type": "integer", "minimum": 1, "maximum": 24},
        "photo_url": {"type": "string", "format": "uri"},
        "text_content": {"type": "string"}
    },
    "required": ["day_number"]
}', ARRAY['ai_generation', 'custom_data', 'themes', 'surprises']),
('storybook', 'Sequential story with chapters and pages', '{
    "type": "object",
    "properties": {
        "chapter_number": {"type": "integer", "minimum": 1},
        "page_content": {"type": "string"},
        "illustrations": {"type": "array", "items": {"type": "string", "format": "uri"}}
    },
    "required": ["chapter_number", "page_content"]
}', ARRAY['ai_generation', 'custom_data', 'themes']),
('interactive_game', 'Interactive game with levels and challenges', '{
    "type": "object",
    "properties": {
        "level_number": {"type": "integer", "minimum": 1},
        "challenges": {"type": "array", "items": {"type": "string"}},
        "rewards": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["level_number"]
}', ARRAY['ai_generation', 'custom_data', 'themes', 'interactivity']);

-- Add RLS policies
ALTER TABLE product_type ENABLE ROW LEVEL SECURITY;

-- Product types are readable by all authenticated users
CREATE POLICY "Product types are viewable by authenticated users" ON product_type
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify product types (for now, allow all authenticated users)
CREATE POLICY "Product types are manageable by authenticated users" ON product_type
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_product_type_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_type_updated_at
    BEFORE UPDATE ON product_type
    FOR EACH ROW
    EXECUTE FUNCTION update_product_type_updated_at();