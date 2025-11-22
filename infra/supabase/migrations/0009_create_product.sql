-- Create product table (generalizes calendar)
CREATE TABLE product (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
    product_type_id UUID NOT NULL REFERENCES product_type(product_type_id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    share_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_product_account_id ON product(account_id);
CREATE INDEX idx_product_product_type_id ON product(product_type_id);
CREATE INDEX idx_product_share_uuid ON product(share_uuid);
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_account_status ON product(account_id, status);

-- Unique constraint for share_uuid
CREATE UNIQUE INDEX idx_product_share_uuid_unique ON product(share_uuid);

-- Add RLS policies
ALTER TABLE product ENABLE ROW LEVEL SECURITY;

-- Users can view their own products
CREATE POLICY "Users can view their own products" ON product
    FOR SELECT USING (auth.uid() = account_id);

-- Users can manage their own products
CREATE POLICY "Users can manage their own products" ON product
    FOR ALL USING (auth.uid() = account_id);

-- Published products are viewable by anyone (for public sharing)
CREATE POLICY "Published products are publicly viewable" ON product
    FOR SELECT USING (is_published = true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_updated_at
    BEFORE UPDATE ON product
    FOR EACH ROW
    EXECUTE FUNCTION update_product_updated_at();