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

  // Nếu chưa đăng nhập
  if (!user) {
    return (
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
        <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700 mb-2">Đăng nhập để đặt vé</h3>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Xử lý khi bấm nút Đặt vé
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // 👇 1. LẤY THÊM BIẾN NÀY
    const fullName = formData.get('fullName') as string; 
    
    const phoneNumber = formData.get('phone') as string;
    const studentId = formData.get('studentId') as string;
    const notes = formData.get('notes') as string;

    // 👇 2. THÊM VALIDATE TÊN
    if (!fullName || fullName.trim().length < 2) {
        toast.error("Vui lòng nhập họ tên đầy đủ");
        setLoading(false);
        return;
    }

    if (!phoneNumber || phoneNumber.length < 9) {
        toast.error("Số điện thoại không hợp lệ");
        setLoading(false);
        return;
    }

    try {
      console.log("🚀 Đang gửi yêu cầu đặt vé...");
      
      const result = await bookTicket(
        tripId, 
        seatType, 
        { 
          fullName: fullName, // 👈 3. TRUYỀN TÊN MỚI VÀO ĐÂY
          phone: phoneNumber, 
          studentId: studentId, 
          notes: notes 
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
              defaultValue={user.user_metadata.full_name || user.email} 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition"
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
                defaultValue={user.user_metadata.phone_number || ''}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition"
            />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Mã Sinh Viên (Nếu có)</label>
            <div className="relative">
            <BookOpen className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
                name="studentId"
                type="text" 
                placeholder="VD: HE15xxxx"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition"
            />
            </div>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-200"></div>

      {/* 2. CHỌN VỊ TRÍ GHẾ (ĐÃ KHÔI PHỤC) */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
            Chọn vị trí ghế mong muốn
        </label>
        <div className="grid grid-cols-3 gap-2">
            {/* Option 1: Say xe */}
            <button
                type="button"
                onClick={() => setSeatType('front')}
                className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    seatType === 'front' 
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' 
                    : 'border-slate-200 bg-white text-slate-500 hover:border-orange-300'
                }`}
            >
                <Armchair className="w-5 h-5" />
                <span className="text-[10px] font-bold">Say xe</span>
                <span className="text-[9px] font-normal opacity-70">(Ngồi đầu)</span>
                {seatType === 'front' && <CheckCircle2 className="w-4 h-4 text-orange-600 absolute top-1 right-1" />}
            </button>

            {/* Option 2: Cửa sổ */}
            <button
                type="button"
                onClick={() => setSeatType('window')}
                className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    seatType === 'window' 
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' 
                    : 'border-slate-200 bg-white text-slate-500 hover:border-orange-300'
                }`}
            >
                <div className="border-2 border-current w-4 h-4 rounded-sm"></div>
                <span className="text-[10px] font-bold">Cửa sổ</span>
                <span className="text-[9px] font-normal opacity-70">(Ngắm cảnh)</span>
                {seatType === 'window' && <CheckCircle2 className="w-4 h-4 text-orange-600 absolute top-1 right-1" />}
            </button>

            {/* Option 3: Ngẫu nhiên */}
            <button
                type="button"
                onClick={() => setSeatType('random')}
                className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    seatType === 'random' 
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' 
                    : 'border-slate-200 bg-white text-slate-500 hover:border-orange-300'
                }`}
            >
                <Ticket className="w-5 h-5" />
                <span className="text-[10px] font-bold">Ngẫu nhiên</span>
                <span className="text-[9px] font-normal opacity-70">(Tùy ý)</span>
                {seatType === 'random' && <CheckCircle2 className="w-4 h-4 text-orange-600 absolute top-1 right-1" />}
            </button>
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