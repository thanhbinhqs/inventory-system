-- ============================================================
-- Migration: Thêm barcode cho sản phẩm
-- ============================================================

-- Thêm cột barcode
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Tạo barcode mặc định từ SKU cho sản phẩm đã có
UPDATE products SET barcode = 'BC' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY sku) AS TEXT), 5, '0') WHERE barcode IS NULL;

-- Thêm ràng buộc unique (sau khi đã gán giá trị)
ALTER TABLE products ADD CONSTRAINT unique_barcode UNIQUE (barcode);
