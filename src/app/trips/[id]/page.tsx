import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, MapPin, Clock, User, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import TripMap from '@/components/trip-map';
import BookingFormV2 from '@/components/booking-form-v2';

// Next.js 15/16: params là Promise
export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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
        <main className="min-h-screen bg-slate-50 font-sans pb-20 pt-8">
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

                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                        {/* Title & Info */}
                        <div className="flex-1">
                            {/* Origin to Destination */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                    {trip.origin}
                                </h1>
                                <span className="text-3xl sm:text-4xl text-slate-300 font-light px-2">to</span>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                    {trip.destination}
                                </h1>

                                <span className="ml-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 uppercase tracking-widest shadow-sm">
                                    <ShieldCheck className="w-3 h-3" /> Available
                                </span>
                            </div>

                            {/* Date & Seats */}
                            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium text-sm sm:text-base">
                                <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {departureDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                    <User className="w-4 h-4 text-slate-400" />
                                    40 Chỗ ngồi
                                </span>
                            </div>
                        </div>


                    </div>
                </div>

                {/* 2. MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (2/3): MAP & ITINERARY */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* MAP CARD */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-[300px] md:h-[400px] relative">
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
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-slate-900">Chi tiết lịch trình</h2>
                                <span className="text-slate-400 text-sm font-medium">Thời gian: {durationStr}</span>
                            </div>

                            <div className="relative pl-4 space-y-10 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 before:border-l-[2px] before:border-dashed before:border-slate-300">
                                {/* DEPARTURE */}
                                <div className="relative flex gap-6 group">
                                    <div className="relative z-10 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white mt-1.5 box-content group-hover:scale-110 transition-transform"></div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-blue-200 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                            <span className="font-black text-2xl text-slate-900">
                                                {departureDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                                                Khởi hành
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                            {trip.origin}
                                        </h3>
                                        <p className="text-slate-500 text-sm flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> Điểm đón: {trip.origin}
                                        </p>
                                    </div>
                                </div>

                                {/* LAYOVER / INFO (Optional) */}
                                {trip.route_details && (
                                    <div className="relative flex gap-6 my-2">
                                        <div className="relative z-10 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white mt-4 ml-0.5"></div>
                                        <div className="flex-1">
                                            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">
                                                <Clock className="w-3 h-3" /> Thông tin lộ trình
                                            </div>
                                            <p className="text-slate-500 text-sm mt-2 leading-relaxed ml-1">
                                                {trip.route_details}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ARRIVAL */}
                                <div className="relative flex gap-6 group">
                                    <div className="relative z-10 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white mt-1.5 box-content group-hover:scale-110 transition-transform"></div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-slate-300 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                            <span className="font-black text-2xl text-slate-900">
                                                {arrivalDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">
                                                {arrivalDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                            {trip.destination}
                                        </h3>
                                        <p className="text-slate-500 text-sm flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> Trả khách tận nơi
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (1/3): BOOKING FORM */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">

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
                                        <span className="font-black text-3xl text-blue-600">{trip.price.toLocaleString()}đ</span>
                                    </div>
                                    <p className="text-right text-xs text-slate-400 mt-1">Đã bao gồm thuế</p>
                                </div>

                                {/* BOOKING FORM COMPONENT */}
                                <BookingFormV2
                                    tripId={trip.id}
                                    price={trip.price}
                                    user={user}
                                />

                            </div>

                            {/* SUPPORT CARD BELOW FORM */}
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">Cần hỗ trợ vé Tết?</h3>
                                    <p className="text-indigo-100 text-sm mb-4">Liên hệ ngay hotline để được tư vấn lộ trình tốt nhất.</p>
                                    <a href="tel:0919170252" className="bg-white text-indigo-600 font-bold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition shadow-md w-full">
                                        Gọi Hotline 0919.170.252
                                    </a>
                                </div>
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}