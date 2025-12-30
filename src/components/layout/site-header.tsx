import Link from 'next/link';
import { Bus, Phone, MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import UserNav from './user-nav';
import MobileNav from './mobile-nav';
import { siteConfig } from '@/config/site';

export default async function SiteHeader() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="absolute top-0 left-0 right-0 z-50 w-full">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex h-24 items-center justify-between">

                    {/* 1. LOGO */}
                    <nav className="flex items-center gap-6 shrink-0">
                        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                            {/* Icon - Transparent Background, White Color */}
                            <div className="group-hover:scale-110 transition-transform duration-300">
                                <Bus className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xl md:text-3xl lg:text-4xl tracking-tight text-white leading-none drop-shadow-lg">
                                    HOLA<span className="text-orange-400">BUS</span>
                                </span>
                                <span className="text-[10px] md:text-sm font-bold text-white/90 tracking-widest uppercase drop-shadow-md">
                                    Về nhà ăn Tết
                                </span>
                            </div>
                        </Link>

                        {/* Link: Về dự án (Desktop) */}
                        <Link
                            href="/about"
                            className="hidden lg:block text-xl font-bold text-white hover:text-orange-300 transition-all drop-shadow-md"
                        >
                            Về dự án
                        </Link>
                    </nav>

                    {/* 2. MENU PHẢI (Hotline & User & MobileNav) */}
                    <div className="flex items-center gap-3 md:gap-6 shrink-0">

                        {/* --- HOTLINE (Desktop Only) --- */}
                        {/* On Mobile, we hide this because it will be in the Hamburger Menu */}
                        <a
                            href={`tel:${siteConfig.hotlineUrl}`}
                            className="hidden md:flex items-center gap-2 text-white hover:text-orange-300 transition-all drop-shadow-md group"
                        >
                            <div className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-sm transition-colors">
                                <Phone className="w-5 h-5 fill-current" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-white/80 leading-none">Hotline</span>
                                <span className="text-xl font-bold font-mono leading-none">{siteConfig.hotline}</span>
                            </div>
                        </a>

                        {/* --- SUPPORT (Desktop Only) --- */}
                        <a
                            href={siteConfig.messengerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 text-white hover:text-orange-300 transition-all drop-shadow-md"
                        >
                            <MessageCircle className="w-6 h-6" />
                            <span className="text-lg font-bold">Hỗ trợ</span>
                        </a>

                        {/* User Nav (Desktop Only) */}
                        <div className="hidden md:block">
                            <UserNav user={user} />
                        </div>

                        {/* Mobile Nav (Mobile Only) - Contains Hamburger Menu */}
                        <MobileNav user={user} />
                    </div>

                </div>
            </div>
        </header>
    );
}