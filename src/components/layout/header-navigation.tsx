'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';

export default function HeaderNavigation() {
    return (
        <nav className="hidden md:flex items-center gap-6 text-lg font-medium text-slate-500">
            <Link
                href="/my-tickets"
                className="hover:text-slate-900 transition-colors"
            >
                Chuyến đi
            </Link>
            <Link
                href="/about"
                className="hover:text-slate-900 transition-colors"
            >
                Về dự án
            </Link>
            <Link
                href="/support"
                className="hover:text-slate-900 transition-colors"
            >
                Hỗ trợ
            </Link>
        </nav>
    );
}
