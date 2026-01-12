'use client'

import { useState } from 'react';
import { bookTicket } from '@/actions/booking-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Ticket, User, Phone, BookOpen, Armchair, CheckCircle2 } from 'lucide-react';

type Props = {
  tripId: string;
  price: number;
  user: any;
};

export default function BookingFormV2({ tripId, price, user }: Props) {
  const [loading, setLoading] = useState(false);

  // State quản lý lựa chọn ghế (Mặc định là Random)
  const [seatType, setSeatType] = useState('random');

  const router = useRouter();



  // Xử lý khi bấm nút Đặt vé
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // 👇 1. LẤY THÊM BIẾN NÀY
    const fullName = formData.get('fullName') as string;

    const phoneNumber = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const notes = formData.get('notes') as string;
    const seatNotes = formData.get('seatNotes') as string;

    // Combine notes
    const finalNotes = `Điểm xuống: ${notes || 'Không có'}. \nLưu ý ghế: ${seatNotes || 'Không có'}`;

    // 👇 2. THÊM VALIDATE TÊN
    if (!fullName || fullName.trim().length < 2) {
      toast.error("Vui lòng nhập họ tên đầy đủ");
      setLoading(false);
      return;
    }

    // Regex validate số điện thoại VN: 10 số, bắt đầu bằng 0
    const phoneRegex = /^0\d{9}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ", { description: "Vui lòng nhập đúng 10 số, bắt đầu bằng số 0." });
      setLoading(false);
      return;
    }

    // Validate Email (nếu có nhập)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      toast.error("Email không hợp lệ", { description: "Vui lòng kiểm tra lại định dạng email." });
      setLoading(false);
      return;
    }

    if (!notes || notes.trim().length === 0) {
      toast.error("Vui lòng nhập điểm xuống xe mong muốn");
      setLoading(false);
      return;
    }

    const honeypot = formData.get('website_url') as string;

    try {
      console.log("🚀 Đang gửi yêu cầu đặt vé...");

      const result = await bookTicket(
        tripId,
        'request', // Default to request
        {
          fullName: fullName,
          phone: phoneNumber,
          studentId: email, // Dùng trường studentId để lưu email tạm thời
          notes: finalNotes, // Combined notes
          honeypot: honeypot // Pass honeypot to server
        }
      );

      console.log("✅ Kết quả từ server:", result);

      if (result.error) {
        toast.error("Đặt vé thất bại", { description: result.error });
      } else if (result.success) {
        toast.success("Thành công!", { description: "Đang chuyển đến trang thanh toán..." });
        // Chuyển hướng ngay lập tức
        router.push(`/payment/${result.bookingId}`);
      }

    } catch (err) {
      console.error("❌ Lỗi Client:", err);
      toast.error("Lỗi kết nối", { description: "Vui lòng thử lại sau." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* --- HONEYPOT (CHỐNG BOT) --- */}
      {/* Bot sẽ tự động điền vào các ô này, người thường thì không thấy. Nếu có dữ liệu => Chặn */}
      <div className="opacity-0 absolute -z-10 w-0 h-0 overflow-hidden">
        <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
        <input type="text" name="fax_number" tabIndex={-1} autoComplete="off" />
      </div>

      {/* 1. THÔNG TIN CÁ NHÂN */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Họ và tên</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              name="fullName" // 1. Thêm name để lấy dữ liệu
              type="text"
              required        // 2. Bắt buộc nhập
              defaultValue="" // Không tự điền tên
              placeholder="VD: Nguyễn Văn A"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition uppercase" // Added uppercase class for better UX
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Số điện thoại <span className="text-red-500">*</span></label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-orange-500" />
            <input
              name="phone"
              type="tel"
              required
              placeholder="Nhập số điện thoại..."
              defaultValue={user?.user_metadata?.phone_number || ''}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email nhận vé</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              name="email"
              type="email"
              placeholder="VD: name@example.com"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition"
              defaultValue={user?.email || ''}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200"></div>

      {/* THÊM TRƯỜNG GHI CHÚ (ĐIỂM XUỐNG XE) */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
          Điểm xuống xe mong muốn (Note) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            name="notes"
            required
            rows={3}
            placeholder="Ví dụ: Xuống ở ngã tư Hàng Xanh, gần BigC..."
            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1 ml-1">
          * BẮT BUỘC: Tài xế sẽ căn cứ vào đây để trả khách.
        </p>
      </div>

      <div className="border-t border-dashed border-slate-200"></div>

      {/* 2. GHI CHÚ CHỖ NGỒI (SAY XE) */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
          Lưu ý chỗ ngồi (Ai say xe?)
        </label>
        <div className="relative">
          <Armchair className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            name="seatNotes"
            type="text"
            placeholder="VD: Bạn A say xe xin ngồi đầu, người già..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition"
          />
        </div>
      </div>

      {/* 3. NÚT SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full flex items-center justify-center gap-2 
          bg-gradient-to-r from-orange-600 to-red-600 text-white 
          font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-200
          transition-all transform hover:scale-[1.02] active:scale-95
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Ticket className="w-5 h-5" />
            Xác nhận đặt vé
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-slate-400">
        * Bằng việc đặt vé, bạn đồng ý với quy định của nhà xe.
      </p>
    </form>
  );
}