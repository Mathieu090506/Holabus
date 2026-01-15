'use server'

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// 👇 HÀM NÀY ĐÃ ĐƯỢC SỬA: Dùng createAdminClient để fix lỗi
async function uploadTripImage(file: File, oldUrl?: string) {
  // Nếu không có file mới hoặc file rỗng -> Trả về link cũ (nếu có) hoặc chuỗi rỗng
  if (!file || file.size === 0) return oldUrl || '';

  const supabase = createAdminClient();
  const fileExt = file.name.split('.').pop();
  // Đặt tên file random để tránh trùng
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload vào bucket 'trip-images'
  const { error } = await supabase.storage.from('trip-images').upload(fileName, file);

  if (error) {
    console.error('Upload lỗi:', error);
    // Nếu lỗi upload thì vẫn trả về link cũ để không bị mất ảnh
    return oldUrl || '';
  }

  // Lấy public URL
  const { data } = supabase.storage.from('trip-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// 1. TẠO CHUYẾN XE
export async function createTrip(formData: FormData) {
  try {
    const supabase = createAdminClient();

    // 👇 SỬA ĐOẠN NÀY: Xử lý upload ảnh trước
    const imageFile = formData.get('image') as File; // Lấy file từ input name="image"
    const imageUrl = await uploadTripImage(imageFile); // Upload và lấy link

    const tripData = {
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      departure_time: formData.get('departure_time') as string,
      price: Number(formData.get('price')),
      capacity: Number(formData.get('capacity')), // 👇 Thêm số lượng vé
      image_url: imageUrl,                    // 👇 Lưu link ảnh vừa upload
      route_details: formData.get('route_details') as string,
      waypoints: formData.get('waypoints') as string,
      tags: formData.get('tags') as string,
      google_sheet_url: formData.get('google_sheet_url') as string,
      vehicle_type: formData.get('vehicle_type') as string,
    };

    console.log("🚀 Đang tạo chuyến xe:", tripData);

    const { error } = await supabase.from('trips').insert([tripData]);

    if (error) {
      console.error("❌ Lỗi Supabase (Create):", error);
      if (error.code === 'PGRST204') {
        return { error: "Thiếu cột 'google_sheet_url' hoặc 'tags' trong Database. Hãy chạy lệnh SQL trong file update_schema_sheet.sql!" };
      }
      return { error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };

  } catch (err: any) {
    return { error: err.message };
  }
}

// 2. CẬP NHẬT
// Lưu ý: tripId bạn đang để là number, hãy chắc chắn DB của bạn id là int8. Nếu là UUID thì đổi thành string.
export async function updateTrip(tripId: number, formData: FormData) {
  try {
    const supabase = createAdminClient();

    // 👇 SỬA ĐOẠN NÀY: Xử lý upload ảnh mới hoặc giữ ảnh cũ
    const newImageFile = formData.get('image') as File;
    const oldImageUrl = formData.get('old_image_url') as string;

    // Hàm này sẽ tự quyết định: Có ảnh mới thì up, không thì trả về oldImageUrl
    const imageUrl = await uploadTripImage(newImageFile, oldImageUrl);

    const updates = {
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      departure_time: formData.get('departure_time') as string,
      price: Number(formData.get('price')),
      capacity: Number(formData.get('capacity')), // 👇 Thêm update số lượng vé
      image_url: imageUrl, // 👇 Lưu link ảnh (mới hoặc cũ)
      route_details: formData.get('route_details') as string,
      waypoints: formData.get('waypoints') as string,
      tags: formData.get('tags') as string, // 👇 Tag hiển thị
      google_sheet_url: formData.get('google_sheet_url') as string, // 👇 Link Google Sheet
      vehicle_type: formData.get('vehicle_type') as string,
    };

    console.log("🚀 Đang update chuyến:", tripId, updates);

    const { error } = await supabase.from('trips').update(updates).eq('id', tripId);

    if (error) {
      console.error("❌ Lỗi Supabase (Update):", error);
      if (error.code === 'PGRST204') {
        return { error: "Thiếu cột 'google_sheet_url' hoặc 'tags' trong Database. Hãy chạy lệnh SQL trong file update_schema_sheet.sql!" };
      }
      return { error: error.message };
    }

    revalidatePath('/', 'layout'); // 👈 Force revalidate toàn bộ site
    revalidatePath(`/trips/${tripId}`); // 👈 Revalidate đúng trang chi tiết chuyến này
    return { success: true };

  } catch (err: any) {
    return { error: err.message };
  }
}

// 3. XÓA (Đã sửa: Manual Cascade Delete)
export async function deleteTrip(tripId: number) {
  try {
    const supabase = createAdminClient();
    console.log("🚀 Đang xóa chuyến:", tripId);

    // 1. Xóa tất cả bookings của chuyến này trước (để tránh lỗi Foreign Key nếu chưa set Cascade DB)
    const { error: bookingError } = await supabase
      .from('bookings')
      .delete()
      .eq('trip_id', tripId);

    if (bookingError) {
      console.error("❌ Lỗi khi xóa bookings đính kèm:", bookingError);
      return { error: "Không thể xóa lịch sử vé: " + bookingError.message };
    }

    // 2. Sau đó mới xóa Trip
    const { error } = await supabase.from('trips').delete().eq('id', tripId);

    if (error) {
      console.error("❌ Lỗi Supabase (Delete Trip):", error);
      return { error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };

  } catch (err: any) {
    console.error("❌ Lỗi Server Action:", err);
    return { error: err.message };
  }
}

// 4. XÓA VÉ (Giữ nguyên)
export async function deleteBooking(bookingId: string) {
  try {
    const supabase = createAdminClient();
    console.log("🚀 Đang xóa booking:", bookingId);

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

    if (error) {
      console.error("❌ Lỗi xóa booking:", error);
      return { error: error.message };
    }

    revalidatePath('/admin/trips/[id]', 'page');
    return { success: true };

  } catch (err: any) {
    return { error: err.message };
  }
}

// 5. CHECK-IN VÉ (Giữ nguyên)
export async function checkInTicket(paymentCode: string) {
  try {
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, trips(destination, departure_time)')
      .eq('payment_code', paymentCode)
      .single();

    if (error || !booking) {
      return { error: 'Vé không tồn tại hoặc mã sai!' };
    }

    if (booking.status === 'PENDING') return { error: 'Vé CHƯA THANH TOÁN!' };
    if (booking.status === 'CANCELLED') return { error: 'Vé ĐÃ BỊ HỦY!' };

    const checkInTime = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ check_in_at: checkInTime })
      .eq('id', booking.id);

    if (updateError) return { error: 'Lỗi cập nhật DB: ' + updateError.message };

    return {
      success: true,
      booking: {
        ...booking,
        trip_destination: booking.trips.destination,
        trip_time: booking.trips.departure_time,
        check_in_at: checkInTime
      }
    };

  } catch (err: any) {
    return { error: err.message };
  }
}