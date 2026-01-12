'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Loader2, AlertCircle, CheckCircle, User as UserIcon, Mail } from 'lucide-react';
import { createBooking } from '@/actions/booking'; // Import Server Action xử lý logic backend
import { useRouter } from 'next/navigation';

// Lấy kiểu dữ liệu Trip từ Database để đảm bảo type-safe
type Trip = Database['public']['Tables']['trips']['Row'];

export default function BookingForm({ trip, user }: { trip: Trip; user: User | null }) {
  // --- STATE QUẢN LÝ TRẠNG THÁI ---
  const [loading, setLoading] = useState(false); // Trạng thái đang gửi dữ liệu
  const [error, setError] = useState('');        // Chứa thông báo lỗi
  const [successId, setSuccessId] = useState<string | null>(null); // Lưu ID đơn hàng nếu thành công

  // State lưu dữ liệu người dùng nhập
  const [formData, setFormData] = useState({
    studentId: '',
    phone: '',
    preference: 'random', // Mặc định chọn ngẫu nhiên
  });

  const router = useRouter();

  // Honeypot state (for anti-spam)
  const [honeypot, setHoneypot] = useState('');

  // --- HÀM XỬ LÝ SỰ KIỆN ---

  // 1. Khi người dùng gõ phím
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Nếu đang có lỗi thì xóa đi để user nhập lại
    if (error) setError('');
  };

  // 2. Khi người dùng bấm nút "Xác nhận"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // A. VALIDATE FRONTEND (Kiểm tra nhanh)
    if (!formData.studentId.trim() || !formData.phone.trim()) {
      setError('Vui lòng điền đầy đủ Mã sinh viên và Số điện thoại.');
      setLoading(false);
      return;
    }

    // Regex kiểm tra số điện thoại Việt Nam (10 số, đầu 03, 05, 07, 08, 09)
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không đúng định dạng (cần 10 số).');
      setLoading(false);
      return;
    }

    // B. CHUẨN BỊ DỮ LIỆU GỬI VỀ SERVER
    const payload = new FormData();
    payload.append('tripId', trip.id);
    payload.append('price', trip.price.toString());
    payload.append('studentId', formData.studentId.toUpperCase().trim()); // Tự động viết hoa MSSV
    payload.append('phone', formData.phone.trim());
    payload.append('preference', formData.preference);
    payload.append('website_url', honeypot); // Honeypot trap

    // C. GỌI SERVER ACTION
    try {
      const result = await createBooking(null, payload);

      if (result.success && result.bookingId) {
        setSuccessId(result.bookingId);

        // --- THÊM DÒNG NÀY ĐỂ CHUYỂN TRANG ---
        // Chuyển hướng sang trang thanh toán QR
        router.push(`/payment/${result.bookingId}`);

      } else {
        // Giữ nguyên đoạn xử lý lỗi
        setError(result.message || 'Đặt vé thất bại, vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERING (GIAO DIỆN) ---

  // TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP
  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 flex items-center gap-3 animate-fade-in">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">
          Vui lòng <b>Đăng nhập bằng Google</b> (góc trên bên phải) để hệ thống tự động điền thông tin của bạn.
        </p>
      </div>
    );
  }

  // TRƯỜNG HỢP 2: ĐẶT VÉ THÀNH CÔNG
  if (successId) {
    return (
      <div className="bg-green-50 border border-green-200 p-8 rounded-xl text-center animate-fade-in shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">ĐẶT CHỖ THÀNH CÔNG!</h3>
        <p className="text-gray-600 mb-6">
          Mã đơn hàng của bạn là: <br />
          <b className="text-2xl text-black tracking-wider">{successId.split('-')[0]}...</b> {/* Hiển thị 1 phần ID cho gọn */}
        </p>

        <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-left mb-6">
          <p>✅ Hệ thống đã giữ ghế cho bạn trong <b>10 phút</b>.</p>
          <p>✅ Vui lòng chuẩn bị thanh toán để hoàn tất vé.</p>
        </div>

        {/* Nút giả lập chuyển trang (Sẽ thay bằng Redirect thật ở Phase 3) */}
        <button
          onClick={() => window.location.reload()}
          className="text-orange-600 font-medium hover:underline text-sm"
        >
          ← Đặt thêm vé khác (Test Mode)
        </button>
      </div>
    )
  }

  // TRƯỜNG HỢP 3: FORM NHẬP LIỆU (MẶC ĐỊNH)
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-4 relative overflow-hidden">
      {/* Loading Overlay khi đang submit */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-2" />
          <span className="text-orange-600 font-medium text-sm">Đang xử lý đặt chỗ...</span>
        </div>
      )}

      {/* HONEYPOT FIELD (Anti-Spam) */}
      <input
        type="text"
        name="website_url"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}
        tabIndex={-1}
        autoComplete="off"
      />

      <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Thông tin hành khách</h3>

      {/* Thông tin lấy từ Google (Read-only) */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 text-blue-900 font-medium mb-1">
          <UserIcon className="w-4 h-4" />
          {user.user_metadata.full_name}
        </div>
        <div className="flex items-center gap-2 text-blue-700 text-sm">
          <Mail className="w-4 h-4" />
          {user.email}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Input MSSV */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mã sinh viên <span className="text-red-500">*</span>
          </label>
          <input
            name="studentId"
            type="text"
            placeholder="VD: HE15xxxx"
            value={formData.studentId}
            onChange={handleChange}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none uppercase focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Input SĐT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Số điện thoại (Zalo) <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="09xxxxxxxx"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Lựa chọn Nguyện vọng */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Nguyện vọng chỗ ngồi</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { val: 'random', label: '🎲 Ngẫu nhiên' },
            { val: 'window', label: '🪟 Cạnh cửa sổ' },
            { val: 'sick', label: '🤢 Say xe (Ghế đầu)' }
          ].map((opt) => (
            <label
              key={opt.val}
              className={`
                        cursor-pointer border p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all relative
                        ${formData.preference === opt.val
                  ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                  : 'hover:bg-gray-50 text-gray-600 border-gray-200'}
                    `}
            >
              <input
                type="radio"
                name="preference"
                value={opt.val}
                checked={formData.preference === opt.val}
                onChange={handleChange}
                className="sr-only" // Ẩn radio mặc định
              />
              {opt.label}
              {formData.preference === opt.val && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center italic">
          * BTC sẽ cố gắng sắp xếp theo nguyện vọng tốt nhất có thể.
        </p>
      </div>

      {/* Khu vực hiển thị lỗi */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-3 animate-pulse border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Nút Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-[0.99] flex items-center justify-center gap-2 text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" /> Đang xử lý...
          </>
        ) : (
          <>
            XÁC NHẬN ĐẶT VÉ ({trip.price.toLocaleString()}đ)
          </>
        )}
      </button>
    </form>
  );
}