'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function DebugWebhookPage() {
    const [paymentCode, setPaymentCode] = useState('');
    const [amount, setAmount] = useState('100000');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const handleSimulate = async () => {
        if (!paymentCode) return toast.error('Nhập mã đơn hàng!');
        if (!token) return toast.error('Nhập Secure Token!');

        setLoading(true);
        addLog(`Bắt đầu giả lập Webhook cho mã: ${paymentCode}`);

        try {
            const payload = {
                error: 0,
                data: [
                    {
                        id: Date.now(),
                        bookingDate: new Date().toISOString(),
                        description: `Chuyen khoan ${paymentCode}`,
                        amount: Number(amount),
                        tid: `debug_${Date.now()}`
                    }
                ]
            };

            const response = await fetch('/api/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-secure-token': token
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            addLog(`Response Status: ${response.status}`);
            addLog(`Response Body: ${JSON.stringify(data, null, 2)}`);

            if (response.ok) {
                toast.success('Gửi webhook giả lập thành công!');
            } else {
                toast.error('Gửi thất bại: ' + (data.error || 'Unknown'));
            }

        } catch (err: any) {
            addLog(`Lỗi: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto space-y-6 pt-32">
            <h1 className="text-2xl font-bold">🛠️ Công cụ Test Webhook (Giả lập Casso)</h1>

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm">
                <p>Công cụ này giúp bạn kiểm tra xem Logic Code xử lý thanh toán có hoạt động đúng không.</p>
                <p className="mt-1 font-bold">Cách dùng:</p>
                <ul className="list-disc ml-5 mt-1">
                    <li>1. Đặt một vé mới ngoài trang chủ -> Có Mã thanh toán (VD: HOLA...)</li>
                    <li>2. Copy mã đó vào đây.</li>
                    <li>3. Nhập Secure Token (Lấy trong .env.local hoặc Casso).</li>
                    <li>4. Bấm Gửi -> Nếu thành công, vé sẽ chuyển sang PAID.</li>
                </ul>
            </div>

            <div className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
                <div>
                    <label className="block text-sm font-medium mb-1">Mã thanh toán (VD: HOLA8X21)</label>
                    <input
                        value={paymentCode}
                        onChange={(e) => setPaymentCode(e.target.value.toUpperCase())}
                        className="w-full p-2 border rounded"
                        placeholder="HOLA..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Secure Token (Lấy trong .env.local)</label>
                    <input
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Nhập token..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Số tiền (VNĐ)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <button
                    onClick={handleSimulate}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
                >
                    {loading ? 'Đang gửi...' : 'GỬI GIẢ LẬP WEBHOOK'}
                </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-xl min-h-[300px] font-mono text-xs overflow-auto">
                {logs.map((log, i) => (
                    <div key={i} className="border-b border-gray-800 pb-1 mb-1 last:border-0 whitespace-pre-wrap">{log}</div>
                ))}
                {logs.length === 0 && <span className="text-gray-500">Chưa có logs...</span>}
            </div>
        </div>
    );
}
