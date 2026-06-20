/**
 * Seed script: 200 sản phẩm + giao dịch nhập/xuất kho
 * Chạy: node scripts/seed-200.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Đọc env
const envPath = resolve(__dirname, '..', '.env.local');
let envContent;
try {
  envContent = readFileSync(envPath, 'utf-8');
} catch {
  envContent = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
}
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Không tìm thấy SUPABASE_URL hoặc SUPABASE_ANON_KEY trong .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ====================================================================
// 200 sản phẩm Việt Nam thực tế
// ====================================================================
const productData = [
  // --- Điện thoại & Phụ kiện ---
  { name: 'Ốp Lưng iPhone 16 Pro', sku: 'SP001', cost_price: 45000, selling_price: 99000, barcode: 'BC000001', min_stock: 20 },
  { name: 'Ốp Lưng iPhone 16', sku: 'SP002', cost_price: 40000, selling_price: 89000, barcode: 'BC000002', min_stock: 20 },
  { name: 'Ốp Lưng Samsung S25 Ultra', sku: 'SP003', cost_price: 50000, selling_price: 109000, barcode: 'BC000003', min_stock: 20 },
  { name: 'Cáp Sạc Type-C 1m', sku: 'SP004', cost_price: 25000, selling_price: 55000, barcode: 'BC000004', min_stock: 50 },
  { name: 'Cáp Sạc Lightning 1m', sku: 'SP005', cost_price: 30000, selling_price: 65000, barcode: 'BC000005', min_stock: 30 },
  { name: 'Cáp Sạc Micro USB 1m', sku: 'SP006', cost_price: 15000, selling_price: 35000, barcode: 'BC000006', min_stock: 30 },
  { name: 'Củ Sạc 20W PD', sku: 'SP007', cost_price: 80000, selling_price: 169000, barcode: 'BC000007', min_stock: 20 },
  { name: 'Củ Sạc 65W GaN', sku: 'SP008', cost_price: 250000, selling_price: 499000, barcode: 'BC000008', min_stock: 10 },
  { name: 'Củ Sạc Ô Tô 30W', sku: 'SP009', cost_price: 90000, selling_price: 189000, barcode: 'BC000009', min_stock: 15 },
  { name: 'Pin Dự Phòng 10000mAh', sku: 'SP010', cost_price: 180000, selling_price: 369000, barcode: 'BC000010', min_stock: 10 },
  { name: 'Pin Dự Phòng 20000mAh', sku: 'SP011', cost_price: 280000, selling_price: 549000, barcode: 'BC000011', min_stock: 5 },
  { name: 'Pin Dự Phòng 5000mAh', sku: 'SP012', cost_price: 100000, selling_price: 219000, barcode: 'BC000012', min_stock: 15 },
  { name: 'Tai Nghe Bluetooth AirPods Pro', sku: 'SP013', cost_price: 450000, selling_price: 899000, barcode: 'BC000013', min_stock: 5 },
  { name: 'Tai Nghe Bluetooth Chụp Tai', sku: 'SP014', cost_price: 250000, selling_price: 499000, barcode: 'BC000014', min_stock: 10 },
  { name: 'Tai Nghe Có Dây Type-C', sku: 'SP015', cost_price: 35000, selling_price: 89000, barcode: 'BC000015', min_stock: 30 },
  { name: 'Loa Bluetooth Mini', sku: 'SP016', cost_price: 120000, selling_price: 259000, barcode: 'BC000016', min_stock: 10 },
  { name: 'Loa Bluetooth Chống Nước', sku: 'SP017', cost_price: 300000, selling_price: 599000, barcode: 'BC000017', min_stock: 5 },
  { name: 'Đồng Hồ Thông Minh', sku: 'SP018', cost_price: 500000, selling_price: 999000, barcode: 'BC000018', min_stock: 5 },
  { name: 'Vòng Đeo Tay Thông Minh', sku: 'SP019', cost_price: 200000, selling_price: 429000, barcode: 'BC000019', min_stock: 10 },
  { name: 'Miếng Dán Cường Lực iPhone 16', sku: 'SP020', cost_price: 20000, selling_price: 59000, barcode: 'BC000020', min_stock: 50 },

  // --- Thiết bị Văn Phòng ---
  { name: 'Chuột Không Dây Logitech', sku: 'SP021', cost_price: 150000, selling_price: 329000, barcode: 'BC000021', min_stock: 10 },
  { name: 'Chuột Có Dây Văn Phòng', sku: 'SP022', cost_price: 40000, selling_price: 99000, barcode: 'BC000022', min_stock: 20 },
  { name: 'Bàn Phím Cơ 60%', sku: 'SP023', cost_price: 350000, selling_price: 749000, barcode: 'BC000023', min_stock: 5 },
  { name: 'Bàn Phím Không Dây', sku: 'SP024', cost_price: 180000, selling_price: 399000, barcode: 'BC000024', min_stock: 10 },
  { name: 'USB Hub 4 Cổng 3.0', sku: 'SP025', cost_price: 80000, selling_price: 179000, barcode: 'BC000025', min_stock: 15 },
  { name: 'USB 32GB 3.0', sku: 'SP026', cost_price: 50000, selling_price: 119000, barcode: 'BC000026', min_stock: 30 },
  { name: 'USB 64GB 3.0', sku: 'SP027', cost_price: 90000, selling_price: 199000, barcode: 'BC000027', min_stock: 20 },
  { name: 'USB 128GB 3.0', sku: 'SP028', cost_price: 160000, selling_price: 349000, barcode: 'BC000028', min_stock: 10 },
  { name: 'Ổ Cứng SSD 256GB', sku: 'SP029', cost_price: 600000, selling_price: 1299000, barcode: 'BC000029', min_stock: 5 },
  { name: 'Ổ Cứng SSD 512GB', sku: 'SP030', cost_price: 1000000, selling_price: 2199000, barcode: 'BC000030', min_stock: 5 },
  { name: 'Ổ Cứng SSD 1TB', sku: 'SP031', cost_price: 1800000, selling_price: 3899000, barcode: 'BC000031', min_stock: 3 },
  { name: 'Ổ Cứng Di Động 1TB', sku: 'SP032', cost_price: 1200000, selling_price: 2590000, barcode: 'BC000032', min_stock: 3 },
  { name: 'RAM 8GB DDR4 Laptop', sku: 'SP033', cost_price: 450000, selling_price: 959000, barcode: 'BC000033', min_stock: 5 },
  { name: 'RAM 16GB DDR4 Laptop', sku: 'SP034', cost_price: 800000, selling_price: 1699000, barcode: 'BC000034', min_stock: 3 },
  { name: 'Webcam 1080p', sku: 'SP035', cost_price: 250000, selling_price: 549000, barcode: 'BC000035', min_stock: 10 },
  { name: 'Microphone USB', sku: 'SP036', cost_price: 350000, selling_price: 749000, barcode: 'BC000036', min_stock: 5 },
  { name: 'Lót Chuột Cỡ Lớn', sku: 'SP037', cost_price: 40000, selling_price: 99000, barcode: 'BC000037', min_stock: 20 },
  { name: 'Kệ Màn Hình', sku: 'SP038', cost_price: 200000, selling_price: 449000, barcode: 'BC000038', min_stock: 10 },
  { name: 'Đế Giữ Nhiệt USB', sku: 'SP039', cost_price: 120000, selling_price: 269000, barcode: 'BC000039', min_stock: 10 },
  { name: 'Quạt USB Mini', sku: 'SP040', cost_price: 50000, selling_price: 129000, barcode: 'BC000040', min_stock: 20 },

  // --- Mạng & Kết Nối ---
  { name: 'Router WiFi 6 AX1500', sku: 'SP041', cost_price: 500000, selling_price: 1099000, barcode: 'BC000041', min_stock: 5 },
  { name: 'Router WiFi 5 AC1200', sku: 'SP042', cost_price: 250000, selling_price: 549000, barcode: 'BC000042', min_stock: 5 },
  { name: 'Repeater WiFi', sku: 'SP043', cost_price: 200000, selling_price: 439000, barcode: 'BC000043', min_stock: 10 },
  { name: 'Switch 5 Cổng Gigabit', sku: 'SP044', cost_price: 150000, selling_price: 349000, barcode: 'BC000044', min_stock: 10 },
  { name: 'Switch 8 Cổng Gigabit', sku: 'SP045', cost_price: 250000, selling_price: 549000, barcode: 'BC000045', min_stock: 5 },
  { name: 'Cáp Mạng CAT6 3m', sku: 'SP046', cost_price: 25000, selling_price: 59000, barcode: 'BC000046', min_stock: 30 },
  { name: 'Cáp Mạng CAT6 5m', sku: 'SP047', cost_price: 40000, selling_price: 89000, barcode: 'BC000047', min_stock: 20 },
  { name: 'Cáp Mạng CAT6 10m', sku: 'SP048', cost_price: 70000, selling_price: 159000, barcode: 'BC000048', min_stock: 15 },
  { name: 'Adapter USB Ethernet', sku: 'SP049', cost_price: 120000, selling_price: 269000, barcode: 'BC000049', min_stock: 10 },
  { name: 'Camera IP Trong Nhà 2K', sku: 'SP050', cost_price: 400000, selling_price: 899000, barcode: 'BC000050', min_stock: 5 },
  { name: 'Camera IP Ngoài Trời 2K', sku: 'SP051', cost_price: 600000, selling_price: 1399000, barcode: 'BC000051', min_stock: 5 },
  { name: 'Thẻ Nhớ MicroSD 64GB', sku: 'SP052', cost_price: 80000, selling_price: 179000, barcode: 'BC000052', min_stock: 20 },
  { name: 'Thẻ Nhớ MicroSD 128GB', sku: 'SP053', cost_price: 160000, selling_price: 349000, barcode: 'BC000053', min_stock: 15 },
  { name: 'Thẻ Nhớ MicroSD 256GB', sku: 'SP054', cost_price: 300000, selling_price: 649000, barcode: 'BC000054', min_stock: 10 },

  // --- Thiết Bị Thông Minh (Smart Home) ---
  { name: 'Bóng Đèn WiFi Thông Minh', sku: 'SP055', cost_price: 80000, selling_price: 189000, barcode: 'BC000055', min_stock: 20 },
  { name: 'Ổ Cắm WiFi Thông Minh', sku: 'SP056', cost_price: 100000, selling_price: 229000, barcode: 'BC000056', min_stock: 15 },
  { name: 'Công Tắc WiFi Thông Minh', sku: 'SP057', cost_price: 120000, selling_price: 269000, barcode: 'BC000057', min_stock: 15 },
  { name: 'Cảm Biến Cửa Từ', sku: 'SP058', cost_price: 80000, selling_price: 189000, barcode: 'BC000058', min_stock: 20 },
  { name: 'Cảm Biến Chuyển Động', sku: 'SP059', cost_price: 100000, selling_price: 229000, barcode: 'BC000059', min_stock: 20 },
  { name: 'Cảm Biến Khói', sku: 'SP060', cost_price: 150000, selling_price: 349000, barcode: 'BC000060', min_stock: 10 },
  { name: 'Robot Hút Bụi', sku: 'SP061', cost_price: 3000000, selling_price: 6990000, barcode: 'BC000061', min_stock: 2 },
  { name: 'Máy Lọc Không Khí', sku: 'SP062', cost_price: 2000000, selling_price: 4990000, barcode: 'BC000062', min_stock: 2 },
  { name: 'Máy Tạo Ẩm', sku: 'SP063', cost_price: 350000, selling_price: 799000, barcode: 'BC000063', min_stock: 5 },
  { name: 'Máy Sấy Tóc', sku: 'SP064', cost_price: 250000, selling_price: 559000, barcode: 'BC000064', min_stock: 10 },
  { name: 'Bàn Ủi Hơi Nước', sku: 'SP065', cost_price: 400000, selling_price: 899000, barcode: 'BC000065', min_stock: 5 },
  { name: 'Cân Điện Tử Thông Minh', sku: 'SP066', cost_price: 180000, selling_price: 399000, barcode: 'BC000066', min_stock: 10 },

  // --- Gaming ---
  { name: 'Bàn Phím Cơ Gaming RGB', sku: 'SP067', cost_price: 500000, selling_price: 1099000, barcode: 'BC000067', min_stock: 5 },
  { name: 'Chuột Gaming RGB', sku: 'SP068', cost_price: 250000, selling_price: 559000, barcode: 'BC000068', min_stock: 10 },
  { name: 'Tai Nghe Gaming 7.1', sku: 'SP069', cost_price: 400000, selling_price: 899000, barcode: 'BC000069', min_stock: 5 },
  { name: 'Lót Chuột Gaming Lớn', sku: 'SP070', cost_price: 80000, selling_price: 199000, barcode: 'BC000070', min_stock: 15 },
  { name: 'Tay Cầm Chơi Game', sku: 'SP071', cost_price: 250000, selling_price: 559000, barcode: 'BC000071', min_stock: 10 },
  { name: 'Đế Tản Nhiệt Laptop', sku: 'SP072', cost_price: 200000, selling_price: 449000, barcode: 'BC000072', min_stock: 10 },
  { name: 'Ghế Gaming', sku: 'SP073', cost_price: 2500000, selling_price: 5490000, barcode: 'BC000073', min_stock: 2 },
  { name: 'Đèn LED RGB Dây', sku: 'SP074', cost_price: 80000, selling_price: 199000, barcode: 'BC000074', min_stock: 20 },

  // --- Phụ Kiện Máy Tính ---
  { name: 'Cáp HDMI 2.0 2m', sku: 'SP075', cost_price: 40000, selling_price: 99000, barcode: 'BC000075', min_stock: 20 },
  { name: 'Cáp HDMI 2.1 3m', sku: 'SP076', cost_price: 80000, selling_price: 189000, barcode: 'BC000076', min_stock: 15 },
  { name: 'Cáp DisplayPort 2m', sku: 'SP077', cost_price: 100000, selling_price: 239000, barcode: 'BC000077', min_stock: 10 },
  { name: 'Adapter USB-C sang HDMI', sku: 'SP078', cost_price: 150000, selling_price: 349000, barcode: 'BC000078', min_stock: 10 },
  { name: 'Adapter USB-C sang 3.5mm', sku: 'SP079', cost_price: 50000, selling_price: 129000, barcode: 'BC000079', min_stock: 20 },
  { name: 'Đế Sạc Không Dây', sku: 'SP080', cost_price: 120000, selling_price: 269000, barcode: 'BC000080', min_stock: 15 },
  { name: 'Giá Đỡ Điện Thoại', sku: 'SP081', cost_price: 40000, selling_price: 99000, barcode: 'BC000081', min_stock: 20 },
  { name: 'Giá Đỡ Laptop', sku: 'SP082', cost_price: 180000, selling_price: 399000, barcode: 'BC000082', min_stock: 10 },
  { name: 'Túi Chống Sốc Laptop 14"', sku: 'SP083', cost_price: 120000, selling_price: 279000, barcode: 'BC000083', min_stock: 10 },
  { name: 'Túi Chống Sốc Laptop 15.6"', sku: 'SP084', cost_price: 150000, selling_price: 349000, barcode: 'BC000084', min_stock: 10 },
  { name: 'Balo Laptop 15.6"', sku: 'SP085', cost_price: 250000, selling_price: 559000, barcode: 'BC000085', min_stock: 5 },
  { name: 'Khăn Lau Màn Hình', sku: 'SP086', cost_price: 15000, selling_price: 39000, barcode: 'BC000086', min_stock: 50 },
  { name: 'Bộ Vệ Sinh Màn Hình', sku: 'SP087', cost_price: 40000, selling_price: 99000, barcode: 'BC000087', min_stock: 30 },

  // --- Thiết Bị Âm Thanh ---
  { name: 'Loa Kéo Di Động 40W', sku: 'SP088', cost_price: 500000, selling_price: 1099000, barcode: 'BC000088', min_stock: 3 },
  { name: 'Loa Kéo Di Động 100W', sku: 'SP089', cost_price: 1000000, selling_price: 2299000, barcode: 'BC000089', min_stock: 2 },
  { name: 'Micro Karaoke Không Dây', sku: 'SP090', cost_price: 250000, selling_price: 559000, barcode: 'BC000090', min_stock: 5 },
  { name: 'Soundbar 2.0', sku: 'SP091', cost_price: 500000, selling_price: 1099000, barcode: 'BC000091', min_stock: 3 },
  { name: 'Tai Nghe Chống Ồn', sku: 'SP092', cost_price: 800000, selling_price: 1799000, barcode: 'BC000092', min_stock: 3 },
  { name: 'Earphone Bluetooth', sku: 'SP093', cost_price: 150000, selling_price: 349000, barcode: 'BC000093', min_stock: 15 },
  { name: 'Adapter Bluetooth 5.0', sku: 'SP094', cost_price: 50000, selling_price: 129000, barcode: 'BC000094', min_stock: 20 },
  { name: 'Dây Đeo Tai Nghe Bluetooth', sku: 'SP095', cost_price: 30000, selling_price: 79000, barcode: 'BC000095', min_stock: 30 },

  // --- An Ninh & Giám Sát ---
  { name: 'Khóa Thông Minh Vân Tay', sku: 'SP096', cost_price: 1200000, selling_price: 2990000, barcode: 'BC000096', min_stock: 2 },
  { name: 'Chuông Cửa Thông Minh', sku: 'SP097', cost_price: 350000, selling_price: 799000, barcode: 'BC000097', min_stock: 5 },
  { name: 'Camera Hành Trình', sku: 'SP098', cost_price: 500000, selling_price: 1199000, barcode: 'BC000098', min_stock: 5 },
  { name: 'Định Vị GPS Xe Máy', sku: 'SP099', cost_price: 300000, selling_price: 699000, barcode: 'BC000099', min_stock: 5 },
  { name: 'Báo Cháy Mini', sku: 'SP100', cost_price: 80000, selling_price: 199000, barcode: 'BC000100', min_stock: 10 },

  // --- Điện Gia Dụng ---
  { name: 'Nồi Cơm Điện 1L', sku: 'SP101', cost_price: 200000, selling_price: 459000, barcode: 'BC000101', min_stock: 5 },
  { name: 'Nồi Cơm Điện 1.8L', sku: 'SP102', cost_price: 300000, selling_price: 689000, barcode: 'BC000102', min_stock: 5 },
  { name: 'Nồi Chiên Không Dầu 5.5L', sku: 'SP103', cost_price: 500000, selling_price: 1199000, barcode: 'BC000103', min_stock: 3 },
  { name: 'Nồi Chiên Không Dầu 8L', sku: 'SP104', cost_price: 700000, selling_price: 1699000, barcode: 'BC000104', min_stock: 2 },
  { name: 'Ấm Đun Siêu Tốc 1.7L', sku: 'SP105', cost_price: 120000, selling_price: 289000, barcode: 'BC000105', min_stock: 10 },
  { name: 'Bếp Điện Từ Đôi', sku: 'SP106', cost_price: 800000, selling_price: 1899000, barcode: 'BC000106', min_stock: 3 },
  { name: 'Lò Vi Sóng 20L', sku: 'SP107', cost_price: 900000, selling_price: 2099000, barcode: 'BC000107', min_stock: 2 },
  { name: 'Máy Xay Sinh Tố', sku: 'SP108', cost_price: 250000, selling_price: 599000, barcode: 'BC000108', min_stock: 5 },
  { name: 'Máy Ép Chậm', sku: 'SP109', cost_price: 600000, selling_price: 1499000, barcode: 'BC000109', min_stock: 3 },
  { name: 'Bàn Là Hơi Nước Đứng', sku: 'SP110', cost_price: 800000, selling_price: 1899000, barcode: 'BC000110', min_stock: 2 },
  { name: 'Máy Hút Bụi Cầm Tay', sku: 'SP111', cost_price: 500000, selling_price: 1199000, barcode: 'BC000111', min_stock: 3 },
  { name: 'Quạt Điều Hòa', sku: 'SP112', cost_price: 600000, selling_price: 1399000, barcode: 'BC000112', min_stock: 3 },
  { name: 'Quạt Phun Sương', sku: 'SP113', cost_price: 350000, selling_price: 799000, barcode: 'BC000113', min_stock: 5 },
  { name: 'Đèn Ngủ LED', sku: 'SP114', cost_price: 80000, selling_price: 199000, barcode: 'BC000114', min_stock: 15 },
  { name: 'Đèn Bàn LED', sku: 'SP115', cost_price: 150000, selling_price: 349000, barcode: 'BC000115', min_stock: 10 },

  // --- Vật Tư Tiêu Hao ---
  { name: 'Pin AA Energizer (Hộp 4)', sku: 'SP116', cost_price: 20000, selling_price: 49000, barcode: 'BC000116', min_stock: 50 },
  { name: 'Pin AAA Energizer (Hộp 4)', sku: 'SP117', cost_price: 20000, selling_price: 49000, barcode: 'BC000117', min_stock: 50 },
  { name: 'Bóng Đèn LED 9W', sku: 'SP118', cost_price: 25000, selling_price: 59000, barcode: 'BC000118', min_stock: 30 },
  { name: 'Bóng Đèn LED 15W', sku: 'SP119', cost_price: 35000, selling_price: 79000, barcode: 'BC000119', min_stock: 30 },
  { name: 'Cầu Dao Tự Động 20A', sku: 'SP120', cost_price: 40000, selling_price: 99000, barcode: 'BC000120', min_stock: 20 },
  { name: 'Ổ Cắm Điện 3 Lỗ', sku: 'SP121', cost_price: 25000, selling_price: 59000, barcode: 'BC000121', min_stock: 40 },
  { name: 'Công Tắc Điện 1 Chiều', sku: 'SP122', cost_price: 15000, selling_price: 39000, barcode: 'BC000122', min_stock: 50 },
  { name: 'Băng Keo Điện', sku: 'SP123', cost_price: 8000, selling_price: 20000, barcode: 'BC000123', min_stock: 100 },
  { name: 'Dây Điện Đôi 1.5mm (mét)', sku: 'SP124', cost_price: 8000, selling_price: 20000, barcode: 'BC000124', min_stock: 100 },
  { name: 'Dây Điện Đôi 2.5mm (mét)', sku: 'SP125', cost_price: 12000, selling_price: 30000, barcode: 'BC000125', min_stock: 80 },

  // --- Dụng Cụ ---
  { name: 'Tua Vít 4 Chi Tiết', sku: 'SP126', cost_price: 20000, selling_price: 50000, barcode: 'BC000126', min_stock: 30 },
  { name: 'Bộ Tua Vít 12 Chi Tiết', sku: 'SP127', cost_price: 80000, selling_price: 199000, barcode: 'BC000127', min_stock: 10 },
  { name: 'Kìm Đa Năng', sku: 'SP128', cost_price: 40000, selling_price: 99000, barcode: 'BC000128', min_stock: 15 },
  { name: 'Kìm Bấm Cáp Mạng', sku: 'SP129', cost_price: 80000, selling_price: 199000, barcode: 'BC000129', min_stock: 10 },
  { name: 'Bút Thử Điện', sku: 'SP130', cost_price: 15000, selling_price: 39000, barcode: 'BC000130', min_stock: 30 },
  { name: 'Đồng Hồ Vạn Năng', sku: 'SP131', cost_price: 120000, selling_price: 289000, barcode: 'BC000131', min_stock: 5 },
  { name: 'Máy Khoan Mini', sku: 'SP132', cost_price: 200000, selling_price: 459000, barcode: 'BC000132', min_stock: 5 },
  { name: 'Súng Bắn Keo', sku: 'SP133', cost_price: 40000, selling_price: 99000, barcode: 'BC000133', min_stock: 15 },
  { name: 'Keo Nến (Cây)', sku: 'SP134', cost_price: 3000, selling_price: 10000, barcode: 'BC000134', min_stock: 100 },
  { name: 'Thước Mét 5m', sku: 'SP135', cost_price: 20000, selling_price: 50000, barcode: 'BC000135', min_stock: 20 },

  // --- Mỹ Phẩm & Chăm Sóc ---
  { name: 'Sữa Rửa Mặt Nam', sku: 'SP136', cost_price: 40000, selling_price: 99000, barcode: 'BC000136', min_stock: 20 },
  { name: 'Sữa Rửa Mặt Nữ', sku: 'SP137', cost_price: 50000, selling_price: 129000, barcode: 'BC000137', min_stock: 20 },
  { name: 'Kem Chống Nắng SPF50', sku: 'SP138', cost_price: 80000, selling_price: 199000, barcode: 'BC000138', min_stock: 15 },
  { name: 'Sữa Dưỡng Thể', sku: 'SP139', cost_price: 60000, selling_price: 149000, barcode: 'BC000139', min_stock: 15 },
  { name: 'Nước Hoa Nam 50ml', sku: 'SP140', cost_price: 200000, selling_price: 499000, barcode: 'BC000140', min_stock: 5 },
  { name: 'Nước Hoa Nữ 50ml', sku: 'SP141', cost_price: 250000, selling_price: 599000, barcode: 'BC000141', min_stock: 5 },
  { name: 'Dầu Gội 400ml', sku: 'SP142', cost_price: 60000, selling_price: 149000, barcode: 'BC000142', min_stock: 20 },
  { name: 'Sữa Tắm 400ml', sku: 'SP143', cost_price: 50000, selling_price: 129000, barcode: 'BC000143', min_stock: 20 },
  { name: 'Lăn Khử Mùi Nam', sku: 'SP144', cost_price: 25000, selling_price: 65000, barcode: 'BC000144', min_stock: 30 },
  { name: 'Bàn Chải Điện', sku: 'SP145', cost_price: 200000, selling_price: 479000, barcode: 'BC000145', min_stock: 10 },
  { name: 'Máy Cạo Râu Điện', sku: 'SP146', cost_price: 250000, selling_price: 599000, barcode: 'BC000146', min_stock: 5 },
  { name: 'Máy Tăm Nước', sku: 'SP147', cost_price: 300000, selling_price: 699000, barcode: 'BC000147', min_stock: 5 },

  // --- Văn Phòng Phẩm ---
  { name: 'Giấy A4 Double A 500 tờ', sku: 'SP148', cost_price: 55000, selling_price: 99000, barcode: 'BC000148', min_stock: 50 },
  { name: 'Giấy A4 IK Plus 500 tờ', sku: 'SP149', cost_price: 40000, selling_price: 79000, barcode: 'BC000149', min_stock: 50 },
  { name: 'Bút Bi TL-027 (Hộp 10)', sku: 'SP150', cost_price: 15000, selling_price: 35000, barcode: 'BC000150', min_stock: 100 },
  { name: 'Bút Lông Bảng Đen', sku: 'SP151', cost_price: 8000, selling_price: 20000, barcode: 'BC000151', min_stock: 50 },
  { name: 'Bút Highlight 5 Màu', sku: 'SP152', cost_price: 20000, selling_price: 49000, barcode: 'BC000152', min_stock: 30 },
  { name: 'Sổ Tay A5 Bìa Cứng', sku: 'SP153', cost_price: 25000, selling_price: 59000, barcode: 'BC000153', min_stock: 30 },
  { name: 'Sticky Notes 3x3 (Gói 5)', sku: 'SP154', cost_price: 15000, selling_price: 35000, barcode: 'BC000154', min_stock: 50 },
  { name: 'Băng Dính Trong (Cuộn Lớn)', sku: 'SP155', cost_price: 8000, selling_price: 20000, barcode: 'BC000155', min_stock: 50 },
  { name: 'Kéo Văn Phòng', sku: 'SP156', cost_price: 10000, selling_price: 25000, barcode: 'BC000156', min_stock: 30 },
  { name: 'Dao Rọc Giấy Lớn', sku: 'SP157', cost_price: 8000, selling_price: 20000, barcode: 'BC000157', min_stock: 30 },
  { name: 'Bìa Hồ Sơ Thẻ Bài', sku: 'SP158', cost_price: 5000, selling_price: 12000, barcode: 'BC000158', min_stock: 100 },
  { name: 'Bấm Kim Lớn', sku: 'SP159', cost_price: 30000, selling_price: 69000, barcode: 'BC000159', min_stock: 20 },
  { name: 'Ghim Bấm (Hộp 1000)', sku: 'SP160', cost_price: 8000, selling_price: 20000, barcode: 'BC000160', min_stock: 50 },

  // --- Thời Trang ---
  { name: 'Áo Thun Nam Trơn', sku: 'SP161', cost_price: 60000, selling_price: 149000, barcode: 'BC000161', min_stock: 30 },
  { name: 'Áo Thun Nữ Trơn', sku: 'SP162', cost_price: 55000, selling_price: 139000, barcode: 'BC000162', min_stock: 30 },
  { name: 'Áo Sơ Mi Nam Trắng', sku: 'SP163', cost_price: 100000, selling_price: 249000, barcode: 'BC000163', min_stock: 20 },
  { name: 'Quần Jean Nam', sku: 'SP164', cost_price: 200000, selling_price: 499000, barcode: 'BC000164', min_stock: 15 },
  { name: 'Quần Jean Nữ', sku: 'SP165', cost_price: 180000, selling_price: 449000, barcode: 'BC000165', min_stock: 15 },
  { name: 'Ví Da Nam', sku: 'SP166', cost_price: 80000, selling_price: 199000, barcode: 'BC000166', min_stock: 10 },
  { name: 'Thắt Lưng Da Nam', sku: 'SP167', cost_price: 100000, selling_price: 249000, barcode: 'BC000167', min_stock: 10 },
  { name: 'Túi Xách Nữ', sku: 'SP168', cost_price: 150000, selling_price: 379000, barcode: 'BC000168', min_stock: 10 },
  { name: 'Balo Thời Trang', sku: 'SP169', cost_price: 120000, selling_price: 299000, barcode: 'BC000169', min_stock: 10 },
  { name: 'Mũ Lưỡi Trai', sku: 'SP170', cost_price: 25000, selling_price: 65000, barcode: 'BC000170', min_stock: 30 },
  { name: 'Khăn Choàng Cổ', sku: 'SP171', cost_price: 30000, selling_price: 79000, barcode: 'BC000171', min_stock: 20 },
  { name: 'Dây Chuyền Bạc Nam', sku: 'SP172', cost_price: 80000, selling_price: 199000, barcode: 'BC000172', min_stock: 10 },
  { name: 'Đồng Hồ Nam Dây Da', sku: 'SP173', cost_price: 200000, selling_price: 499000, barcode: 'BC000173', min_stock: 5 },
  { name: 'Đồng Hồ Nữ Dây Kim Loại', sku: 'SP174', cost_price: 180000, selling_price: 449000, barcode: 'BC000174', min_stock: 5 },
  { name: 'Kính Mát Thời Trang', sku: 'SP175', cost_price: 50000, selling_price: 149000, barcode: 'BC000175', min_stock: 20 },

  // --- Bách Hóa ---
  { name: 'Bột Giặt 2.5kg', sku: 'SP176', cost_price: 40000, selling_price: 89000, barcode: 'BC000176', min_stock: 30 },
  { name: 'Nước Giặt 3L', sku: 'SP177', cost_price: 55000, selling_price: 129000, barcode: 'BC000177', min_stock: 20 },
  { name: 'Nước Xả Vải 3L', sku: 'SP178', cost_price: 50000, selling_price: 119000, barcode: 'BC000178', min_stock: 20 },
  { name: 'Nước Lau Sàn 2L', sku: 'SP179', cost_price: 25000, selling_price: 59000, barcode: 'BC000179', min_stock: 30 },
  { name: 'Nước Rửa Chén 1L', sku: 'SP180', cost_price: 20000, selling_price: 49000, barcode: 'BC000180', min_stock: 30 },
  { name: 'Nước Tẩy Trắng 1L', sku: 'SP181', cost_price: 15000, selling_price: 35000, barcode: 'BC000181', min_stock: 30 },
  { name: 'Khăn Giấy Vạn Năng (Gói 10)', sku: 'SP182', cost_price: 20000, selling_price: 49000, barcode: 'BC000182', min_stock: 50 },
  { name: 'Khăn Ướt (Gói 100)', sku: 'SP183', cost_price: 15000, selling_price: 35000, barcode: 'BC000183', min_stock: 50 },
  { name: 'Túi Rác 50x60 (Cuộn 30)', sku: 'SP184', cost_price: 12000, selling_price: 29000, barcode: 'BC000184', min_stock: 50 },
  { name: 'Màng Bọc Thực Phẩm', sku: 'SP185', cost_price: 10000, selling_price: 25000, barcode: 'BC000185', min_stock: 50 },
  { name: 'Giấy Bạc Gói Thực Phẩm', sku: 'SP186', cost_price: 12000, selling_price: 29000, barcode: 'BC000186', min_stock: 50 },
  { name: 'Nến Thơm', sku: 'SP187', cost_price: 30000, selling_price: 79000, barcode: 'BC000187', min_stock: 20 },
  { name: 'Tinh Dầu Thơm Phòng', sku: 'SP188', cost_price: 40000, selling_price: 99000, barcode: 'BC000188', min_stock: 20 },
  { name: 'Đuổi Muỗi Điện Tử', sku: 'SP189', cost_price: 30000, selling_price: 69000, barcode: 'BC000189', min_stock: 30 },
  { name: 'Bình Giữ Nhiệt 500ml', sku: 'SP190', cost_price: 80000, selling_price: 199000, barcode: 'BC000190', min_stock: 15 },
  { name: 'Bình Giữ Nhiệt 1L', sku: 'SP191', cost_price: 120000, selling_price: 289000, barcode: 'BC000191', min_stock: 10 },
  { name: 'Hộp Cơm Thủy Tinh', sku: 'SP192', cost_price: 50000, selling_price: 129000, barcode: 'BC000192', min_stock: 20 },
  { name: 'Hộp Cơm Inox', sku: 'SP193', cost_price: 70000, selling_price: 169000, barcode: 'BC000193', min_stock: 15 },
  { name: 'Bộ Dao Nhà Bếp 3 Món', sku: 'SP194', cost_price: 100000, selling_price: 249000, barcode: 'BC000194', min_stock: 10 },
  { name: 'Thớt Gỗ Lớn', sku: 'SP195', cost_price: 60000, selling_price: 149000, barcode: 'BC000195', min_stock: 15 },
  { name: 'Nồi Inox 3 Đáy 24cm', sku: 'SP196', cost_price: 200000, selling_price: 479000, barcode: 'BC000196', min_stock: 5 },
  { name: 'Chảo Chống Dính 26cm', sku: 'SP197', cost_price: 150000, selling_price: 379000, barcode: 'BC000197', min_stock: 10 },
  { name: 'Rây Lọc Dầu', sku: 'SP198', cost_price: 25000, selling_price: 69000, barcode: 'BC000198', min_stock: 20 },
  { name: 'Bộ Đồ Ăn Tre 5 Món', sku: 'SP199', cost_price: 30000, selling_price: 79000, barcode: 'BC000199', min_stock: 30 },
  { name: 'Rổ Nhựa Đa Năng', sku: 'SP200', cost_price: 25000, selling_price: 59000, barcode: 'BC000200', min_stock: 30 },
];

async function main() {
  console.log('🚀 Bắt đầu seed 200 sản phẩm...\n');

  // 1. Xoá dữ liệu cũ
  console.log('🗑️  Xoá dữ liệu cũ...');
  await supabase.from('inventory_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Đã xoá dữ liệu cũ\n');

  // 2. Insert 200 sản phẩm
  console.log('📦 Đang insert sản phẩm...');
  const { data: products, error: prodError } = await supabase
    .from('products')
    .insert(productData.map((p, i) => ({
      sku: p.sku,
      name: p.name,
      barcode: p.barcode,
      cost_price: p.cost_price,
      selling_price: p.selling_price,
      min_stock: p.min_stock,
      created_at: new Date(Date.now() - (200 - i) * 86400000).toISOString(), // mỗi sản phẩm cách nhau 1 ngày
    })))
    .select('id, sku, name, cost_price, selling_price');

  if (prodError) {
    console.error('❌ Lỗi insert sản phẩm:', prodError);
    process.exit(1);
  }

  console.log(`✅ Insert ${products.length} sản phẩm thành công\n`);

  // 3. Nhập kho: mỗi sản phẩm nhập 20-100 cái
  console.log('📥 Đang tạo giao dịch nhập kho...');
  const inTransactions = [];
  const now = new Date();
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const qty = 30 + Math.floor(Math.random() * 120); // 30-150 cái
    const daysAgo = products.length - i;
    const date = new Date(now.getTime() - daysAgo * 86400000);
    inTransactions.push({
      product_id: p.id,
      type: 'IN',
      quantity: qty,
      price: p.cost_price,
      transaction_date: date.toISOString(),
      note: 'Nhập kho lần đầu',
    });

    // Thêm 1-2 lần nhập bổ sung cho 50% sản phẩm
    if (Math.random() > 0.5) {
      const qty2 = 10 + Math.floor(Math.random() * 50);
      const date2 = new Date(now.getTime() - (daysAgo - 3) * 86400000);
      inTransactions.push({
        product_id: p.id,
        type: 'IN',
        quantity: qty2,
        price: p.cost_price * (1 + (Math.random() - 0.3) * 0.1),
        transaction_date: date2.toISOString(),
        note: 'Nhập bổ sung',
      });
    }
  }

  // Insert theo batch 50
  for (let i = 0; i < inTransactions.length; i += 50) {
    const batch = inTransactions.slice(i, i + 50);
    const { error: txError } = await supabase.from('inventory_transactions').insert(batch);
    if (txError) {
      console.error(`❌ Lỗi insert nhập kho batch ${i}:`, txError);
    }
  }
  console.log(`✅ Tạo ${inTransactions.length} giao dịch nhập kho\n`);

  // 4. Bán hàng: 60% sản phẩm đã bán 1-5 lần
  console.log('💰 Đang tạo giao dịch bán hàng...');
  const outTransactions = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const pIdx = products.length - i;

    // 60% sản phẩm có 1-5 lần bán
    if (Math.random() > 0.4) {
      const numSales = 1 + Math.floor(Math.random() * 5); // 1-5 lần bán
      for (let s = 0; s < numSales; s++) {
        const qty = 1 + Math.floor(Math.random() * 8); // 1-8 cái/lần
        const daysAgo = Math.max(1, pIdx - Math.floor(Math.random() * 10));
        const date = new Date(now.getTime() - daysAgo * 86400000 + Math.floor(Math.random() * 12) * 3600000);
        outTransactions.push({
          product_id: p.id,
          type: 'OUT',
          quantity: qty,
          price: p.selling_price,
          transaction_date: date.toISOString(),
          note: 'Bán lẻ',
        });
      }
    }
  }

  // Insert theo batch 50
  for (let i = 0; i < outTransactions.length; i += 50) {
    const batch = outTransactions.slice(i, i + 50);
    const { error: outError } = await supabase.from('inventory_transactions').insert(batch);
    if (outError) {
      console.error(`❌ Lỗi insert bán hàng batch ${i}:`, outError);
    }
  }
  console.log(`✅ Tạo ${outTransactions.length} giao dịch bán hàng\n`);

  // 5. Tổng kết
  console.log('📊 TỔNG KẾT:');
  console.log(`   - ${products.length} sản phẩm`);
  console.log(`   - ${inTransactions.length} giao dịch nhập kho`);
  console.log(`   - ${outTransactions.length} giao dịch bán hàng`);
  console.log(`   - Tổng: ${inTransactions.length + outTransactions.length} giao dịch\n`);

  // Kiểm tra nhanh
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: txCount } = await supabase.from('inventory_transactions').select('*', { count: 'exact', head: true });
  console.log(`🔍 Xác minh: ${prodCount} sản phẩm, ${txCount} giao dịch trong DB`);
  console.log('\n✅ HOÀN THÀNH! 🚀');
}

main().catch(console.error);
