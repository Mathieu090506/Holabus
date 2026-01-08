import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import PrintButton from '@/components/print-button';
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
                {/* Decorative Top */}
                <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>

                <div className="p-8 text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Thanh toán thành công!</h1>
                    <p className="text-slate-500 mb-8">Vé của bạn đã được xác nhận.</p>

                    {/* QR Code Section */}
                    <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 mb-8 relative group">
                        <div className="bg-white p-3 rounded-xl shadow-sm inline-block mb-3">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.payment_code}`}
                                alt="QR Ticket"
                                className="w-40 h-40 object-contain"
                            />
                        </div>
                        <p className="font-mono font-bold text-xl text-slate-700 tracking-widest">{ticket.payment_code}</p>
                        <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Check-in Online
                        </p>
                    </div>

                    {/* Trip Info */}
                    <div className="text-left space-y-4 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Bus className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Chuyến xe</p>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight">
                                    {trip.origin} <span className="text-slate-300">➝</span> {trip.destination}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Khởi hành</p>
                                <h3 className="font-bold text-slate-800 text-lg">
                                    {departureDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    <span className="text-slate-400 font-normal text-sm ml-2">
                                        {departureDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </span>
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Hành khách</p>
                                <h3 className="font-bold text-slate-800 text-lg">
                                    {ticket.full_name}
                                </h3>
                                <p className="text-xs text-slate-500">{ticket.phone_number}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/" className="col-span-1 block w-full py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">
                            Về trang chủ
                        </Link>
                        <PrintButton />
                    </div>
                </div>

                {/* Ticket Cutout Effect */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full"></div>
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full"></div>
            </div>
        </div>
    );
}