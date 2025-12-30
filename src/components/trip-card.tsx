'use client'

import Link from 'next/link';
import { MapPin, Bus, Star, ArrowRight } from 'lucide-react';

export default function TripCard({ trip }: { trip: any }) {
    // Format giá tiền
    const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.price);

    // Mock data for new fields (Since backend data might not have them yet)
    const stationName = trip.origin === 'Hà Nội' ? 'Bến xe Mỹ Đình' : 'Bến xe Miền Đông';
    const remainingTickets = trip.capacity ?? 0;

    return (
        <tr className="hover:bg-red-50/50 transition-colors group">
            {/* Route */}
            <td className="p-8">
                <div className="flex items-center gap-4">
                    <Bus className="w-8 h-8 text-red-600" />
                    <div className="font-bold text-slate-800 text-xl group-hover:text-red-700 transition-colors">
                        {trip.origin} - {trip.destination}
                    </div>
                </div>
            </td>

            {/* Price */}
            <td className="p-8 font-bold text-red-700 text-lg">
                {priceFormatted}
            </td>

            {/* Station (New Column 3) */}
            <td className="p-8 text-slate-600 font-medium text-base">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    {stationName}
                </div>
            </td>

            {/* Status & Tickets (New Column 4) */}
            <td className="p-8">
                <div className="flex flex-col gap-1.5">
                    <span className="text-base font-bold text-green-600 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        Đang mở bán
                    </span>
                    <span className="text-sm text-slate-500">Còn {remainingTickets} vé</span>
                </div>
            </td>

            {/* Action */}
            <td className="p-8 text-right">
                <Link
                    href={`/trips/${trip.id}`}
                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-red-200 transition-all active:scale-95 text-base"
                >
                    Đặt ngay <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
            </td>
        </tr>
    );
}

export function TripCardMobile({ trip }: { trip: any }) {
    const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.price);
    const stationName = trip.origin === 'Hà Nội' ? 'Bến xe Mỹ Đình' : 'Bến xe Miền Đông';
    const remainingTickets = trip.capacity ?? 0;

    return (
        <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm flex flex-col gap-4">
            {/* Route Header */}
            <div className="flex items-center gap-3 border-b border-red-50 pb-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <Bus className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-xs text-orange-500 font-bold uppercase tracking-wider">Tuyến du xuân</div>
                    <div className="font-bold text-slate-800 text-lg leading-tight">
                        {trip.origin} - {trip.destination}
                    </div>
                </div>
            </div>

            {/* Info Grid - Updated fields */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Giá vé</div>
                    <div className="font-bold text-red-700 text-sm">{priceFormatted}</div>
                </div>
                <div className="bg-orange-50/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Bến xe</div>
                    <div className="font-bold text-slate-700 text-sm truncate">{stationName}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 col-span-2 flex items-center justify-between border border-green-100">
                    <div>
                        <div className="text-xs text-green-600 mb-0.5 font-semibold">Trạng thái</div>
                        <div className="font-bold text-green-700 text-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            Đang mở bán
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-green-600 mb-0.5">Vé còn lại</div>
                        <div className="font-bold text-green-700 text-sm">{remainingTickets} vé</div>
                    </div>
                </div>
            </div>

            {/* Action */}
            <Link
                href={`/trips/${trip.id}`}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
                Đặt vé ngay <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}