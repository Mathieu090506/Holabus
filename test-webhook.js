// Nodejs v18+ đã có fetch built-in

// Nếu chạy lỗi 'require not defined' hoặc 'fetch not defined', hãy dùng: node --experimental-fetch test-webhook.js (với Node cũ)
// Hoặc đổi tên thành .mjs

// CẤU HÌNH
const API_URL = 'http://localhost:3000/api/webhook';
const WEBHOOK_SECRET = 'YOUR_SECURE_TOKEN'; // <--- ĐIỀN TOKEN TRONG .env.local CỦA BẠN VÀO ĐÂY

async function run() {
    // Giả lập 1 giao dịch từ Casso
    const payload = {
        error: 0,
        message: "success",
        data: [
            {
                id: Math.floor(Math.random() * 1000000),
                tid: "TEST_" + Date.now(),
                description: "CK HOLA12345 DEMO", // <--- Thay HOLA12345 bằng mã đơn thật để test update DB
                amount: 100000,
                cusum_balance: 5000000,
                when: new Date().toISOString(),
                bank_sub_acc_id: "00000"
            }
        ]
    };

    console.log("🚀 Đang gửi Webhook giả lập tới:", API_URL);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'secure-token': WEBHOOK_SECRET, // Giả lập header từ Casso
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("✅ Kết quả:", res.status, data);
    } catch (err) {
        console.error("❌ Lỗi kết nối:", err);
    }
}

run();
