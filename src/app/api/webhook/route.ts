import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { TicketEmail } from '@/components/email/ticket-email';
import { appendToSheet } from '@/utils/google-sheets';

// Khởi tạo Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        // 1. CHECK BẢO MẬT
        console.log("🔔 WEBHOOK ĐÃ NHẬN ĐƯỢC REQUEST!");
        const secureToken = req.headers.get('x-secure-token') || req.headers.get('secure-token');
        console.log(`🔑 Token nhận được: ${secureToken}`);
        console.log(`🔐 Token trong Env: ${process.env.WEBHOOK_SECRET}`);

        if (secureToken !== process.env.WEBHOOK_SECRET) {
            console.log("⛔ Sai Webhook Secret! Dừng xử lý.");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const transactions = body.data || [];

        // Nếu không có giao dịch thì return luôn
        if (transactions.length === 0) {
            return NextResponse.json({ message: 'No transactions' });
        }

        const supabase = createAdminClient();
        const results = [];

        // 2. DUYỆT GIAO DỊCH
        for (const tx of transactions) {
            console.log("RAW Description:", tx.description);

            const description = (tx.description || '').toUpperCase();
            const amount = tx.amount || 0;

            console.log(`🔍 Nội dung sau khi chuẩn hóa: "${description}"`);

            // Tìm mã đơn (VD: HOLA8X92)
            const match = description.match(/HOLA[A-Z0-9]+/);

            if (match) {
                let emailDebug = "Chưa thực hiện";
                let sheetDebug = "Chưa thực hiện"; // <--- [2] BIẾN MỚI

                const paymentCode = match[0];
                console.log(`\n============== 🔍 XỬ LÝ ĐƠN: ${paymentCode} ==============`);

                // A. LẤY ĐƠN HÀNG TỪ DB
                const { data: booking } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('payment_code', paymentCode)
                    .single();

                if (!booking) {
                    console.log(`❌ Không tìm thấy đơn hàng trong DB`);
                    continue;
                }

                if (booking.status === 'PAID') {
                    console.log(`⚠️ Đơn này đã PAID rồi, bỏ qua.`);
                    results.push({ code: paymentCode, status: 'Already PAID' });
                    continue;
                }

                // B. KIỂM TRA TIỀN (Cho phép khách chuyển dư)
                if (amount >= booking.amount) {
                    console.log(`💰 Tiền OK (${amount} >= ${booking.amount}). Đang update DB...`);
                    // C. UPDATE DB -> PAID
                    const { error: updateError } = await supabase
                        .from('bookings')
                        .update({ status: 'PAID' })
                        .eq('id', booking.id);

                    if (!updateError) {
                        console.log(`✅ Đã đổi trạng thái sang PAID.`);

                        // =========================================================
                        // D. LOGIC PHỤ TRỢ (EMAIL + GOOGLE SHEET)
                        // =========================================================
                        try {
                            // Lấy thông tin chi tiết (Dùng chung cho cả Email và Sheet)
                            const { data: trip } = await supabase.from('trips').select('*').eq('id', booking.trip_id).single();

                            let profile = null;
                            if (booking.user_id) {
                                const { data } = await supabase.from('profiles').select('*').eq('id', booking.user_id).single();
                                profile = data;
                            }

                            // Ưu tiên email từ booking (cho guest), nếu không có mới lấy từ profile
                            const emailNhanVe = booking.email || profile?.email;
                            const ADMIN_EMAIL = 'duongthanh09052006@gmail.com';

                            // Debug log
                            if (!process.env.RESEND_API_KEY) {
                                console.error("⚠️ THIẾU RESEND_API_KEY! Không thể gửi email.");
                                emailDebug = "Lỗi: Thiếu API Key";
                            } else {
                                console.log(`📧 Chuẩn bị gửi email tới: ${emailNhanVe}`);
                            }

                            // --- 1. GỬI EMAIL ---
                            if (!emailNhanVe) {
                                emailDebug = "Lỗi: Không tìm thấy email trong DB (Booking & Profile đều null)";
                                console.error(emailDebug);
                            } else {
                                const { data: emailData, error: emailError } = await resend.emails.send({
                                    from: 'HOLA BUS <booking@holabus.com.vn>',
                                    to: emailNhanVe,
                                    subject: `[HOLA BUS] Vé điện tử: ${paymentCode}`,
                                    react: TicketEmail({
                                        customerName: booking.full_name || profile?.full_name || 'Khách hàng',
                                        email: emailNhanVe || '',
                                        phoneNumber: booking.phone_number || profile?.phone_number || '',
                                        busRoute: trip ? `${trip.origin} - ${trip.destination}` : 'Chuyến đi',
                                        departureTime: 'Sáng thứ 7 - 07/02/2026', // ⚠️ FIXED TIME AS REQUESTED
                                        ticketCode: paymentCode,
                                        price: booking.amount,
                                        note: booking.more // <--- Thêm ghi chú vào email
                                    }),
                                });

                                if (emailError) {
                                    console.error("🔥 RESEND THẤT BẠI:", emailError);
                                    emailDebug = `Thất bại: ${emailError.message}`;
                                } else {
                                    console.log("📧 RESEND THÀNH CÔNG! ID:", emailData?.id);
                                    emailDebug = `Thành công! ID: ${emailData?.id}`;
                                }
                            }

                            // --- 2. GHI GOOGLE SHEET (MỚI) --- [3] ĐOẠN CODE MỚI CHÈN VÀO
                            console.log("📊 Đang ghi Google Sheet...");
                            const sheetData = {
                                ...booking,
                                trips: trip, // Truyền thông tin chuyến xe vào để lấy tên chuyến
                                phone_number: booking.phone_number
                            };

                            // Gọi hàm ghi sheet và lưu trạng thái
                            const sheetStatus = await appendToSheet(sheetData);
                            sheetDebug = sheetStatus;

                        } catch (err: any) {
                            console.error("🔥 CRASH LOGIC PHỤ:", err);
                            emailDebug = `Crash code: ${err.message}`;
                            sheetDebug = `Crash code: ${err.message}`;
                        }
                        // =========================================================

                        results.push({
                            code: paymentCode,
                            status: 'Success',
                            email_status: emailDebug,
                            sheet_status: sheetDebug // <--- [4] TRẢ VỀ KẾT QUẢ SHEET
                        });
                    } else {
                        console.error("Lỗi update DB:", updateError);

                    }
                } else {
                    // 👇👇👇 THÊM ĐOẠN NÀY VÀO NGAY
                    console.error(`💸 THIẾU TIỀN! Khách chuyển: ${amount}, Giá vé: ${booking.amount}`);
                    console.error(`👉 Mã đơn: ${paymentCode} chưa được kích hoạt.`);

                    // (Tùy chọn) Bạn có thể return luôn kết quả để Casso biết (nhưng thường cứ để 200 để Casso không gọi lại)
                    results.push({
                        code: paymentCode,
                        status: 'Failed',
                        reason: `Thiếu tiền: Trả ${amount}/${booking.amount}`
                    });
                }
            } else {
                console.log(`⚠️ KHÔNG tìm thấy mã HOLA... trong chuỗi: ${description}`);
            }
        }

        return NextResponse.json({ success: true, processed: results });
    } catch (error: any) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
