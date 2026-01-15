'use client'

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { checkInTicket } from '@/actions/admin-trips';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Search, User, MapPin, Clock } from 'lucide-react';

export default function ScanPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null); // Kết quả check vé
    const [error, setError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState(''); // Nhập tay nếu cam hỏng
    const [pauseScan, setPauseScan] = useState(false); // Tạm dừng cam khi đang hiện kết quả

    // Hàm xử lý khi quét được mã
    const handleScan = async (rawValue: string) => {
        if (pauseScan || !rawValue) return;

        // Mã vé thường là HOLAXXXX. Đôi khi QR chứa URL, ta cần lọc lấy mã
        // Giả sử mã QR chỉ chứa đúng payment_code
        const code = rawValue.trim();

        setPauseScan(true); // Dừng quét để xử lý
        setLoading(true);
        setError(null);
        setResult(null);

        // Gọi Server Action kiểm tra
        const res = await checkInTicket(code);

        if (res.error) {
            setError(res.error);
            // Play sound error (nếu muốn)
        } else {
            setResult(res.booking);
            // Play sound success
        }
        setLoading(false);
    };

    // Hàm xử lý nhập tay
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleScan(manualCode);
    };

    // Hàm quét tiếp
    const resetScan = () => {
        setResult(null);
        setError(null);
        setPauseScan(false);
        setManualCode('');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">

            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
                <Link href="/admin" className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg">Soát vé (Check-in)</h1>
                <div className="w-6"></div> {/* Spacer */}
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">

                {/* CAMERA SCANNER */}
                {!result && !error && (
                    <div className="flex-1 bg-black relative flex items-center justify-center">
                        <div className="w-full max-w-md aspect-square relative overflow-hidden rounded-3xl border-2 border-zinc-800">
                            <Scanner
                                onScan={(detected) => {
                                    if (detected && detected.length > 0) {
                                        handleScan(detected[0].rawValue);
                                    }
                                }}
                                // Tắt các tính năng không cần thiết để tối ưu
                                scanDelay={500}
                                allowMultiple={false}
                            />

                            {/* Overlay khung quét */}
                            <div className="absolute inset-0 border-[40px] border-black/50 flex items-center justify-center">
                                <div className="w-64 h-64 border-2 border-orange-500 rounded-lg animate-pulse relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-orange-500 -mt-1 -ml-1"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-orange-500 -mt-1 -mr-1"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-orange-500 -mb-1 -ml-1"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-orange-500 -mb-1 -mr-1"></div>
                                </div>
                            </div>
                            {loading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">Đang kiểm tra...</div>}
                        </div>
                    </div>
                )}

                {/* MÀN HÌNH KẾT QUẢ: THÀNH CÔNG */}
                {result && (
                    <div className="flex-1 bg-green-600 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
                        <div className="bg-white text-green-600 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl">
                            <CheckCircle className="w-14 h-14" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">VÉ HỢP LỆ!</h2>
                        <p className="opacity-90 text-lg mb-8">Mời khách lên xe</p>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm text-left space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 opacity-70" />
                                <span className="font-bold text-xl">{result.full_name || 'Khách vãng lai'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 opacity-70" />
                                <span>Đến: <b>{result.trip_destination}</b></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 opacity-70" />
                                <span>Giờ: {new Date(result.trip_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="border-t border-white/20 pt-3 mt-3">
                                <p className="text-sm opacity-70">Mã vé / Ghế:</p>
                                <p className="font-mono font-bold text-lg">{result.payment_code} • {result.seat_preference}</p>
                            </div>
                        </div>

                        <button onClick={resetScan} className="mt-8 bg-white text-green-700 font-bold py-4 px-12 rounded-full shadow-lg hover:scale-105 transition">
                            Quét người tiếp theo
                        </button>
                    </div>
                )}

                {/* MÀN HÌNH KẾT QUẢ: THẤT BẠI */}
                {error && (
                    <div className="flex-1 bg-red-600 flex flex-col items-center justify-center p-6 text-center animate-in shake duration-300">
                        <div className="bg-white text-red-600 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl">
                            <XCircle className="w-14 h-14" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">KHÔNG HỢP LỆ!</h2>
                        <p className="bg-black/20 px-4 py-2 rounded-lg text-lg mb-8 font-medium">{error}</p>

                        <button onClick={resetScan} className="mt-4 bg-white text-red-700 font-bold py-4 px-12 rounded-full shadow-lg hover:scale-105 transition">
                            Thử lại
                        </button>
                    </div>
                )}

                {/* FORM NHẬP TAY (FALLBACK) */}
                {!result && !error && (
                    <div className="bg-zinc-900 p-6 rounded-t-3xl border-t border-zinc-800 pb-10">
                        <p className="text-center text-zinc-500 text-sm mb-4">Hoặc nhập mã vé thủ công</p>
                        <form onSubmit={handleManualSubmit} className="flex gap-2">
                            <input
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                placeholder="VD: HOLA..."
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 font-mono"
                            />
                            <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-xl border border-zinc-700">
                                <Search className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}