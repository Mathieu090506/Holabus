'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';

export default function HeaderNavigation() {
    return (
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link
                href="/my-tickets"
                className="hover:text-slate-900 transition-colors"
            >
                My Trips
            </Link>
            <Link
                href="/wallet"
                className="hover:text-slate-900 transition-colors"
            >
                Wallet
            </Link>
            <Link
                href="/support"
                className="hover:text-slate-900 transition-colors"
            >
                Support
            </Link>
        </nav>
    );
}
