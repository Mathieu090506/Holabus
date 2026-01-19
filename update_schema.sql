-- Copy toàn bộ đoạn dưới đây và chạy trong SQL Editor của Supabase Dashboard

-- 1. Thêm cột 'tags' vào bảng trips (nếu chưa có)
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tags text;

-- 2. (Quan trọng) Reload lại bộ nhớ đệm của API để nó nhận diện cột mới ngay lập tức
NOTIFY pgrst, 'reload config';

-- 3. Tạo bảng daily_stats để theo dõi lượt truy cập theo ngày
CREATE TABLE IF NOT EXISTS daily_stats (
    date date PRIMARY KEY DEFAULT CURRENT_DATE,
    visit_count int DEFAULT 0
);

-- 4. Bật Row Level Security (RLS) cho bảng này
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- 5. Tạo chính sách (đơn giản hóa cho demo)
CREATE POLICY "Enable read/write for all" ON daily_stats FOR ALL USING (true) WITH CHECK (true);

-- 6. Function RPC để tăng biến đếm an toàn
CREATE OR REPLACE FUNCTION increment_visit_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO daily_stats (date, visit_count)
  VALUES (current_date, 1)
  ON CONFLICT (date)
  DO UPDATE SET visit_count = daily_stats.visit_count + 1;
END;
$$;


-- 7. [MỚI] Thêm cột assigned_to vào bảng coupons để tracking vé đã được quay trúng
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS assigned_to uuid;
