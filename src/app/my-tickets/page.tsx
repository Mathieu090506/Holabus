import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Bus, QrCode, AlertCircle, CheckCircle } from 'lucide-react';

export default async function MyTicketsPage() {
  // 1. Lấy thông tin User đang đăng nhập
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Nếu chưa đăng nhập -> Đá về trang chủ (hoặc trang login)
  if (!user) {
    redirect('/');
  }

  // Định nghĩa Interface cho dữ liệu (Fix lỗi TS: Property ... does not exist on type 'never')
  interface Trip {
    origin: string;
    destination: string;
    departure_time: string;
    price: number;
    // Các trường khác nếu cần
  }

  interface Booking {
    id: string;
    created_at: string;
    payment_code: string;
    status: string;
    amount: number;
    user_id: string;
    trip_id: number;
    trips: Trip | null; // Join có thể trả về null hoặc object
  }

  // 2. Query lấy danh sách vé của User này
  // Join với bảng trips để lấy thông tin điểm đi/đến
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trips (
        origin,
        destination,
        departure_time,
        price
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }); // Vé mới nhất lên đầu

  // Cast kiểu dữ liệu tường minh
  const bookings = data as unknown as Booking[];

  // Hàm render Badge trạng thái
  const renderStatus = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            <CheckCircle className="w-3 h-3" /> Đã thanh toán
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            <Clock className="w-3 h-3" /> Chờ thanh toán
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            <AlertCircle className="w-3 h-3" /> Đã hủy
          </span>
        );
      default:
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 pt-32">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Vé của tôi 🎟️</h1>
          <Link href="/" className="text-orange-600 font-semibold hover:underline text-sm">
            + Đặt vé mới
          </Link>
        </div>

        {/* TRƯỜNG HỢP KHÔNG CÓ VÉ */}
        {(!bookings || bookings.length === 0) && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Bạn chưa đặt vé nào</h3>
            <p className="text-gray-500 mt-1 mb-6">Hãy chọn cho mình một chuyến xe về quê ăn Tết ngay nhé!</p>
            <Link href="/" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition">
              Tìm chuyến xe
            </Link>
          </div>
        )}

        {/* DANH SÁCH VÉ */}
        <div className="space-y-4">
          {bookings?.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header của thẻ vé */}
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500 font-mono">
                  MÃ: <span className="font-bold text-gray-800">{ticket.payment_code}</span>
                </div>
                {renderStatus(ticket.status)}
              </div>

              {/* Nội dung vé */}
              <div className="p-5">
                <div className="flex flex-col md:flex-row gap-6 justify-between">

                  {/* Thông tin chuyến đi */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Bus className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {ticket.trips?.origin} <span className="text-gray-400 mx-1">➝</span> {ticket.trips?.destination}
                        </h3>
                        <p className="text-sm text-gray-500">Xe Chất lượng cao 45 chỗ</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(ticket.trips?.departure_time || new Date()).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(ticket.trips?.departure_time || new Date()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Giá tiền & Hành động */}
                  <div className="flex flex-row md:flex-col justify-between items-end border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Tổng tiền</p>
                      <p className="text-xl font-bold text-orange-600">{ticket.amount.toLocaleString()}đ</p>
                    </div>

                    {/* Nút hành động dựa theo trạng thái */}
                    {ticket.status === 'PENDING' && (
                      <Link
                        href={`/payment/${ticket.id}`}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition"
                      >
                        <QrCode className="w-4 h-4" /> Thanh toán ngay
                      </Link>
                    )}

                    {/* Nếu PAID thì có thể hiện nút xem chi tiết (Sau này làm) */}
                    {ticket.status === 'PAID' && (
                      <Link
                        href={`/ticket/${ticket.payment_code}`}
                        className="mt-2 inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-bold hover:underline"
                      >
                        Xem chi tiết vé →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}