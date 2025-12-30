import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Clock, ArrowLeft, ShieldCheck, UserCircle, Phone, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// 👇 IMPORT CÁC COMPONENT ĐÃ LÀM
import TripMap from '@/components/trip-map';
import BookingFormV2 from '@/components/booking-form-v2';

// Next.js 15/16: params là Promise
export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Lấy thông tin chuyến xe
    const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

    // 2. Lấy thông tin User (Để truyền xuống Form tự điền thông tin)
    const { data: { user } } = await supabase.auth.getUser();

    if (error || !trip) {
        return notFound();
    }

    // Format dữ liệu hiển thị
    const tripDate = new Date(trip.departure_time);
    const dateStr = tripDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = tripDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const defaultImage = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2000&auto=format&fit=crop";

    return (
        <main className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">

            {/* =========================================================================
          PHẦN 1: HERO HEADER (ẢNH BÌA & THANH ĐIỀU HƯỚNG)
         ========================================================================= */}
            <div className="relative h-[350px] md:h-[480px] w-full bg-slate-900 overflow-hidden group">

                {/* Ảnh nền có hiệu ứng Zoom nhẹ khi vào trang */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src={trip.image_url || defaultImage}
                        alt={trip.destination}
                        className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-[2s]"
                    />
                    {/* Lớp phủ Gradient để chữ dễ đọc */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90"></div>
                </div>

                {/* --- TOP BAR (Nút Back & User Profile) --- */}
                <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-30 flex justify-between items-start">
                    {/* Nút Quay lại */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-full backdrop-blur-md transition-all font-medium text-sm border border-white/10 shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden md:inline">Quay lại danh sách</span>
                        <span className="md:hidden">Quay lại</span>
                    </Link>

                    {/* Thông tin User (Góc phải) */}
                    {user ? (
                        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                            <div className="text-right hidden md:block">
                                <p className="text-white text-xs font-bold leading-tight">{user.user_metadata.full_name}</p>
                                <p className="text-white/60 text-[10px]">{user.email}</p>
                            </div>
                            {user.user_metadata.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white/20" />
                            ) : (
                                <UserCircle className="w-9 h-9 text-white/80" />
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-3 rounded-full transition shadow-lg shadow-orange-900/40 flex items-center gap-2">
                            <UserCircle className="w-4 h-4" /> Đăng nhập
                        </Link>
                    )}
                </div>

                {/* --- TIÊU ĐỀ CHUYẾN ĐI (Bottom Left) --- */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-wrap items-center gap-3 mb-4 animate-fade-in-up">
                            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-lg border border-red-500">
                                Vé Tết 2025
                            </span>
                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider border border-white/30 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Chất lượng cao
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-2xl leading-tight tracking-tight">
                            {trip.origin} <span className="text-orange-500 mx-1 inline-block transform hover:rotate-45 transition-transform duration-300">-</span> {trip.destination}
                        </h1>

                        <div className="flex items-center gap-6 text-gray-200 text-sm md:text-lg font-medium">
                            <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5">
                                <Calendar className="w-5 h-5 text-orange-400" /> {dateStr}
                            </span>
                            <span className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5">
                                <Clock className="w-5 h-5 text-orange-400" /> {timeStr}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================================================
          PHẦN 2: NỘI DUNG CHÍNH (GRID LAYOUT)
         ========================================================================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* === CỘT TRÁI (8 phần): BẢN ĐỒ & THÔNG TIN === */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* CARD 1: BẢN ĐỒ LỘ TRÌNH */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 p-3 rounded-xl">
                                        <MapPin className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-xl">Lộ trình di chuyển</h3>
                                        <p className="text-xs text-gray-400">Được mô phỏng bởi Google Maps</p>
                                    </div>
                                </div>
                            </div>

                            {/* Component Map */}
                            <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner mb-6 relative group">
                                <TripMap
                                    origin={trip.origin}
                                    destination={trip.destination}
                                    waypoints={trip.waypoints} // Truyền điểm trung gian
                                />
                            </div>

                            {/* Text Lộ trình chi tiết */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
                                {/* Đường kẻ trang trí bên trái */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-2xl"></div>

                                <p className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500" /> Chi tiết các điểm dừng:
                                </p>
                                <p className="text-slate-700 leading-relaxed text-base">
                                    {trip.route_details || "Đang cập nhật lộ trình chi tiết..."}
                                </p>
                            </div>
                        </div>

                        {/* CARD 2: THÔNG TIN ĐIỂM ĐÓN TRẢ */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
                                <Info className="w-6 h-6 text-blue-600" /> Thông tin điểm bến
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                {/* Đường kẻ nối đứt đoạn ở giữa (chỉ hiện trên Desktop) */}
                                <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[1px] border-l border-dashed border-gray-300 -translate-x-1/2"></div>

                                {/* Điểm đi */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-4 h-4 rounded-full border-4 border-blue-100 bg-blue-600 shadow-sm"></div>
                                        <div className="w-[2px] h-full bg-gradient-to-b from-blue-100 to-transparent my-1"></div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Điểm xuất phát</span>
                                        <span className="font-bold text-gray-800 text-lg leading-tight block">{trip.origin}</span>
                                        <span className="text-sm text-gray-500 mt-1 block">Vui lòng có mặt trước 30p</span>
                                    </div>
                                </div>

                                {/* Điểm đến */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-4 h-4 rounded-full border-4 border-red-100 bg-red-600 shadow-sm"></div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Điểm trả khách</span>
                                        <span className="font-bold text-gray-800 text-lg leading-tight block">{trip.destination}</span>
                                        <span className="text-sm text-gray-500 mt-1 block">Trả khách dọc lộ trình</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === CỘT PHẢI (4 phần): FORM ĐẶT VÉ (STICKY) === */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-gray-100 sticky top-24">

                            {/* HEADER GIÁ VÉ */}
                            <div className="text-center mb-8 border-b border-gray-50 pb-6">
                                <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Giá vé niêm yết</p>
                                <div className="flex items-start justify-center text-orange-600 transform scale-100 hover:scale-105 transition-transform duration-300">
                                    <span className="text-4xl md:text-5xl font-black tracking-tight">{trip.price.toLocaleString()}</span>
                                    <span className="text-xl font-bold mt-2 ml-1">đ</span>
                                </div>
                            </div>

                            {/* 👇 SỬ DỤNG FORM V2 (ĐẦY ĐỦ CHỨC NĂNG) 👇 */}
                            <BookingFormV2
                                tripId={trip.id}
                                price={trip.price}
                                user={user}
                            />
                            {/* Form này sẽ có ô nhập SĐT, MSSV và nút Submit */}

                            {/* CHÍNH SÁCH NHỎ */}
                            <div className="mt-6 pt-6 border-t border-dashed border-gray-200 text-xs text-gray-500 space-y-3">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Giữ chỗ:</span>
                                    <span className="font-bold text-gray-800">10 phút</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Hoàn vé:</span>
                                    <span className="font-bold text-gray-800">Trước 24h</span>
                                </div>
                            </div>
                        </div>

                        {/* HOTLINE BOX */}
                        <div className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-3xl shadow-xl shadow-orange-200 text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-transform duration-700"></div>

                            <p className="text-orange-100 font-bold text-xs uppercase mb-2 tracking-widest">Hỗ trợ 24/7</p>
                            <a href="tel:0919170252" className="text-3xl font-black block hover:scale-105 transition-transform">
                                0919.170.252
                            </a>
                            <div className="flex justify-center mt-3">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Gọi ngay
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}