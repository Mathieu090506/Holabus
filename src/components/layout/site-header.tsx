import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import UserNav from './user-nav';
import MobileNav from './mobile-nav';
import HeaderNavigation from './header-navigation';
import BookingButton from './booking-button';
import { Plane, Search, Bell } from 'lucide-react';

export default async function SiteHeader() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">
                <div className="flex h-24 items-center justify-between gap-4">

                    {/* LEFT SIDE: LOGO + NAV LINKS */}
                    <div className="flex items-center gap-8 md:gap-12 flex-shrink-0">
                        {/* LOGO "HOLA BUS" */}
                        <Link href="/" className="flex items-center gap-1 group">
                            <Image
                                src="/logo1.png"
                                alt="Hola Bus Logo"
                                width={200}
                                height={70}
                                className="h-16 w-auto object-contain"
                                priority
                            />
                        </Link>

                        {/* NAV LINKS */}
                        <HeaderNavigation />
                    </div>

                    {/* RIGHT SIDE: USER NAV */}
                    <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">

                        {/* Decor Images */}
                        <div className="hidden md:flex items-center gap-2 mr-2 select-none">
                            <div className="relative w-20 h-20">
                                <Image src="/mascot1.png" alt="Mascot" fill className="object-contain" priority />
                            </div>
                            <BookingButton />
                        </div>

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