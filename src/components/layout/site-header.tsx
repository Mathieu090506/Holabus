import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import UserNav from './user-nav';
import MobileNav from './mobile-nav';
import HeaderNavigation from './header-navigation';
import { Plane, Search, Bell } from 'lucide-react';

export default async function SiteHeader() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between gap-4">

                    {/* LEFT SIDE: LOGO + NAV LINKS */}
                    <div className="flex items-center gap-8 md:gap-12 flex-shrink-0">
                        {/* LOGO "HOLA BUS" */}
                        <Link href="/" className="flex items-center gap-1 group">
                            <span className="font-black text-2xl tracking-tighter leading-none">
                                <span className="text-red-600">HOLA</span>
                                <span className="text-slate-900">BUS</span>
                            </span>
                        </Link>

                        {/* NAV LINKS */}
                        <HeaderNavigation />
                    </div>

                    {/* RIGHT SIDE: USER NAV */}
                    <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">

                        {/* User UserNav */}
                        <div className="hidden md:block">
                            <UserNav user={user} />
                        </div>

                        {/* Mobile Nav Trigger */}
                        <div className="md:hidden">
                            <MobileNav user={user} />
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
}