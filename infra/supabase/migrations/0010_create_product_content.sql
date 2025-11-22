-- Create product_content table (generalizes calendar_day)
CREATE TABLE product_content (
    product_content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number > 0),
    content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'interactive')),
    content_data JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_product_content_product_id ON product_content(product_id);
CREATE INDEX idx_product_content_day_number ON product_content(product_id, day_number);
CREATE INDEX idx_product_content_content_type ON product_content(content_type);
CREATE INDEX idx_product_content_generated_at ON product_content(generated_at);

-- Unique constraint to prevent duplicate content for same product/day
CREATE UNIQUE INDEX idx_product_content_unique ON product_content(product_id, day_number);

-- Add RLS policies
ALTER TABLE product_content ENABLE ROW LEVEL SECURITY;

-- Users can view content of their own products
CREATE POLICY "Users can view content of their own products" ON product_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM product
            WHERE product.product_id = product_content.product_id
            AND product.account_id = auth.uid()
        )
    );

-- Users can manage content of their own products
CREATE POLICY "Users can manage content of their own products" ON product_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM product
            WHERE product.product_id = product_content.product_id
            AND product.account_id = auth.uid()
        )
    );

-- Published product content is viewable by anyone
CREATE POLICY "Published product content is publicly viewable" ON product_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM product
            WHERE product.product_id = product_content.product_id
            AND product.is_published = true
        )
    );