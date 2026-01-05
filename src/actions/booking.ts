'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Định nghĩa kiểu dữ liệu trả về
export type BookingState = {
  success: boolean;
  message?: string;
  bookingId?: string;
};

export async function createBooking(prevState: any, formData: FormData): Promise<BookingState> {
  const supabase = await createClient();

  // 1. Kiểm tra User (Bảo mật 2 lớp)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Phiên đăng nhập hết hạn. Vui lòng login lại.' };
  }

  // 2. Lấy dữ liệu từ Form gửi lên
  const tripId = formData.get('tripId') as string;
  const studentId = formData.get('studentId') as string;
  const phone = formData.get('phone') as string;
  const seatPreference = formData.get('preference') as string;
  const notes = formData.get('notes') as string; // <--- Lấy notes từ form
  const price = Number(formData.get('price'));

  // Lấy tên thật từ tài khoản Google (để lưu vào đơn cho tiện đối soát)
  const fullName = user.user_metadata.full_name;

  // 3. Validate Server-side (Chống gian lận)
  if (!tripId || !studentId || !phone) {
    return { success: false, message: 'Thiếu thông tin bắt buộc.' };
  }

  // 4. Sinh mã thanh toán (PAYMENT CODE)
  const uniqueCode = 'HOLA' + Math.random().toString(36).substring(2, 7).toUpperCase();

  // 4.5. KIỂM TRA SỐ LƯỢNG VÉ CÒN LẠI (Manual Check)
  const { data: tripDataRaw, error: tripError } = await supabase
    .from('trips')
    .select('capacity')
    .eq('id', tripId)
    .single();

  const tripData = tripDataRaw as any;

  if (tripError || !tripData) {
    return { success: false, message: 'Lỗi: Không tìm thấy thông tin chuyến xe.' };
  }

  if (tripData.capacity <= 0) {
    return { success: false, message: 'Rất tiếc, chuyến xe này đã hết vé!' };
  }

  // 5. INSERT VÀO DATABASE
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        trip_id: tripId,
        full_name: fullName,
        student_id: studentId,
        phone_number: phone,
        amount: price,
        status: 'PENDING',
        payment_code: uniqueCode,
        seat_preference: seatPreference,
        more: notes // <--- Lưu vào trường 'more' trong DB
      } as any)
      .select('id')
      .single();

    // Xử lý lỗi từ Database (Trigger chặn)
    if (error) {
      console.error("Booking Error:", error);
      // Nếu trigger check_capacity báo lỗi
      if (error.message.includes('Sold Out') || error.message.includes('hết chỗ')) {
        return { success: false, message: 'Rất tiếc, chuyến xe vừa hết chỗ!' };
      }
      return { success: false, message: 'Lỗi hệ thống: ' + error.message };
    }

    // 5.5. TRỪ SỐ VÉ ĐI 1
    const { error: updateError } = await (supabase.from('trips') as any)
      .update({ capacity: tripData.capacity - 1 })
      .eq('id', tripId);

    // 6. Thành công!
    revalidatePath(`/trips/${tripId}`);
    revalidatePath('/');

    return { success: true, bookingId: (data as any)?.id };

  } catch (err) {
    console.error("System Error:", err);
    return { success: false, message: 'Đã có lỗi không mong muốn xảy ra.' };
  }
}