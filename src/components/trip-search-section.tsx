'use client'

import { useState, useMemo, useEffect } from 'react';
import { Search, Heart, ThumbsUp } from 'lucide-react';
import TripCard, { TripCardMobile } from './trip-card';

// --- HÀM HỖ TRỢ: CHUYỂN TIẾNG VIỆT CÓ DẤU -> KHÔNG DẤU ---
function normalizeString(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function TetCountdown() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Tet Binh Ngo (2026) is Feb 17, 2026
        // If today is past Feb 17 2026, you might want to switch to 2027, but let's stick to 2026 for now or next year.
        // Assuming target is next Tet relative to now.
        const calculateTimeLeft = () => {
            const now = new Date();
            let year = now.getFullYear();

            // Simplified Tet dates for upcoming years to be dynamic
            // 2025: Jan 29
            // 2026: Feb 17
            // 2027: Feb 6
            let tetDate = new Date(`February 17, 2026 00:00:00`);

            // Logic fall-back: If current date is past Tet 2026, set to next known Tet or just invalid
            if (now.getTime() > tetDate.getTime()) {
                // Fallback or just showing 0
                // For this specific request context (2025/2026 transition), let's keep it simple.
            }

            const difference = tetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex justify-center items-start gap-2 md:gap-6 text-center text-slate-800 py-6">
            {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
            ].map((item, index, arr) => (
                <div key={item.label} className="flex items-start">
                    <div className="flex flex-col items-center w-20 md:w-32">
                        <div className="text-6xl md:text-8xl font-black text-slate-900 leading-none tracking-tighter">
                            {String(item.value).padStart(2, '0')}
                        </div>
                        <span className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">
                            {item.label}
                        </span>
                    </div>
                    {/* Add separator except for the last item */}
                    {index < arr.length - 1 && (
                        <div className="text-4xl md:text-6xl font-black text-slate-300 mx-1 md:mx-2 mt-2 select-none">
                            :
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function TripSearchSection({ trips, user, destinationImages = {} }: { trips: any[], user: any, destinationImages?: Record<string, string> }) {

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [visibleCount, setVisibleCount] = useState(3);

    // Reset visible count when search changes
    useEffect(() => {
        setVisibleCount(3);
    }, [debouncedSearchTerm]);

    // Debounce search term to create "searching" effect
    useEffect(() => {
        if (searchTerm !== debouncedSearchTerm) {
            setIsSearching(true);
            const handler = setTimeout(() => {
                setDebouncedSearchTerm(searchTerm);
                setIsSearching(false);
            }, 500); // 500ms delay for visual effect

            return () => {
                clearTimeout(handler);
            };
        }
    }, [searchTerm, debouncedSearchTerm]);

    const filteredTrips = useMemo(() => {
        if (!debouncedSearchTerm) return trips;
        const normalizedSearch = normalizeString(debouncedSearchTerm);
        return trips.filter(trip => {
            const normalizedDest = normalizeString(trip.destination);
            // Tìm kiếm chủ yếu theo điểm đến (Tỉnh thành)
            return normalizedDest.includes(normalizedSearch);
        });
    }, [trips, debouncedSearchTerm]);


    return (
        <>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-2 selection:bg-red-600 selection:text-white relative">
                {/* Global Background Image - Fixed Full Page */}
                <div className="fixed inset-0 z-[-1] pointer-events-none">
                    <img
                        src="/tet-atmosphere.png"
                        alt="Tet Background"
                        className="w-full h-full object-cover opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-red-50/90"></div>
                </div>

                {/* 1. HERO SECTION */}
                <div className="relative pt-24 pb-20 px-4 font-sans overflow-hidden">
                    {/* Background Glow Effect */}


                    <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">

                        {/* Hero Text */}
                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                                Let there be <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">Tet Holidays</span>
                            </h1>
                            <p className="text-slate-700 text-xl font-medium drop-shadow-sm">
                                Về nhà đón Tết - Gắn kết tình thân
                            </p>
                        </div>

                        {/* TET COUNTDOWN */}
                        <div className="flex justify-center gap-4 md:gap-8 text-center text-slate-800 drop-shadow-sm py-2">
                            {/* Inline Countdown Logic Reuse visualization only for style update, actual logic is in component above */}
                            <TetCountdown />
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto group">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Bạn muốn đi đâu?"
                                    className="w-full py-5 pl-14 pr-4 rounded-lg bg-white/80 backdrop-blur-sm text-slate-900 font-bold border border-slate-200 focus:ring-red-500 focus:border-red-500 placeholder:text-slate-500 placeholder:font-medium text-lg shadow-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                            </div>

                            {/* Popular Cities Suggestion */}
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                <span className="text-sm font-medium text-slate-500">Phổ biến:</span>
                                {['Quảng Ngãi', 'Đà Nẵng', 'Hà Nội', 'Sài Gòn', 'Huế', 'Quy Nhơn'].map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => setSearchTerm(city)}
                                        className="px-3 py-1 bg-white/60 hover:bg-white text-slate-600 hover:text-red-600 text-sm font-semibold rounded-full border border-slate-200 transition-all shadow-sm"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* 2. LIST TRIPS */}
                <div className="max-w-7xl mx-auto px-4 relative z-20">

                    {/* Section Title */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">
                            Chuyến đi phổ biến
                        </h2>
                        <div className="flex gap-2">
                            {/* Navigation arrows could go here */}
                        </div>
                    </div>

                    <div className={`transition-all duration-300 ${isSearching ? 'opacity-30 blur-sm scale-[0.99]' : 'opacity-100 blur-0 scale-100'}`}>
                        {filteredTrips.length === 0 ? (
                            <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 bg-white/50">
                                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium text-lg">Không tìm thấy chuyến về <span className="text-slate-900">"{searchTerm}"</span></p>
                                <button onClick={() => setSearchTerm('')} className="text-red-600 font-bold mt-4 hover:underline">Xem tất cả chuyến đi</button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTrips.slice(0, visibleCount).map((trip) => (
                                        <TripCard
                                            key={trip.id}
                                            trip={trip}
                                            destinationImages={destinationImages}
                                        />
                                    ))}
                                </div>

                                <div className="mt-10 text-center flex flex-col md:flex-row items-center justify-center gap-4">
                                    {/* See More Button */}
                                    {filteredTrips.length > visibleCount && (
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 3)}
                                            className="text-slate-500 hover:text-red-600 font-bold py-2 px-8 transition-all active:scale-95"
                                        >
                                            Xem thêm {filteredTrips.length - visibleCount} chuyến đi khác
                                        </button>
                                    )}

                                    {/* Collapse Button */}
                                    {visibleCount > 3 && (
                                        <button
                                            onClick={() => setVisibleCount(3)}
                                            className="text-slate-500 hover:text-red-600 font-bold py-2 px-8 transition-all active:scale-95"
                                        >
                                            Thu gọn danh sách
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. Footer / Connect Strip */}
                <div className="max-w-7xl mx-auto px-4 mt-0">
                    <div className="py-2 flex flex-col md:flex-row items-center justify-between gap-4 pb-2">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ThumbsUp className="w-5 h-5 text-blue-600 fill-current" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Theo dõi Page</h3>
                                <p className="text-slate-500 text-xs">Để nắm được thông tin chi tiết.</p>
                            </div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 text-sm rounded-lg transition-colors">
                            Theo dõi ngay
                        </button>
                    </div>
                </div>
            </div>


        </>
    );
}