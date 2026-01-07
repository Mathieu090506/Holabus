'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

type Props = {
    bookingId: string;
};

export default function PaymentStatusChecker({ bookingId }: Props) {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // 1. Subscribe to Realtime changes
        const channel = supabase
            .channel(`booking-${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${bookingId}`,
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    if (newStatus === 'PAID') {
                        toast.success('Thanh toán thành công! Đang chuyển hướng...');
                        router.refresh(); // Reload to trigger Server Component redirect
                    }
                }
            )
            .subscribe();

        // 2. Fallback Polling (Every 5 seconds)
        // Just in case Realtime fails (e.g. strict firewall, network issues)
        const interval = setInterval(async () => {
            const { data } = await supabase
                .from('bookings')
                .select('status')
                .eq('id', bookingId)
                .single();

            const booking = data as any;

            if (booking && booking.status === 'PAID') {
                toast.success('Thanh toán thành công! Đang chuyển hướng...');
                router.refresh();
            }
        }, 5000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [bookingId, router, supabase]);

    return null; // This component is invisible
}
