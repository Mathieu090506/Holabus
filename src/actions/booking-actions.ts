'use server'

import { createClient } from '@/utils/supabase/server';

// Định nghĩa kiểu dữ liệu cho thông tin bổ sung
type BookingExtraData = {
  fullname: string;
  phone: string;
  studentId: string;
  notes: string;
};

export async function bookTicket(
  tripId: string, 
  seatPreference: string, 
  extraData: BookingExtraData
) {
  const supabase = await createClient();

  try {
    // 1. Kiểm tra đăng nhập
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Bạn cần đăng nhập để đặt vé!" };
    }

    // 2. Chống Spam: Kiểm tra xem user này đã đặt vé nào trong 30 giây qua chưa
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('created_at', thirtySecondsAgo);

    if (count && count > 0) {
      return { error: "Bạn thao tác quá nhanh! Vui lòng chờ 30 giây." };
    }
    
    // 3. Lấy thông tin chuyến xe để lấy giá tiền
    const { data: trip } = await supabase.from('trips').select('price').eq('id', tripId).single();
    if (!trip) return { error: "Chuyến xe không tồn tại!" };

    // 4. Tạo mã thanh toán ngẫu nhiên (VD: HOLA8392)
    const paymentCode = `HOLA${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. INSERT VÀO DATABASE
    const { data, error } = await supabase.from('bookings').insert({
      user_id: user.id,
      trip_id: tripId,
      status: 'PENDING',
      amount: trip.price,
      payment_code: paymentCode,
      
      // Các trường thông tin từ Form
      seat_preference: seatPreference, // Vị trí ghế
      full_name: extraData.fullName,
      email: user.email,
      phone_number: extraData.phone,   // SĐT người dùng nhập
      student_id: extraData.studentId, // (Bỏ comment nếu DB có cột này)
      // notes: extraData.notes           // (Bỏ comment nếu DB có cột này)
      
    }).select().single();

    if (error) {
      console.error("❌ Lỗi Supabase:", error.message); // Log lỗi ra Terminal server để debug
      return { error: "Lỗi hệ thống: " + error.message };
    }

    // Thành công
    return { success: true, bookingId: data.id };

  } catch (err: any) {
    console.error("❌ Lỗi Server Action:", err);
    return { error: "Lỗi không xác định: " + err.message };
  }
}