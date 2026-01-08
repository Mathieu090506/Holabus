'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { TicketEmail } from '@/components/email/ticket-email';
import { appendToSheet } from '@/utils/google-sheets';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function syncCassoTransactions() {
    const CASSO_API_KEY = process.env.CASSO_API_KEY; // Cần thêm vào .env

    if (!CASSO_API_KEY) {
        return { success: false, message: 'Chưa cấu hình CASSO_API_KEY trong .env' };
    }

    try {
        console.log("🔄 Bắt đầu đồng bộ Casso thủ công...");

        // 1. Gọi API lấy lịch sử giao dịch (100 cái mới nhất)
        const response = await fetch('https://oauth.casso.vn/v2/transactions?pageSize=100', {
            headers: {
                'Authorization': `Apikey ${CASSO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const body = await response.json();

        if (body.error) {
            console.error("Casso Error:", body);
            return { success: false, message: `Lỗi từ Casso: ${body.message || 'Unknown'}` };
        }

        const transactions = body.data?.records || [];
        if (transactions.length === 0) {
            return { success: true, message: 'Không có giao dịch nào mới.' };
        }

        // 2. Xử lý giống hệt Webhook
        const supabase = createAdminClient();
        let processedCount = 0;

        for (const tx of transactions) {
            const description = (tx.description || '').toUpperCase();
            const amount = Number(tx.amount || 0);
            const match = description.match(/HOLA[A-Z0-9]+/);

            if (match) {
                const paymentCode = match[0];

                // A. Tìm đơn hàng
                const { data: booking } = await supabase.from('bookings').select('*').eq('payment_code', paymentCode).single();

                if (booking && booking.status !== 'PAID' && amount >= (booking.amount - 1000)) {
                    // B. Update PAID
                    await supabase.from('bookings').update({ status: 'PAID' }).eq('id', booking.id);
                    processedCount++;

                    // C. Gửi mail & Sheet (Copy logic từ webhook sang cho gọn)
                    // (Khuyên dùng: Nên tách logic xử lý này ra 1 file utils chung 'processPayment' để Webhook và Sync dùng chung)

                    try {
                        const { data: trip } = await supabase.from('trips').select('*').eq('id', booking.trip_id).single();
                        const { data: profile } = await supabase.from('profiles').select('*').eq('id', booking.user_id).single();

                        if (profile?.email) {
                            await resend.emails.send({
                                from: 'HOLA BUS <onboarding@resend.dev>',
                                to: profile.email,
                                subject: `[HOLA BUS] Vé thành công: ${paymentCode}`,
                                react: TicketEmail({
                                    customerName: booking.full_name || profile.full_name,
                                    busRoute: trip ? `${trip.origin} - ${trip.destination}` : '',
                                    departureTime: trip ? new Date(trip.departure_time).toLocaleString('vi-VN') : '',
                                    ticketCode: paymentCode,
                                    seatType: booking.seat_preference,
                                    price: booking.amount
                                }),
                            });
                        }

                        await appendToSheet({ ...booking, trips: trip, phone_number: booking.phone_number });

                    } catch (err) {
                        console.error("Side effect error:", err);
                    }
                }
            }
        }

        revalidatePath('/admin');
        return { success: true, message: `Đã quét ${transactions.length} giao dịch. Cập nhật thành công ${processedCount} đơn.` };

    } catch (error: any) {
        console.error("Sync Error:", error);
        return { success: false, message: error.message };
    }
}
