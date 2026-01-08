import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle, Clock, ArrowLeft, Copy, CreditCard, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PaymentTimer from '@/components/payment-timer';
import { bankConfig } from '@/config/bank';

// --- CẤU HÌNH TÀI KHOẢN NHẬN TIỀN (SỬA LẠI CỦA BẠN) ---


import PaymentStatusChecker from '@/components/payment-status-checker';

// Định nghĩa kiểu Props cho Next.js 16 (params là Promise)
type Props = {
    params: Promise<{ id: string }>;
};

export default async function PaymentPage({ params }: Props) {
    // 1. Giải nén params (Bắt buộc await trong Next.js 15/16)
    const { id } = await params;
    const supabase = await createClient();

    // 2. Lấy thông tin đơn hàng + Kèm thông tin chuyến xe (Join table)
    const { data: bookingData, error } = await supabase
        .from('bookings')
        .select(`
      *,
      trips (
        origin,
        destination,
        departure_time
      )
    `)
        .eq('id', id)
        .single();

    // Cast to any to avoid TS errors
    const booking = bookingData as any;

    // Nếu không tìm thấy đơn hoặc lỗi -> Trả về 404
    if (error || !booking) {
        return notFound();
    }

    // --- LOGIC MỚI: KIỂM TRA HẾT HẠN (10 PHÚT) ---
    const createdAt = new Date(booking.created_at).getTime();
    const now = new Date().getTime();
    const timeLimit = 10 * 60 * 1000; // 10 phút (tính bằng mili giây)
    const timeLeft = timeLimit - (now - createdAt);

    // Nếu vé chưa thanh toán (PENDING) mà đã hết giờ
    if (booking.status === 'PENDING' && timeLeft <= 0) {

        // 1. Không xóa vé khỏi DB để tránh mất dữ liệu nếu khách chuyển muộn
        // await supabase.from('bookings').delete().eq('id', id);

        // 2. Trả về giao diện báo lỗi (Return luôn để chặn code bên dưới chạy)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Vé đã hết hạn!</h1>
                    <p className="text-gray-500 mb-6">
                        Rất tiếc, thời gian giữ chỗ 10 phút đã kết thúc. Vé của bạn đã bị hủy tự động để nhường chỗ cho người khác.
                    </p>
                    <Link
                        href="/"
                        className="block w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                        Đặt vé lại
                    </Link>
                </div>
            </div>
        );
    }
    // 👆👆👆 KẾT THÚC ĐOẠN CODE MỚI 👆👆👆

    // 3. LOGIC HIỂN THỊ
    // Nếu đơn đã thanh toán rồi -> Redirect sang trang vé chi tiết
    if (booking.status === 'PAID') {
        redirect(`/ticket/${booking.payment_code}`);
    }

    // 4. TẠO LINK VIETQR (Dynamic QR Code)
    // Cú pháp: https://img.vietqr.io/image/[BANK]-[ACC]-[TEMPLATE].png?amount=...&addInfo=...

    // Nội dung CK: "[CODE]" (Rất quan trọng để Casso bắt tự động)
    const transferContent = `${booking.payment_code}`;

    const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-${bankConfig.template}.png?amount=${booking.amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;

    // Tính thời gian hết hạn (Created + 10 phút)
    // Lưu ý: Đây chỉ là hiển thị, logic thực tế nằm ở DB Trigger
    const createdTime = new Date(booking.created_at);
    const expiredTime = new Date(createdTime.getTime() + 10 * 60000);

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-10 pt-32 px-4 md:pb-20">
            <PaymentStatusChecker bookingId={id} />
            <div className="max-w-xl mx-auto">
                {/* Nút Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header cam giữ nguyên */}
                    <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6 relative overflow-hidden">
                        {/* ... */}
                    </div>

                    <div className="p-6 md:p-8">

                        {/* 👇👇👇 THAY THẾ HỘP CẢNH BÁO CŨ BẰNG ĐỒNG HỒ MỚI 👇👇👇 */}
                        <div className="flex justify-center mb-8">
                            {/* Truyền thời điểm hết hạn vào đây */}
                            <PaymentTimer targetDate={expiredTime.getTime()} />
                        </div>

                        {/* Nếu muốn giữ dòng nhắc nhở nhỏ bên dưới */}
                        <p className="text-center text-sm text-gray-500 mb-8 -mt-4">
                            Vui lòng thanh toán trước khi thời gian kết thúc.
                        </p>

                        {/* QR Code Section */}
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                                <div className="relative bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                                    {/* Dùng thẻ img thường để tránh config next/image domain phức tạp lúc này */}
                                    <img
                                        src={qrUrl}
                                        alt="Mã QR Thanh Toán"
                                        className="w-64 h-auto md:w-72 object-contain rounded-lg"
                                    />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Mở App Ngân hàng &rarr; Quét mã QR
                            </p>
                        </div>

                        {/* Thông tin chuyển khoản thủ công (Accordion style) */}
                        <div className="space-y-4">
                            <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-bold">Hoặc chuyển khoản thủ công</p>

                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Ngân hàng</span>
                                    <span className="font-bold text-gray-800">{bankConfig.bankId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Số tài khoản</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800 tracking-wider text-base">{bankConfig.accountNo}</span>
                                        {/* Nút copy đơn giản (cần thêm JS logic sau nếu muốn) */}
                                        <Copy className="w-3 h-3 text-gray-400 cursor-pointer hover:text-orange-600" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Chủ tài khoản</span>
                                    <span className="font-bold text-gray-800 uppercase">{bankConfig.accountName}</span>
                                </div>
                                <div className="my-2 border-t border-dashed border-gray-300"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Số tiền</span>
                                    <span className="font-bold text-orange-600 text-xl">{booking.amount.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between items-center bg-orange-100 p-3 rounded-lg border border-orange-200">
                                    <span className="text-orange-800 font-medium">Nội dung</span>
                                    <span className="font-bold text-orange-800 font-mono text-lg">{transferContent}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Button */}
                        <div className="mt-8">
                            <button
                                disabled
                                className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed mb-3"
                            >
                                Đang chờ xác nhận thanh toán...
                            </button>
                            <p className="text-center text-xs text-gray-400">
                                Hệ thống sẽ tự động cập nhật sau 30s - 1 phút khi nhận được tiền.
                                <br />Không cần bấm xác nhận thủ công.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}