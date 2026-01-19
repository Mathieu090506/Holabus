import React from 'react';
import TetWheelGame from '@/components/tet-wheel-game';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { createClient } from '@/utils/supabase/server';
import { ALLOWED_EMAILS } from '@/utils/constants';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Vòng Quay Holabus - Tết 2025',
    description: 'Thử vận may đầu năm cùng Hola Bus',
};

export default async function TetWheelPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?next=/tet-wheel');
    }

    if (!user.email || !ALLOWED_EMAILS.includes(user.email)) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#A50000] to-[#500000] relative overflow-x-hidden">

            {/* Removed background patterns */}

            <header className="p-4 flex justify-between items-center relative z-10 glassmorphism-header">
                <Link href="/admin" className="flex items-center gap-2 text-yellow-300 hover:text-white transition-colors">
                    <ChevronLeft /> Quay lại Admin
                </Link>
                <div className="text-right">
                    <h2 className="text-white font-bold text-lg">HOLA BUS</h2>
                    <p className="text-yellow-400 text-xs">Vui Tết Sum Vầy - Lộc Đầy Nhà</p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh] relative z-10">

                {/* Decorative Elements */}
                <div className="text-center mb-8 animate-fade-in-down">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 via-yellow-200 to-yellow-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tighter uppercase font-sans transform hover:scale-105 transition-transform duration-300">
                        VÒNG QUAY HOLABUS
                    </h1>
                    <p className="text-red-100 mt-3 text-xl font-medium tracking-wide">
                        ✨ Xuân Ất Tỵ - Vạn Sự Như Ý ✨
                    </p>
                </div>

                <TetWheelGame />

                {/* Footer Decor */}
                <div className="mt-12 text-center text-white/50 text-sm">
                    <p>© 2025 Hola Bus Team. All rights reserved.</p>
                </div>
            </main>

            {/* Blossoms Decor (CSS/SVG) */}
            <div className="fixed top-20 left-10 text-6xl opacity-30 animate-pulse hidden md:block">🌸</div>
            <div className="fixed bottom-20 right-10 text-6xl opacity-30 animate-pulse delay-1000 hidden md:block">🌼</div>
            <div className="fixed top-1/2 left-4 text-4xl opacity-20 hidden md:block">🧧</div>
            <div className="fixed top-1/3 right-8 text-4xl opacity-20 hidden md:block">💰</div>

        </div>
    );
}
