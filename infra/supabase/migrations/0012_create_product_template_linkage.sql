-- Create product_template_linkage table
CREATE TABLE product_template_linkage (
    product_template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES template_catalog(template_id) ON DELETE RESTRICT,
    custom_data JSONB DEFAULT '{}',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_product_template_linkage_product_id ON product_template_linkage(product_id);
CREATE INDEX idx_product_template_linkage_template_id ON product_template_linkage(template_id);
CREATE INDEX idx_product_template_linkage_applied_at ON product_template_linkage(applied_at);

-- Unique constraint to prevent multiple templates per product
CREATE UNIQUE INDEX idx_product_template_linkage_unique ON product_template_linkage(product_id);

-- Add RLS policies
ALTER TABLE product_template_linkage ENABLE ROW LEVEL SECURITY;

-- Users can view linkages for their own products
CREATE POLICY "Users can view linkages for their own products" ON product_template_linkage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM product
            WHERE product.product_id = product_template_linkage.product_id
            AND product.account_id = auth.uid()
        )
    );

-- Users can manage linkages for their own products
CREATE POLICY "Users can manage linkages for their own products" ON product_template_linkage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM product
            WHERE product.product_id = product_template_linkage.product_id
            AND product.account_id = auth.uid()
        )
    );