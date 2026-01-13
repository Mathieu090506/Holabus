import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, ArrowRight, MapPin, Clock, User, ShieldCheck, Star, MessageCircle, XCircle, CheckCircle2, Ticket } from 'lucide-react';
import Link from 'next/link';
import TripMap from '@/components/trip-map';
import BookingFormV2 from '@/components/booking-form-v2';
import { siteConfig } from '@/config/site';

// Next.js 15/16: params là Promise - Rebuild Trigger
export const dynamic = 'force-dynamic';

export default async function TripDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();

    // 1. Lấy thông tin chuyến xe
    const { data: tripData, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

    // Cast to any to avoid TS errors
    const trip = tripData as any;

    // 2. Lấy thông tin User
    const { data: { user } } = await supabase.auth.getUser();

    if (error || !trip) {
        return notFound();
    }

    // Format dữ liệu hiển thị
    const departureDate = new Date(trip.departure_time);
    const arrivalDate = new Date(trip.arrival_time);

    // Calculate duration
    const diffMs = arrivalDate.getTime() - departureDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const durationStr = `${hours}h ${minutes}m`;

    return (
        <main className="min-h-screen bg-[#FFFBE6] font-sans pb-20 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 1. HEADER SECTION (Redesigned) */}
                <div className="mb-10">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 transition font-medium text-sm group">
                            <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-100 group-hover:border-slate-300 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Quay lại tìm kiếm
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Title Row - Flex Wrap to handle long names */}
                        <div className="flex flex-wrap items-center gap-3 md:gap-6">
                            <h1 className="text-3xl md:text-5xl font-black text-[#D0021B] tracking-tight leading-tight">
                                {trip.origin}
                            </h1>
                            <div className="hidden md:flex items-center justify-center">
                                <ArrowRight className="w-8 h-8 text-yellow-500" strokeWidth={3} />
                            </div>
                            {/* Mobile Separator */}
                            <span className="md:hidden text-yellow-500 font-bold text-xl">→</span>

                            <h1 className="text-3xl md:text-5xl font-black text-[#D0021B] tracking-tight leading-tight">
                                {trip.destination}
                            </h1>
                        </div>

                        {/* Metadata Row - Better spacing and alignment */}
                        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm md:text-base mt-2">
                            {trip.tags === 'Mở bán' ? (
                                <span className="inline-flex items-center gap-1.5 bg-green-100/80 text-green-700 px-3 py-1.5 rounded-full font-bold uppercase text-xs tracking-wider border border-green-200">
                                    <CheckCircle2 className="w-4 h-4" /> Đang Mở Bán
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 bg-red-100/80 text-red-700 px-3 py-1.5 rounded-full font-bold uppercase text-xs tracking-wider border border-red-200">
                                    <XCircle className="w-4 h-4" /> Tạm Dừng
                                </span>
                            )}

                            <div className="hidden md:block w-px h-5 bg-slate-300/50"></div>

                            <span className="flex items-center gap-2 text-slate-600 font-medium bg-white/50 px-3 py-1.5 rounded-lg border border-slate-100/50">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Dự kiến sáng thứ 7 (07/02/2026)
                            </span>


                        </div>
                    </div>
                </div>

                {/* 2. MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (2/3): MAP & ITINERARY */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* MAP CARD */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-yellow-200 h-[300px] md:h-[400px] relative">
                            <TripMap
                                origin={trip.origin}
                                destination={trip.destination}
                                waypoints={trip.waypoints}
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-200">
                                Google Maps Preview
                            </div>
                        </div>

                        {/* ITINERARY CARD */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-yellow-200">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-slate-900">Chi tiết lịch trình</h2>
                                <span className="text-[#D0021B] font-bold text-base bg-red-50 px-3 py-1 rounded-lg border border-red-100">Dự kiến sáng 07/02/2026</span>
                            </div>

                            <div className="relative pl-4 space-y-10 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 before:border-l-[2px] before:border-dashed before:border-slate-300">
                                {/* DEPARTURE */}
                                <div className="relative flex gap-6 group">
                                    <div className="relative z-10 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white mt-1.5 box-content group-hover:scale-110 transition-transform"></div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-blue-200 transition-colors">

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                                                Khởi hành
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                            {trip.origin}
                                        </h3>

                                    </div>
                                </div>

                                {/* WAYPOINTS / STOPS */}
                                {/* WAYPOINTS / STOPS (RENDER TỪ DATABASE) */}
                                {/* Logic: Ưu tiên lấy từ 'route_details' (nhập tay từng dòng). Nếu không có thì fallback sang 'waypoints' (lọc toạ độ) */}
                                {(() => {
                                    // 1. Cố gắng parse từ route_details (Split by Newline)
                                    let displayPoints: string[] = [];

                                    if (trip.route_details && trip.route_details.trim().length > 0) {
                                        // Tách theo dòng mới (Enter)
                                        displayPoints = trip.route_details.split(/\r?\n/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                                    }

                                    // 2. Nếu không có route_details, dùng waypoints (Legacy)
                                    if (displayPoints.length === 0 && trip.waypoints) {
                                        displayPoints = trip.waypoints.split(';')
                                            .map((s: string) => s.trim())
                                            .filter((s: string) => {
                                                // Lọc bỏ toạ độ số
                                                return s.length > 0 && !/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(s);
                                            });
                                    }

                                    // 3. RENDER
                                    return displayPoints.map((point, index) => (
                                        <div key={index} className="relative flex gap-6 group">
                                            <div className="relative z-10 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white mt-5 ml-0.5 group-hover:bg-orange-400 transition-colors"></div>
                                            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-orange-200 transition-colors">

                                                <h4 className="text-base font-bold text-slate-700">{point}</h4>
                                            </div>
                                        </div>
                                    ));
                                })()}

                                {/* ARRIVAL */}
                                <div className="relative flex gap-6 group">
                                    <div className="relative z-10 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white mt-1.5 box-content group-hover:scale-110 transition-transform"></div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-slate-300 transition-colors">

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded uppercase tracking-wider">
                                                Điểm đến
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                            {trip.destination}
                                        </h3>

                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (1/3): BOOKING FORM */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6 z-40">
                            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-yellow-100/50 border border-yellow-200">

                                <div className="mb-6">
                                    <h3 className="font-bold text-slate-900 text-lg mb-4">Chi phí chuyến đi</h3>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-500 text-sm">Giá vé (1 người)</span>
                                        <span className="font-bold text-slate-900">{trip.price.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-500 text-sm">Thuế & Phí</span>
                                        <span className="font-bold text-slate-900">0đ</span>
                                    </div>
                                    <div className="border-t border-slate-100 my-4"></div>
                                    <div className="flex items-end justify-between">
                                        <span className="font-bold text-slate-900 text-xl">Tổng cộng</span>
                                        <span className="font-black text-3xl text-[#D0021B]">{trip.price.toLocaleString()}đ</span>
                                    </div>
                                    <p className="text-right text-xs text-slate-400 mt-1">Đã bao gồm thuế</p>
                                </div>

                                {/* BOOKING FORM COMPONENT */}
                                {/* Logic hiển thị Form: Chỉ hiện khi Tag là "Mở bán" VÀ Còn vé */}
                                {trip.tags === 'Mở bán' && (trip.capacity === undefined || trip.capacity > 0) ? (
                                    <>
                                        <BookingFormV2
                                            tripId={trip.id}
                                            price={trip.price}
                                            user={user}
                                        />
                                    </>
                                ) : (
                                    <div className="bg-slate-50 rounded-2xl p-8 text-center border-2 border-slate-200 border-dashed">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            {trip.capacity <= 0 ? (
                                                <Ticket className="w-8 h-8 text-red-400" />
                                            ) : (
                                                <Clock className="w-8 h-8 text-slate-300" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-2">
                                            {trip.capacity <= 0 ? 'CHUYẾN XE ĐÃ HẾT VÉ' : 'Tạm dừng nhận khách'}
                                        </h3>
                                        <p className="text-slate-500 text-sm">
                                            {trip.capacity <= 0
                                                ? 'Rất tiếc, chuyến này đã bán hết vé. Vui lòng chọn chuyến khác.'
                                                : 'Chuyến xe này hiện đang tạm dừng mở bán vé trực tuyến.'}
                                            <br />Vui lòng liên hệ hotline hoặc quay lại sau.
                                        </p>
                                    </div>
                                )}

                            </div>

                            {/* SUPPORT CARD BELOW FORM */}
                            <div className="bg-gradient-to-br from-[#D0021B] to-[#FF5B00] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ring-4 ring-yellow-100">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2 text-yellow-100">Cần hỗ trợ vé Tết?</h3>
                                    <p className="text-red-100 text-sm mb-4">Nhắn tin ngay cho chúng tôi để được tư vấn lộ trình tốt nhất.</p>
                                    <a
                                        href={siteConfig.messengerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white text-[#D0021B] font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-yellow-50 transition shadow-lg hover:shadow-xl w-full border border-yellow-200"
                                    >
                                        <MessageCircle className="w-5 h-5 fill-current" />
                                        Chat qua Fanpage
                                    </a>
                                </div>
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}