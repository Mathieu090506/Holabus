'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownBanner() {
    // State to store days remaining
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

    useEffect(() => {
        // FIXED END DATE: February 1st, 2026 (7 days from Jan 25th, 2026)
        // Adjust this date to change the deadline.
        const DEADLINE = new Date('2026-02-01T23:59:59');

        const calculateDays = () => {
            const now = new Date();
            const diffTime = DEADLINE.getTime() - now.getTime();

            // Calculate days (rounding up to include partially remaining days)
            // e.g., 6.5 days -> 7 days remaining
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setDaysRemaining(days);
        };

        calculateDays();

        // Optional: Update check every minute? 
        // Not strictly necessary for "Days" only, but good for keeping it accurate if user keeps tab open overnight.
        const timer = setInterval(calculateDays, 60000);

        return () => clearInterval(timer);
    }, []);

    // 1. If logic hasn't run yet (null), don't show (avoid hydration mismatch if possible, or simple null)
    // 2. If daysRemaining <= 0, hide the banner (time is up)
    if (daysRemaining === null || daysRemaining <= 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-[#a30000] via-[#D0021B] to-[#a30000] text-white border-b-4 border-yellow-500 shadow-xl relative z-[100] overflow-hidden">
            {/* Decorative Background Effects */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-500/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-500/30 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col items-center justify-center text-center relative z-10">

                <div className="flex items-center gap-2 mb-1 opacity-90">
                    <Clock className="w-4 h-4 text-yellow-300 animate-spin-slow" />
                    <p className="font-bold text-sm md:text-lg uppercase tracking-wide text-white">
                        HOLABUS2026 SẼ NGỪNG BÁN VÉ TRỰC TUYẾN TRONG VÒNG
                    </p>
                    <Clock className="w-4 h-4 text-yellow-300 animate-spin-slow" />
                </div>

                <div className="mt-1">
                    <span className="inline-block bg-white text-[#D0021B] font-black text-3xl md:text-5xl px-6 py-2 rounded-2xl shadow-[0_4px_0_rgb(0,0,0,0.2)] border-2 border-yellow-400 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                        {daysRemaining} NGÀY
                    </span>
                </div>
            </div>
        </div>
    );
}
