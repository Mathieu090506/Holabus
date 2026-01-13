'use client'

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import TripCard from './trip-card';

// --- UTILS ---
function normalizeString(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

// --- SUB-COMPONENTS ---
function TetCountdown() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Target: Lunar New Year 2026 (Feb 17, 2026)
        const targetDate = new Date('2026-02-17T00:00:00').getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label }: { value: number, label: string }) => (
        <div className="flex flex-col items-center mx-2 md:mx-6">
            <span className="text-5xl md:text-8xl font-black text-[#0F172A] leading-none tracking-tight font-sans">
                {String(value).padStart(2, '0')}
            </span>
            <span className="mt-3 text-[10px] md:text-sm font-bold text-[#64748B] uppercase tracking-[0.3em]">
                {label}
            </span>
        </div>
    );

    const Separator = () => (
        <div className="hidden md:flex flex-col gap-3 mt-4 md:mt-8 mx-0 opacity-50">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#94A3B8]"></div>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#94A3B8]"></div>
        </div>
    );

    return (
        <div className="w-full py-12 md:py-20 mt-8 border-t border-dashed border-gray-200/50">
            <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
                <h3 className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] mb-8 md:mb-12 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                    Thời gian còn lại đến Tết
                </h3>

                <div className="flex flex-wrap justify-center items-start">
                    <TimeUnit value={timeLeft.days} label="Days" />
                    <Separator />
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <Separator />
                    <TimeUnit value={timeLeft.minutes} label="Minutes" />
                    <Separator />
                    <TimeUnit value={timeLeft.seconds} label="Seconds" />
                </div>
            </div>
        </div>
    );
}

import { useSearch } from '@/components/search-provider';

export default function TripSearchResults({ trips, destinationImages = {} }: { trips: any[], destinationImages?: Record<string, string> }) {

    const { isSearching } = useSearch();
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';

    // Using filtered trips logic here
    const filteredTrips = useMemo(() => {
        if (!q) return trips;
        const normalizedSearch = normalizeString(q);
        return trips.filter(trip => {
            const normalizedDestination = normalizeString(trip.destination || '');
            const normalizedOrigin = normalizeString(trip.origin || '');
            const normalizedWaypoints = normalizeString(trip.waypoints || '');
            const normalizedRouteDetails = normalizeString(trip.route_details || '');

            return normalizedDestination.includes(normalizedSearch) ||
                normalizedOrigin.includes(normalizedSearch) ||
                normalizedWaypoints.includes(normalizedSearch) ||
                normalizedRouteDetails.includes(normalizedSearch);
        });
    }, [trips, q]);

    // Group trips by destination using normalized keys to handle case/spacing differences
    const groupedTrips = useMemo(() => {
        const groups: Record<string, any[]> = {};

        filteredTrips.forEach(trip => {
            const destRaw = trip.destination || 'Khác';
            // Use normalized key for grouping (e.g. "ha noi" -> groups all variations)
            const destKey = normalizeString(destRaw);

            if (!groups[destKey]) groups[destKey] = [];
            groups[destKey].push(trip);
        });

        return Object.values(groups);
    }, [filteredTrips]);

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="min-h-screen bg-[#FFFBE6] font-sans pb-20">
            {/* 3. PROMO / TRIP LIST SECTION */}
            <div
                className="relative py-12 md:py-16 overflow-hidden bg-cover bg-right-top bg-no-repeat"
                style={{ backgroundImage: "url('/tet-section-bg.png')" }}
                id="search-results-anchor"
            >
                <div className="max-w-[1280px] mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#D0021B]">Vé Xe Tết 2026</h2>
                            <p className="text-gray-500 text-sm mt-1">Các chuyến đi phổ biến nhất được bình chọn</p>
                        </div>
                    </div>

                    {/* TRIP GRID */}
                    <div className={`transition-all duration-500 ease-in-out ${isSearching ? 'opacity-40 blur-md grayscale pointer-events-none scale-[0.99]' : 'opacity-100 blur-0 scale-100'}`}>
                        {groupedTrips.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="font-bold text-gray-700 text-lg">Không tìm thấy chuyến đi</h3>
                                <p className="text-gray-400 text-sm">Thử tìm kiếm với từ khóa khác xem sao!</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {groupedTrips.map((groupTrips, index) => (
                                        <div
                                            key={groupTrips[0].destination}
                                            className={`h-full ${index >= 4 && !isExpanded ? 'hidden md:block' : ''}`}
                                        >
                                            <TripCard
                                                trips={groupTrips}
                                                destinationImages={destinationImages}
                                            />
                                        </div>
                                    ))}
                                </div>


                                {/* Toggle Button: Visible only if we have more trips than the initial limit AND on mobile */}
                                {groupedTrips.length > 4 && (
                                    <div className="mt-10 flex justify-center md:hidden">
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="w-[200px] h-[48px] border border-[#D0021B] text-[#D0021B] hover:bg-red-50 rounded-lg flex items-center justify-center font-bold bg-white transition-all font-sans"
                                        >
                                            {isExpanded ? 'See less' : 'See all'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* COUNTDOWN SECTION - MOVED TO BOTTOM */}
            <TetCountdown />

        </div>
    );
}
