'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Calendar, Bus, Star, Ticket, ChevronRight, Zap, ShieldCheck, CreditCard, ChevronLeft, X } from 'lucide-react';
import TripCard from './trip-card';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONSTANTS ---
const HERO_SLIDES = [
    {
        id: 1,
        image: '/tet-atmosphere.png',
        title: <>Khám phá Tết <br /> <span className="text-[#FFD700]">Diệu Kỳ</span></>,
        subtitle: 'Ưu đãi vé xe giảm tới 50% cho sinh viên, về nhà đón Tết sum vầy.'
    },
    {
        id: 2,
        image: '/tet-bg-2025.png',
        title: <>Về Nhà <br /> <span className="text-[#FFD700]">Đón Tết</span></>,
        subtitle: 'Hàng ngàn chuyến xe an toàn, chất lượng đang chờ đón bạn.'
    },
    {
        id: 3,
        image: '/tet-bg-v2.png',
        title: <>Du Xuân <br /> <span className="text-[#FFD700]">Rộn Ràng</span></>,
        subtitle: 'Trải nghiệm hành trình trọn vẹn và ý nghĩa cùng Hola Bus.'
    }
];

// --- UTILS ---
function normalizeString(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

// --- SUB-COMPONENTS ---
function CategoryIcon({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-600 group-hover:text-red-600 text-center max-w-[80px] leading-tight">
                {label}
            </span>
        </div>
    );
}

function SearchTab({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`pb-2 text-sm font-bold border-b-2 transition-all ${active
                ? 'text-[#D0021B] border-[#D0021B]'
                : 'text-slate-500 border-transparent hover:text-[#D0021B]'
                }`}
        >
            {label}
        </button>
    );
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

// --- MAIN COMPONENT ---
export default function TripSearchSection({ trips, user, destinationImages = {} }: { trips: any[], user: any, destinationImages?: Record<string, string> }) {

    const searchParams = useSearchParams();

    // Initialize search from URL if present
    const initialSearch = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);
    const [isSearching, setIsSearching] = useState(false);
    const [visibleCount, setVisibleCount] = useState(4);
    const [activeTab, setActiveTab] = useState('bus');

    // Ref for scrolling
    const resultsRef = useRef<HTMLDivElement>(null);

    const handleSearchScroll = (val: string) => {
        setSearchTerm(val);

        // Update URL without reloading (Shallow routing pattern)
        const newUrl = new URL(window.location.href);
        if (val) {
            newUrl.searchParams.set('q', val);
        } else {
            newUrl.searchParams.delete('q');
        }
        window.history.pushState({}, '', newUrl.toString());

        // Scroll logic...
        if (val && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    // Slider State
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance Slider
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

    // Debounce Logic
    useEffect(() => {
        if (searchTerm !== debouncedSearchTerm) {
            setIsSearching(true);
            const handler = setTimeout(() => {
                setDebouncedSearchTerm(searchTerm);
                setIsSearching(false);
            }, 500);
            return () => clearTimeout(handler);
        }
    }, [searchTerm, debouncedSearchTerm]);

    const filteredTrips = useMemo(() => {
        if (!debouncedSearchTerm) return trips;
        const normalizedSearch = normalizeString(debouncedSearchTerm);
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
    }, [trips, debouncedSearchTerm]);

    return (
        <div className="min-h-screen bg-[#FFFBE6] font-sans pb-20">

            {/* 1. HERO SECTION (Slider - Full Width) */}
            <div className="relative bg-[#FFFBE6] pb-8 md:pb-16 pt-0">

                {/* Banner Slider Container - Full Width */}
                <div className="relative w-full h-[400px] md:h-[600px] bg-slate-900 overflow-hidden shadow-sm group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            {/* Background Image */}
                            <img
                                src={HERO_SLIDES[currentSlide].image}
                                alt="Banner"
                                className="w-full h-full object-cover object-center"
                            />
                            {/* Overlay */}
                            {/* Overlay Removed */}
                            {/* <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div> */}

                            {/* Content */}
                            <div className="absolute inset-0 max-w-[1280px] mx-auto px-4 md:px-6 pointer-events-none">
                                <div className="h-full flex flex-col justify-center text-white max-w-2xl pointer-events-auto pl-2 md:pl-0 pb-12">
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    >
                                        <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight drop-shadow-2xl text-yellow-50">
                                            {HERO_SLIDES[currentSlide].title}
                                        </h1>
                                        <p className="text-lg md:text-2xl font-bold opacity-90 mb-8 drop-shadow-xl text-yellow-100 max-w-lg shadow-black">
                                            {HERO_SLIDES[currentSlide].subtitle}
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Slider Controls (Arrows) - Hidden on mobile, visible on group hover for desktop */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100 md:flex hidden"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100 md:flex hidden"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Dots Indicators */}
                    <div className="absolute bottom-24 md:bottom-28 left-0 right-0 flex justify-center gap-3 z-20">
                        {HERO_SLIDES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-[#D0021B] w-8' : 'bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* SEARCH WIDGET (Floating Overlap) */}
                <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative z-10 w-full">
                    <div className="relative -mt-20 md:-mt-32 mx-auto max-w-5xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-yellow-200 p-4 md:p-8">

                        {/* Tabs */}
                        <div className="flex gap-8 border-b border-gray-100 mb-6 px-2">
                            <SearchTab active={activeTab === 'bus'} label="Vé Xe Khách" onClick={() => setActiveTab('bus')} />
                            <SearchTab active={activeTab === 'tour'} label="Thuê Xe Tết" onClick={() => setActiveTab('tour')} />
                        </div>

                        {/* Input Area */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D0021B] transition-colors w-6 h-6" />
                                <input
                                    type="text"
                                    placeholder="Bạn muốn đi đâu? (VD: Quảng Ngãi, Đà Nẵng...)"
                                    className="w-full pl-14 pr-4 py-5 bg-gray-50 hover:bg-white focus:bg-white rounded-2xl font-bold text-lg text-gray-800 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-red-100 border border-transparent focus:border-red-200 transition-all shadow-inner"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearchScroll(searchTerm);
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => handleSearchScroll('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => handleSearchScroll(searchTerm)}
                                className="bg-gradient-to-r from-[#D0021B] to-[#B00020] hover:from-[#E00020] hover:to-[#C00020] text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
                            >
                                <Search className="w-6 h-6" />
                                <span>Tìm Kiếm</span>
                            </button>
                        </div>

                        {/* Quick Suggestions */}
                        <div className="mt-5 flex flex-wrap gap-3 items-center text-sm">
                            <span className="text-gray-400 font-medium mr-1">Phổ biến:</span>
                            {['Quảng Ngãi', 'Đà Nẵng', 'Hà Nội', 'Sài Gòn', 'Đà Lạt'].map(city => (
                                <button
                                    key={city}
                                    onClick={() => handleSearchScroll(city)}
                                    className="px-4 py-1.5 bg-yellow-50 hover:bg-red-50 hover:text-[#D0021B] border border-yellow-100 hover:border-red-100 rounded-full text-slate-600 text-xs md:text-sm font-semibold transition-all"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COUNTDOWN SECTION - Removed from here */}
            </div>

            {/* 3. PROMO / TRIP LIST SECTION */}
            <div
                className="relative py-12 md:py-16 overflow-hidden bg-cover bg-right-top bg-no-repeat"
                style={{ backgroundImage: "url('/tet-section-bg.png')" }}
                ref={resultsRef}
            >
                <div className="max-w-[1280px] mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#D0021B]">Vé Xe Tết 2026</h2>
                            <p className="text-gray-500 text-sm mt-1">Các chuyến đi phổ biến nhất được bình chọn</p>
                        </div>
                    </div>

                    {/* TRIP GRID */}
                    <div className={`transition-all duration-300 ${isSearching ? 'opacity-50 blur-sm' : ''}`}>
                        {filteredTrips.length === 0 ? (
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
                                    {filteredTrips.slice(0, visibleCount).map((trip) => (
                                        <TripCard
                                            key={trip.id}
                                            trip={trip}
                                            destinationImages={destinationImages}
                                        />
                                    ))}
                                </div>


                                {/* Toggle Button: Visible only if we have more trips than the initial limit */}
                                {filteredTrips.length > 4 && (
                                    <div className="mt-10 flex justify-center">
                                        <button
                                            onClick={() => {
                                                if (visibleCount >= filteredTrips.length) {
                                                    setVisibleCount(4); // Collapse
                                                } else {
                                                    setVisibleCount(filteredTrips.length); // Expand All
                                                }
                                            }}
                                            className="w-[200px] h-[48px] border border-[#D0021B] text-[#D0021B] hover:bg-red-50 rounded-lg flex items-center justify-center font-bold bg-white transition-all font-sans"
                                        >
                                            {visibleCount >= filteredTrips.length ? 'See less' : 'See all'}
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