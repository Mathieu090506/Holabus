// Node 18+ supports fetch natively

const WEBHOOK_SECRET = 'HOLA_BUS_SECRET_2026_MEOWMEOWMEOW';
const URL = 'http://localhost:3000/api/webhook';

// Lấy mã đơn từ tham số dòng lệnh
const paymentCode = process.argv[2];
const amount = process.argv[3] || 1000000; // Default amount huge to ensure payment success

if (!paymentCode) {
    console.log("❌ Vui lòng nhập mã đơn hàng (Payment Code)!");
    console.log("👉 Ví dụ: node test-webhook.js HOLA12345 200000");
    process.exit(1);
}

const payload = {
    error: 0,
    data: [
        {
            id: Math.floor(Math.random() * 1000000),
            tid: "GD" + Math.floor(Math.random() * 1000000),
            description: `${paymentCode} TESTING PAYMENT`,
            amount: parseInt(amount),
            cusum_balance: 10000000,
            when: new Date().toISOString(),
            bank_sub_acc_id: "0123456789"
        }
    ]
};

console.log(`🚀 Đang gửi Webhook test cho đơn: ${paymentCode} (Số tiền: ${amount})...`);

(async () => {
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'secure-token': WEBHOOK_SECRET
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("✅ Kết quả Server trả về:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("❌ Lỗi kết nối:", error.message);
    }
})();
