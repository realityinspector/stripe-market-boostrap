-- Add missing columns to products table for inventory management
ALTER TABLE products
ADD COLUMN IF NOT EXISTS inventory INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sku VARCHAR(50),
ADD COLUMN IF NOT EXISTS weight DECIMAL(8, 2),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100),
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES product_categories(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add relevant indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_inventory ON products(inventory) WHERE inventory <= 10;