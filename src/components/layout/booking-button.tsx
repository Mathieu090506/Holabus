'use client';

import { TicketPercent } from 'lucide-react';

export default function BookingButton() {
    const handleScroll = () => {
        const element = document.getElementById('trip-list-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Fallback for other pages
            window.location.href = '/#trip-list-section';
        }
    };

    return (
        <button
            onClick={handleScroll}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white pl-4 pr-6 py-3 rounded-full font-bold shadow-red-200 shadow-lg hover:shadow-red-300 hover:scale-105 active:scale-95 transition-all group mr-4"
        >
            <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-12 transition-transform">
                <TicketPercent size={20} className="text-white" />
            </div>
            <span>Đặt vé ngay</span>
        </button>
    );
}
