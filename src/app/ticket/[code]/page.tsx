import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Bus, CheckCircle, MapPin, Printer, Share2, MessageCircle, Download, User, Luggage, Armchair } from 'lucide-react';
import TripMap from '@/components/trip-map';

// --- Helper Functions ---
function formatPrice(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function calculateDuration(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs < 0) return '0h';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

export default async function TicketDetailPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const ticketCode = code;
    const supabase = await createClient();

    // 1. Fetch ticket details
    const { data: ticketData } = await supabase
        .from('bookings')
        .select(`*, trips (*)`)
        .eq('payment_code', ticketCode)
        .single();

    // Cast to any to avoid TS errors with complex join types
    const ticket = ticketData as any;

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="text-6xl mb-4">🎫</div>
                <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy vé</h1>
                <p className="text-slate-500 mb-6">Mã vé "{ticketCode}" không tồn tại.</p>
                <Link href="/my-tickets" className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const trip = ticket.trips;
    const departureDate = new Date(trip.departure_time);
    const arrivalDate = new Date(trip.arrival_time);
    const duration = calculateDuration(trip.departure_time, trip.arrival_time);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto">
                {/* TOP NAV / BREADCRUMB */}
                <div className="mb-8 flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Link href="/my-tickets" className="hover:text-red-600 flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Vé của tôi
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800">Chi tiết vé</span>
                </div>

                {/* 1. PAGE HEADER */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                                {trip.origin} <span className="text-slate-400 font-light mx-1">to</span> {trip.destination}
                            </h1>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200 uppercase tracking-wider">
                                <CheckCircle className="w-3 h-3" /> Confirmed
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {departureDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                <User className="w-4 h-4 text-slate-400" /> 1 Hành khách
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                <Bus className="w-4 h-4 text-slate-400" /> Một chiều
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition" onClick={() => window.print()}>
                            <Printer className="w-4 h-4" /> Print
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: MAP & ITINERARY */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* MAP CARD */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-64 md:h-80 relative group">
                            <TripMap origin={trip.origin} destination={trip.destination} />
                        </div>

                        {/* ITINERARY CARD */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-900">Lịch trình chuyến đi</h2>
                                <span className="text-slate-400 text-sm font-medium">Thời gian dự kiến: {duration}</span>
                            </div>

                            <div className="relative pl-4 space-y-10 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 before:border-l-[2px] before:border-dashed before:border-slate-300">

                                {/* DEPARTURE */}
                                <div className="relative flex gap-6">
                                    <div className="relative z-10 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white mt-2 box-content"></div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 transition">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                            <span className="font-black text-xl text-slate-900">
                                                {departureDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                Khởi hành
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" /> {trip.origin}
                                        </h3>
                                        <p className="text-slate-500 text-sm ml-6 mt-1">
                                            Tập trung trước 15 phút tại bến xe
                                        </p>
                                    </div>
                                </div>

                                {/* ARRIVAL */}
                                <div className="relative flex gap-6">
                                    <div className="relative z-10 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white mt-2 box-content"></div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                            <span className="font-black text-xl text-slate-900">
                                                {arrivalDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-400">
                                                    {arrivalDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" /> {trip.destination}
                                        </h3>
                                        <p className="text-slate-500 text-sm ml-6 mt-1">
                                            Trả khách tại bến trung tâm
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PASSENGER DETAILS */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Thông tin hành khách</h2>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {ticket.full_name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Họ và tên</p>
                                        <p className="font-bold text-slate-800">{ticket.full_name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{ticket.email || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Điện thoại</p>
                                        <p className="font-bold text-slate-800">{ticket.phone_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><Armchair className="w-3 h-3" /> Vị trí ghế</p>
                                        <p className="font-bold text-purple-600">{ticket.seat_preference || 'Ngẫu nhiên'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><Luggage className="w-3 h-3" /> Hành lý</p>
                                        <p className="font-bold text-slate-800">20kg Ký gửi</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: PRICE & ACTIONS */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* PRICE BREAKDOWN */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4">Chi tiết thanh toán</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Giá vé xe (x1)</span>
                                    <span className="font-medium text-slate-900">{formatPrice(trip.price)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Thuế & Phí dịch vụ</span>
                                    <span className="font-medium text-slate-900">0₫</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Hành lý ký gửi</span>
                                    <span className="font-medium text-slate-900">Miễn phí</span>
                                </div>
                                <div className="border-t border-slate-100 my-4"></div>
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-slate-800 text-lg">Tổng cộng</span>
                                    <span className="font-black text-2xl text-blue-600">{formatPrice(trip.price)}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <div className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer">
                                    <CheckCircle className="w-5 h-5" />
                                    Check-in Online (Đã xong)
                                </div>

                                {/* QR CODE / DOWNLOAD */}
                                <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
                                    <div className="bg-white p-2 inline-block rounded-lg shadow-sm border border-slate-200 mb-2">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.payment_code}`}
                                            alt="QR Ticket"
                                            className="w-32 h-32"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono mb-3">{ticket.payment_code}</p>
                                    <button className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm shadow-sm">
                                        <Download className="w-4 h-4" /> Tải vé về máy
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SUPPORT CARD */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Cần hỗ trợ?</h3>
                                <p className="text-indigo-100 text-sm mb-4">Chúng tôi sẵn sàng giúp bạn 24/7 với mọi vấn đề về chuyến đi.</p>
                                <button className="bg-white text-indigo-600 font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-50 transition shadow-md">
                                    <MessageCircle className="w-4 h-4" /> Chat với Support
                                </button>
                            </div>
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}