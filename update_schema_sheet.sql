-- 1. Thêm cột 'google_sheet_url' vào bảng trips
ALTER TABLE trips ADD COLUMN IF NOT EXISTS google_sheet_url text;

-- 2. Reload lại Schema Cache
NOTIFY pgrst, 'reload config';
