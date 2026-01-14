const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Đọc file .env.local để lấy Key
const envPath = path.resolve(__dirname, '.env.local');
let env = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/"/g, '');
            env[key] = value;
        }
    });
} catch (e) {
    console.error("❌ Không đọc được file .env.local");
    process.exit(1);
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
// Ưu tiên dùng Service Role Key để có quyền Admin sửa DB
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Thiếu thông tin Supabase trong .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const paymentCode = process.argv[2];

if (!paymentCode) {
    console.log("⚠️ Vui lòng nhập mã đơn hàng cần reset!");
    console.log("👉 Ví dụ: node reset-booking.js HOLA7102");
    process.exit(1);
}

// 2. Thực hiện Reset
(async () => {
    console.log(`🔄 Đang reset đơn hàng ${paymentCode} về trạng thái 'PENDING'...`);

    // Update status = 'PENDING' để Webhook có thể xử lý lại
    const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'PENDING' })
        .eq('payment_code', paymentCode)
        .select();

    if (error) {
        console.error("❌ Lỗi khi update:", error.message);
    } else if (data.length === 0) {
        console.log("⚠️ Không tìm thấy đơn hàng nào có mã này (hoặc đã bị xóa).");
    } else {
        console.log("✅ THÀNH CÔNG! Đơn hàng đã trở về PENDING.");
        console.log("👉 Giờ bạn có thể chạy lại lệnh test webhook.");
    }
})();
