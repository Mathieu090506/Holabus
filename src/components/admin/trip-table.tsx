'use client'

import { useState, Fragment } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronRight, MapPin, Tag, Power, CheckCircle, XCircle } from 'lucide-react';
import { updateTripGroupStatus } from '@/actions/admin-group-update';

interface Trip {
    id: string; // or number, based on your DB. The action handles both.
    origin: string;
    destination: string;
    departure_time: string;
    price: number;
    tags?: string;
}

export default function TripTable({ trips }: { trips: Trip[] }) {
    // Group trips by destination
    const tripsByDestination = (trips || []).reduce((acc, trip) => {
        const dest = trip.destination || 'Khác';
        if (!acc[dest]) acc[dest] = [];
        acc[dest].push(trip);
        return acc;
    }, {} as Record<string, Trip[]>);

    // State to track expanded groups
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
        Object.keys(tripsByDestination).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    const toggleGroup = (dest: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [dest]: !prev[dest]
        }));
    };

    // Bulk Update Handler
    const handleBulkUpdate = async (e: React.MouseEvent, tripsInGroup: Trip[]) => {
        e.stopPropagation(); // Prevent toggling group
        if (!tripsInGroup || tripsInGroup.length === 0) return;

        // Logic toggle: Nếu đang "Mở bán" -> Chuyển thành "Dừng mở bán". Ngược lại -> "Mở bán".
        const currentTag = tripsInGroup[0].tags || "";
        const isOpen = currentTag === "Mở bán";
        const newStatus = isOpen ? "Dừng mở bán" : "Mở bán";

        await updateTripGroupStatus(tripsInGroup.map(t => t.id), newStatus);
    };

    // Single Update Handler
    const handleSingleToggle = async (e: React.MouseEvent, trip: Trip) => {
        e.stopPropagation();
        const currentTag = trip.tags || "";
        const isOpen = currentTag === "Mở bán";
        const newStatus = isOpen ? "Dừng mở bán" : "Mở bán";
        await updateTripGroupStatus([trip.id], newStatus);
    };

    if (!trips || trips.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400">
                Chưa có chuyến xe nào.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="p-4 pl-6">Điểm đi / Điểm đến</th>
                        <th className="p-4">Thời gian</th>
                        <th className="p-4">Giá vé</th>
                        <th className="p-4 text-right pr-6">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {Object.entries(tripsByDestination).map(([destination, groupTrips]) => {
                        const isExpanded = expandedGroups[destination];
                        // Check status base on first item
                        const commonTag = groupTrips[0]?.tags;
                        const isGroupOpen = commonTag === 'Mở bán';

                        return (
                            <Fragment key={destination}>
                                {/* Group Header Row */}
                                <tr
                                    className="bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition select-none border-b border-transparent"
                                    onClick={() => toggleGroup(destination)}
                                >
                                    <td colSpan={4} className="p-3 pl-4">
                                        <div className="flex items-center justify-between pr-4">
                                            <div className="flex items-center gap-2 font-bold text-slate-700">
                                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                <MapPin className="w-4 h-4 text-orange-500" />
                                                <span>{destination} ({groupTrips.length} chuyến)</span>
                                            </div>

                                            {/* Bulk Action Toggle Button */}
                                            <button
                                                onClick={(e) => handleBulkUpdate(e, groupTrips)}
                                                className={`text-xs px-3 py-1.5 rounded-md shadow-sm transition flex items-center gap-1.5 border font-bold ${isGroupOpen
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                    }`}
                                                title={isGroupOpen ? "Đang mở bán. Bấm để Dừng." : "Đang dừng. Bấm để Mở bán."}
                                            >
                                                {isGroupOpen ? (
                                                    <><CheckCircle className="w-3.5 h-3.5" /> Đang Mở bán</>
                                                ) : (
                                                    <><XCircle className="w-3.5 h-3.5" /> Dừng mở bán</>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Trip Rows (Render if expanded) */}
                                {isExpanded && groupTrips.map(trip => {
                                    const isTripOpen = trip.tags === 'Mở bán';
                                    return (
                                        <tr key={trip.id} className="hover:bg-slate-50 transition group border-l-4 border-l-transparent hover:border-l-blue-500">
                                            <td className="p-4 pl-10"> {/* Indented */}
                                                <div className="font-bold text-slate-800 text-base group-hover:text-orange-600 transition">{trip.destination}</div>
                                                <div className="text-slate-500 text-xs mt-1">Từ: {trip.origin}</div>

                                                {/* Individual Toggle Button */}
                                                <button
                                                    onClick={(e) => handleSingleToggle(e, trip)}
                                                    className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-bold transition hover:shadow-sm ${isTripOpen
                                                            ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                                                            : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                                        }`}
                                                >
                                                    {isTripOpen ? "Mở bán" : "Dừng mở bán"}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-700">{new Date(trip.departure_time).toLocaleDateString('vi-VN')}</div>
                                                <div className="text-slate-400 text-xs">{new Date(trip.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">{trip.price.toLocaleString()}đ</div>
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <Link
                                                    href={`/admin/trips/${trip.id}`}
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                                >
                                                    Chỉnh sửa <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
