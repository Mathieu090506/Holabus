'use client'

import { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { Search, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONSTANTS ---
// --- CONSTANTS ---
// specific constants removed as we only have a static banner now.

import { useSearch } from '@/components/search-provider';

// --- SUB-COMPONENTS ---
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

export default function TripSearchHeader({ trips = [] }: { trips?: any[] }) {

    const searchParams = useSearchParams();
    const router = useRouter();
    const { setIsSearching } = useSearch();
    const [isPending, startTransition] = useTransition();

    // Initialize search from URL if present
    const initialSearch = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState('bus');

    // Derived state for typing status
    const isTyping = searchTerm !== debouncedSearchTerm;

    // Sync isSearching with typing or navigation pending state
    useEffect(() => {
        setIsSearching(isTyping || isPending);
    }, [isTyping, isPending, setIsSearching]);

    const handleSearchScroll = (val: string) => {
        setSearchTerm(val);
        setDebouncedSearchTerm(val); // Skip debounce for manual selection

        // Wrapped in transition for "Load until compiled/found" effect
        startTransition(() => {
            const params = new URLSearchParams(window.location.search);
            if (val) {
                params.set('q', val);
            } else {
                params.delete('q');
            }
            router.replace(`?${params.toString()}`, { scroll: false });
        });

        // Scroll logic (immediately scroll to view the "loading" or result area)
        const resultsEl = document.getElementById('search-results-anchor');
        if (val && resultsEl) {
            setTimeout(() => {
                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    // Debounce Logic & Auto-Search
    useEffect(() => {
        // Only run if the user is typing (difference exists)
        if (isTyping) {
            const handler = setTimeout(() => {
                // Perform navigation inside transition
                startTransition(() => {
                    const params = new URLSearchParams(window.location.search);
                    if (searchTerm) {
                        params.set('q', searchTerm);
                    } else {
                        params.delete('q');
                    }
                    router.replace(`?${params.toString()}`, { scroll: false });
                });

                // Sync state AFTER scheduling transition to maintain "isSearching" true via isPending if needed
                setDebouncedSearchTerm(searchTerm);
            }, 500);

            return () => clearTimeout(handler);
        }
    }, [searchTerm, isTyping, router]);

    // Calculate unique destinations for "Popular" section
    const popularDestinations = Array.from(new Set(trips.map(t => t.destination))).slice(0, 5);

    return (
        <div className="relative bg-[#FFFBE6] pb-8 md:pb-16 pt-0">

            {/* Static Banner Container - Full Width */}
            <div className="relative w-full h-[400px] md:h-[600px] bg-slate-900 overflow-hidden shadow-sm">
                {/* Background Image */}
                <NextImage
                    src="/Banner website.png"
                    alt="Banner"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="100vw"
                />
            </div>

            {/* SEARCH WIDGET (Floating Overlap) */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative z-40 w-full">
                <div className="relative -mt-20 md:-mt-32 mx-auto max-w-5xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-yellow-200 p-4 md:p-8">



                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-gray-100 mb-6 px-2">
                        <SearchTab active={true} label="Vé Xe Khách" onClick={() => setActiveTab('bus')} />
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
                    {activeTab === 'bus' && popularDestinations.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-3 items-center text-sm">
                            <span className="text-gray-400 font-medium mr-1">Phổ biến:</span>
                            {popularDestinations.map(city => (
                                <button
                                    key={city}
                                    onClick={() => handleSearchScroll(city)}
                                    className="px-4 py-1.5 bg-yellow-50 hover:bg-red-50 hover:text-[#D0021B] border border-yellow-100 hover:border-red-100 rounded-full text-slate-600 text-xs md:text-sm font-semibold transition-all"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
