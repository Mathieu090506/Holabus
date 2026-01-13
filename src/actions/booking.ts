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
  const rawStudentId = formData.get('studentId') as string;
  const rawPhone = formData.get('phone') as string;
  const seatPreference = formData.get('preference') as string;
  const rawNotes = formData.get('notes') as string;  // 🛡️ 0. HONEYPOT CHECK
  const honeypot = formData.get('website_url');
  if (honeypot) {
    return { success: false, message: 'Spam detected.' };
  }
  const price = Number(formData.get('price'));

  // Lấy info user (đảm bảo tồn tại)
  let fullName = (user.user_metadata.full_name || '').trim();

  // ----------------------------------------------------------------
  // 🛡️ 3. VALIDATE SERVER-SIDE (SAFE & SECURE)
  // ----------------------------------------------------------------

  // Helper: Kiểm tra XSS/Link
  const isSafeInput = (text: string) => {
    if (!text) return true;
    const lower = text.toLowerCase();

    if (lower.includes('http://') || lower.includes('https://') || lower.includes('www.')) return false;
    if (lower.includes('<script') || lower.includes('javascript:') || lower.includes('vbscript:')) return false;
    if (lower.includes('onload=') || lower.includes('onerror=')) return false;
    return true;
  };

  // A. Validate FULL NAME
  // Simplified safe regex: allow letters, spaces, numbers, dots, dashes, apostrophes.
  const nameRegex = /^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF0-9\s\.\-\']+$/;

  if (!fullName) return { success: false, message: 'Họ tên không được để trống.' };
  if (!nameRegex.test(fullName)) return { success: false, message: 'Họ tên chứa ký tự không hợp lệ.' };
  if (!isSafeInput(fullName)) return { success: false, message: 'Họ tên không được chứa liên kết/mã độc.' };

  // B. Validate PHONE NUMBER
  const cleanPhone = rawPhone ? rawPhone.trim() : '';
  const phoneRegex = /^(84|0[3|5|7|8|9])+([0-9]{8})$/;

  if (!cleanPhone) return { success: false, message: 'Số điện thoại là bắt buộc.' };
  if (!phoneRegex.test(cleanPhone)) return { success: false, message: 'Số điện thoại không đúng định dạng VN.' };
  // Check spam 000...
  if (/^0+$/.test(cleanPhone)) return { success: false, message: 'Số điện thoại spam (Toàn số 0).' };

  // C. Validate STUDENT ID
  const cleanStudentId = rawStudentId ? rawStudentId.trim().toUpperCase() : '';
  const studentIdRegex = /^[A-Z0-9-\.\@]+$/;

  if (!cleanStudentId) return { success: false, message: 'Mã sinh viên là bắt buộc.' };
  if (!studentIdRegex.test(cleanStudentId)) return { success: false, message: 'MSSV/Email chứa ký tự lạ.' };
  if (!isSafeInput(cleanStudentId)) return { success: false, message: 'MSSV/Email chứa nội dung không an toàn.' };

  // D. Validate NOTES
  const cleanNotes = rawNotes ? rawNotes.trim() : '';
  if (cleanNotes.length > 500) return { success: false, message: 'Ghi chú tối đa 500 ký tự.' };
  if (!isSafeInput(cleanNotes)) return { success: false, message: 'Ghi chú chứa Link hoặc Script bị cấm.' };

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
        student_id: cleanStudentId,
        phone_number: cleanPhone,
        amount: price,
        status: 'PENDING',
        payment_code: uniqueCode,
        seat_preference: seatPreference,
        more: cleanNotes // <--- Lưu vào trường 'more' trong DB
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