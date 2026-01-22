'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { checkBookingStatus } from '@/actions/booking-actions';

type Props = {
    bookingId: string;
};

export default function PaymentStatusChecker({ bookingId }: Props) {
    const router = useRouter();

    useEffect(() => {
        // Polling cứ 3 giây một lần qua Server Action (Bypass RLS cho guest)
        const interval = setInterval(async () => {
            const booking = await checkBookingStatus(bookingId);

            if (booking && booking.status === 'PAID') {
                toast.success('Thanh toán thành công! Đang chuyển hướng...');
                router.refresh(); // Reload để trigger Server Component redirect
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [bookingId, router]);

    return null;
}
