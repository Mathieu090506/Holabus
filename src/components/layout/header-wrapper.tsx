'use client';

import { usePathname } from 'next/navigation';

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide global header on About page
    if (pathname === '/about') return null;

    return <>{children}</>;
}
