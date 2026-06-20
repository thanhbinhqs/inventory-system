-- ============================================================
-- Migration: Schema cho Hệ thống Quản lý Kho & Dòng tiền
-- ============================================================

-- 1. Bảng Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Bảng Inventory Transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  type VARCHAR(3) NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(12,2) NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index cho transaction_date phục vụ sort và filter
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date 
  ON inventory_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product 
  ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type 
  ON inventory_transactions(type);
CREATE INDEX IF NOT EXISTS idx_products_sku 
  ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name
  ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_barcode
  ON products(barcode);

-- 3. View: Inventory Summary
--    Tính toán tồn kho, giá trị vốn, doanh thu
CREATE OR REPLACE VIEW inventory_summary AS
WITH product_totals AS (
  SELECT
    p.id,
    p.name,
    p.sku,
    p.barcode,
    p.cost_price,
    p.selling_price,
    p.min_stock,
    COALESCE(
      SUM(CASE WHEN it.type = 'IN' THEN it.quantity ELSE 0 END) -
      SUM(CASE WHEN it.type = 'OUT' THEN it.quantity ELSE 0 END),
      0
    ) AS current_stock,
    COALESCE(
      SUM(CASE WHEN it.type = 'IN' THEN it.quantity * it.price ELSE 0 END),
      0
    ) AS total_investment,
    COALESCE(
      SUM(CASE WHEN it.type = 'OUT' THEN it.quantity * it.price ELSE 0 END),
      0
    ) AS total_revenue
  FROM products p
  LEFT JOIN inventory_transactions it ON p.id = it.product_id
  GROUP BY p.id, p.name, p.sku, p.barcode, p.cost_price, p.selling_price, p.min_stock
)
SELECT
  *,
  current_stock * cost_price AS inventory_value,
  CASE 
    WHEN current_stock > 0 THEN total_revenue - total_investment
    ELSE 0 
  END AS profit
FROM product_totals;

-- 4. Trigger: Tự động cập nhật updated_at cho products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Seed Data
-- ============================================================
INSERT INTO products (sku, name, barcode, cost_price, selling_price, min_stock) VALUES
  ('SP001', 'Tai Nghe Bluetooth', 'BC00001', 150000, 299000, 10),
  ('SP002', 'Ốp Lưng iPhone 15', 'BC00002', 30000, 89000, 20),
  ('SP003', 'Cáp Sạc Type-C', 'BC00003', 25000, 65000, 30),
  ('SP004', 'Pin Dự Phòng 10000mAh', 'BC00004', 200000, 399000, 5),
  ('SP005', 'Chuột Không Dây', 'BC00005', 120000, 249000, 15)
ON CONFLICT (sku) DO NOTHING;

-- Thêm giao dịch mẫu
DO $$
DECLARE
  p_id UUID;
BEGIN
  -- Nhập kho
  FOR p_id IN SELECT id FROM products ORDER BY sku LOOP
    INSERT INTO inventory_transactions (product_id, type, quantity, price, transaction_date)
    VALUES (p_id, 'IN', 50, (SELECT cost_price FROM products WHERE id = p_id), '2024-06-01');
  END LOOP;

  -- Xuất kho một số giao dịch
  INSERT INTO inventory_transactions (product_id, type, quantity, price, transaction_date, note)
  SELECT id, 'OUT', 5, selling_price, '2024-06-15', 'Bán lẻ'
  FROM products WHERE sku = 'SP001';
  
  INSERT INTO inventory_transactions (product_id, type, quantity, price, transaction_date, note)
  SELECT id, 'OUT', 10, selling_price, '2024-06-20', 'Bán sỉ'
  FROM products WHERE sku = 'SP003';

  INSERT INTO inventory_transactions (product_id, type, quantity, price, transaction_date, note)
  SELECT id, 'OUT', 3, selling_price, '2024-07-01', 'Bán lẻ'
  FROM products WHERE sku = 'SP004';
END $$;
