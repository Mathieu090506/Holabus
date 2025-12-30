'use client'

import { useState } from 'react';
import RouteMap from '@/components/trip-map';
import { createTrip, updateTrip, deleteTrip, deleteBooking } from '@/actions/admin-trips'; // Import thêm deleteBooking
import { useRouter } from 'next/navigation';
import { Save, Trash2, MapPin, Clock, DollarSign, Users, Ticket, UserX, UserCheck } from 'lucide-react';

// Props nhận vào: trip (thông tin chuyến), bookings (danh sách vé đã đặt)
export default function TripEditor({ trip, bookings }: { trip?: any, bookings?: any[] }) {
    const router = useRouter();
    const isEditMode = !!trip; // Có trip truyền vào => Đang ở chế độ Sửa

    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [origin, setOrigin] = useState(trip?.origin || 'ĐH FPT Hòa Lạc');
    const [destination, setDestination] = useState(trip?.destination || '');
    const [waypoints, setWaypoints] = useState(trip?.waypoints || '');
    const [loading, setLoading] = useState(false);

    // 👇 1. THÊM ĐOẠN NÀY (Để xử lý ảnh)
    const [previewUrl, setPreviewUrl] = useState<string>(trip?.image_url || '');
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- HÀM XỬ LÝ SUBMIT (TẠO / SỬA CHUYẾN XE) ---
    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        let result;

        try {
            if (isEditMode) {
                result = await updateTrip(trip.id, formData);
            } else {
                result = await createTrip(formData);
            }

            if (result?.error) {
                alert(`❌ Thất bại: ${result.error}`);
            } else {
                alert(isEditMode ? '✅ Cập nhật thành công!' : '✅ Tạo mới thành công!');
                router.push('/admin');
                router.refresh();
            }
        } catch (error) {
            alert('❌ Có lỗi hệ thống xảy ra.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM XỬ LÝ XÓA CHUYẾN XE ---
    const handleDelete = async () => {
        if (!confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa chuyến xe này không? Hành động này sẽ xóa luôn tất cả lịch sử đặt vé của chuyến.')) return;

        setLoading(true);
        try {
            const result = await deleteTrip(trip.id);

            if (result?.error) {
                alert(`❌ Không xóa được: ${result.error}`);
            } else {
                alert('🗑️ Đã xóa chuyến xe!');
                router.push('/admin');
                router.refresh();
            }
        } catch (error) {
            alert('❌ Lỗi khi xóa.');
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM XỬ LÝ XÓA VÉ (HỦY VÉ KHÁCH) ---
    const handleDeleteBooking = async (bookingId: string) => {
        if (!confirm('Vé này sẽ bị hủy vĩnh viễn khỏi hệ thống. Bạn có chắc không?')) return;

        // Không bật loading toàn trang để tránh đơ form, xử lý ngầm
        try {
            const result = await deleteBooking(bookingId);
            if (result?.error) {
                alert('❌ Lỗi xóa vé: ' + result.error);
            } else {
                router.refresh(); // F5 lại dữ liệu để cập nhật danh sách
            }
        } catch (e) {
            alert('Lỗi hệ thống khi xóa vé');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* --- CỘT TRÁI: FORM NHẬP LIỆU --- */}
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {isEditMode ? '✏️ Chỉnh sửa chuyến xe' : '➕ Tạo chuyến xe mới'}
                        </h2>
                        {/* Nút xóa chuyến xe */}
                        {isEditMode && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Xóa chuyến này"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <form action={handleSubmit} className="space-y-5">
                        {/* 1. ĐỊA ĐIỂM */}
                        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Điểm xuất phát</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                                    <input
                                        name="origin"
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                                        placeholder="VD: ĐH FPT Hòa Lạc"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Điểm kết thúc</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-red-500" />
                                    <input
                                        name="destination"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                                        placeholder="VD: Nam Định (BigC)"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. THỜI GIAN, GIÁ & SỐ VÉ */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Giờ khởi hành</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        name="departure_time"
                                        type="datetime-local"
                                        defaultValue={trip?.departure_time ? new Date(trip.departure_time).toISOString().slice(0, 16) : ''}
                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Giá vé (VNĐ)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        name="price"
                                        type="number"
                                        defaultValue={trip?.price || 50000}
                                        step="1000"
                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-orange-600"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Số vé giới hạn</label>
                                <div className="relative">
                                    <Ticket className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        name="capacity"
                                        type="number"
                                        defaultValue={trip?.capacity || 40}
                                        min="1"
                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Thông tin mở rộng</h3>

                            {/* 1. ẢNH BÌA (ĐÃ SỬA: Upload File thay vì nhập Link) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh bìa chuyến xe</label>

                                {/* Input ẩn để giữ link ảnh cũ nếu không chọn ảnh mới */}
                                {trip && <input type="hidden" name="old_image_url" value={trip.image_url} />}

                                <div className="flex items-start gap-4 p-3 bg-white border border-slate-300 rounded-xl">
                                    {/* Khu vực xem trước ảnh */}
                                    <div className="w-24 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
                                        )}
                                    </div>

                                    {/* Nút chọn file */}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-slate-500
                                    file:mr-3 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-xs file:font-bold
                                    file:bg-orange-50 file:text-orange-700
                                    hover:file:bg-orange-100 file:cursor-pointer
                                    cursor-pointer"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                            Hỗ trợ: JPG, PNG. Dung lượng tối đa 5MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. LỘ TRÌNH VĂN BẢN (Route Details) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lộ trình chi tiết (Văn bản)</label>
                                <textarea
                                    name="route_details"
                                    rows={3}
                                    defaultValue={trip?.route_details || ''}
                                    placeholder="VD: Đón tại FPT -> Đại Lộ Thăng Long -> Vành Đai 3 -> Cao Tốc -> Trả tại BigC Nam Định..."
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                                ></textarea>
                            </div>

                            {/* 3. WAYPOINTS (Cho Google Maps) */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <label className="block text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                                    📍 Điểm trung gian (Google Map)
                                </label>
                                <p className="text-xs text-blue-600 mb-2">
                                    Nhập các điểm xe đi qua, cách nhau bằng dấu chấm phẩy (<b>;</b>) để bản đồ vẽ đường chính xác.
                                </p>
                                <input
                                    name="waypoints"
                                    type="text"
                                    value={waypoints}
                                    onChange={(e) => setWaypoints(e.target.value)}
                                    placeholder="VD: BigC Thăng Long; Bến xe Nước Ngầm; Phủ Lý"
                                    className="w-full border border-blue-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                                />
                            </div>
                        </div>

                        {/* NÚT SUBMIT */}
                        <div className="pt-4">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? 'Đang xử lý...' : (
                                    <>
                                        <Save className="w-5 h-5" /> {isEditMode ? 'Lưu thay đổi' : 'Tạo chuyến xe ngay'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- CỘT PHẢI: MAP & DANH SÁCH VÉ --- */}
            <div className="space-y-6">

                {/* 1. MAP PREVIEW (GIỮ NGUYÊN) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Xem trước lộ trình</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold animate-pulse">Live Preview</span>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner min-h-[250px]">
                        <RouteMap origin={origin} destination={destination} waypoints={waypoints} />
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-100 p-3 rounded-xl text-xs text-yellow-800">
                        <p>💡 Thay đổi địa điểm bên trái, bản đồ sẽ tự cập nhật.</p>
                    </div>
                </div>

                {/* 2. DANH SÁCH HÀNH KHÁCH (MỚI THÊM VÀO) */}
                {isEditMode && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-500" />
                                Danh sách khách ({bookings?.length || 0})
                            </h3>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {bookings && bookings.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-slate-500 sticky top-0 shadow-sm z-10">
                                        <tr>
                                            <th className="p-3 font-medium">Họ tên / SĐT</th>
                                            <th className="p-3 font-medium">Mã vé / TT</th>
                                            <th className="p-3 text-right">Hủy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {bookings.map((bk) => (
                                            <tr key={bk.id} className="hover:bg-slate-50 group transition-colors">

                                                {/* CỘT 1: THÔNG TIN KHÁCH */}
                                                <td className="p-3">
                                                    <div className="font-bold text-slate-800">{bk.full_name || 'Khách vãng lai'}</div>
                                                    <div className="text-slate-500 text-xs">{bk.phone_number}</div>
                                                </td>

                                                {/* CỘT 2: TRẠNG THÁI & CHECK-IN (SỬA Ở ĐÂY) */}
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        {/* Mã vé */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-slate-600">{bk.payment_code}</span>

                                                            {/* --- LOGIC HIỂN THỊ CHECK-IN --- */}
                                                            {bk.check_in_at ? (
                                                                <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 shadow-sm">
                                                                    <UserCheck className="w-3 h-3" /> ĐÃ LÊN XE
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400 font-medium italic">
                                                                    Chưa lên xe
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Trạng thái thanh toán */}
                                                        <div>
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${bk.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {bk.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* CỘT 3: HÀNH ĐỘNG */}
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteBooking(bk.id)}
                                                        className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Hủy vé này"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                    <Ticket className="w-8 h-8 mb-2 opacity-50" />
                                    <p>Chưa có ai đặt vé chuyến này</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}