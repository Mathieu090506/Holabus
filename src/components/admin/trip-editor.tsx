'use client'

import { useState } from 'react';
import RouteMap from '@/components/trip-map';
import InteractiveMap from './interactive-map';
import { createTrip, updateTrip, deleteTrip, deleteBooking } from '@/actions/admin-trips'; // Import thêm deleteBooking
import { useRouter } from 'next/navigation';
import { Save, Trash2, MapPin, Clock, DollarSign, Users, Ticket, UserX, UserCheck, Armchair } from 'lucide-react';

// Props nhận vào: trip (thông tin chuyến), bookings (danh sách vé đã đặt)
export default function TripEditor({ trip, bookings }: { trip?: any, bookings?: any[] }) {
    const router = useRouter();
    const isEditMode = !!trip; // Có trip truyền vào => Đang ở chế độ Sửa

    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [origin, setOrigin] = useState(trip?.origin || 'ĐH FPT Hòa Lạc');
    const [destination, setDestination] = useState(trip?.destination || '');
    const [waypoints, setWaypoints] = useState(trip?.waypoints || '');
    const [tags, setTags] = useState(trip?.tags || '');
    // const [googleSheetUrl, setGoogleSheetUrl] = useState(trip?.google_sheet_url || ''); // Bỏ Google Sheet
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showFullList, setShowFullList] = useState(false); // 👇 1. State cho bảng tổng hợp

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
                        <div className="space-y-4">
                            {/* Hidden Departure Time - Default to now if not set to pass required check */}
                            <input
                                name="departure_time"
                                type="hidden"
                                defaultValue={trip?.departure_time ? new Date(trip.departure_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                            />

                            <div>
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

                            {/* TRẠNG THÁI MỞ BÁN */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái vé</label>
                                <div className="relative">
                                    <Ticket className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <select
                                        name="tags"
                                        value={tags || 'Mở bán'} // Default fallback
                                        onChange={(e) => setTags(e.target.value)}
                                        className={`w-full pl-10 p-3 border rounded-xl outline-none font-bold transition appearance-none ${(tags === 'Mở bán' || !tags)
                                            ? 'border-green-200 bg-green-50 text-green-700 focus:ring-green-500'
                                            : 'border-red-200 bg-red-50 text-red-700 focus:ring-red-500'
                                            }`}
                                    >
                                        <option value="Mở bán">🟢 Đang Mở Bán</option>
                                        <option value="Dừng mở bán">🔴 Tạm Dừng / Đóng</option>
                                    </select>
                                    <div className="absolute right-3 top-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                    * Chỉ khi chọn "Đang Mở Bán" khách mới có thể đặt vé.
                                </p>
                            </div>
                        </div>
                        {/* SỐ LƯỢNG VÉ (CAPACITY) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng vé (Ghế)</label>
                            <div className="relative">
                                <Armchair className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    name="capacity"
                                    type="number"
                                    defaultValue={trip?.capacity ?? 1000} // Default booking capacity
                                    min="0"
                                    className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700"
                                    placeholder="Nhập số lượng ghế..."
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                * Mẹo: Nhập <b>1000</b> hoặc <b>9999</b> để bán "thả ga" không lo hết vé.
                            </p>
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

                            {/* 2. LỘ TRÌNH VĂN BẢN (Sẽ hiển thị thành Timeline) */}
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <label className="block text-sm font-bold text-orange-800 mb-1 flex items-center gap-2">
                                    📝 Danh sách điểm dừng (Hiển thị cho khách)
                                </label>
                                <p className="text-xs text-orange-600 mb-2">
                                    Nhập danh sách các điểm đón/trả khách, <b>mỗi địa điểm một dòng</b>.
                                    <br />Hệ thống sẽ hiển thị danh sách này dưới dạng Sơ đồ Tuyến đường (Timeline) trên vé.
                                </p>
                                <textarea
                                    name="route_details"
                                    rows={6}
                                    defaultValue={trip?.route_details || ''}
                                    placeholder={'Ví dụ:\nĐón tại ĐH FPT\nNgã tư Hoà Lạc\nBigC Thăng Long\nTrạm thu phí Liêm Tuyền\nTrả tại TP Thái Bình'}
                                    className="w-full border border-orange-200 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm bg-white"
                                ></textarea>
                            </div>

                            {/* 3. WAYPOINTS (Cho Google Maps) */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <label className="block text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                                    📍 Lộ trình thực tế (Google Map)
                                </label>
                                <p className="text-xs text-blue-600 mb-2">
                                    Nhập danh sách các điểm đi qua <b>bao gồm cả điểm cuối</b>, ngăn cách bằng dấu chấm phẩy (<b>;</b>) để vẽ đường trên bản đồ.
                                </p>
                                <input
                                    name="waypoints"
                                    type="text"
                                    value={waypoints}
                                    onChange={(e) => setWaypoints(e.target.value)}
                                    placeholder="VD: BigC Thăng Long; Phủ Lý; Nam Định (Điểm cuối)"
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
            </div >

            {/* --- CỘT PHẢI: MAP & DANH SÁCH VÉ --- */}
            <div className="space-y-6">

                {/* 1. MAP PREVIEW (UPDATED: INTERACTIVE) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Xem bản đồ & Chỉnh chuyến</h3>
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold animate-pulse">Interactive Mode</span>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner h-[400px] relative">
                        {/* Fallback component loading... is handled inside InteractiveMap */}
                        <InteractiveMap
                            origin={origin}
                            destination={""} // 👈 Force EMPTY to completely decouple 'Destination' Input from Map
                            waypointsInput={waypoints}
                            onWaypointsChanged={(newVal: string) => setWaypoints(newVal)}
                            ignoreDestinationForRoute={true}
                        />
                    </div>

                    <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-800 space-y-1">
                        <p>💡 <b>Mẹo:</b> Bạn có thể <b>kéo thả đường màu xanh</b> trên bản đồ để thay đổi lộ trình.</p>
                        <p>Các điểm đi qua mới sẽ tự động được thêm vào ô "Lộ trình thực tế" (dưới dạng toạ độ).</p>
                    </div>
                </div>

                {/* 2. DANH SÁCH HÀNH KHÁCH (MỚI THÊM VÀO) */}
                {
                    isEditMode && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-slate-500" />
                                    Danh sách khách ({bookings?.length || 0})
                                </h3>
                                {/* Nút vào Google Sheet */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowFullList(true)}
                                        className="text-xs bg-blue-600 text-white border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-bold shadow-sm flex items-center gap-1.5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        Xem bảng tổng
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!bookings || bookings.length === 0) {
                                                alert("Chưa có khách nào để copy!");
                                                return;
                                            }

                                            // 1. Tạo header
                                            const headers = ['Mã Vé', 'Họ Tên', 'Email', 'SĐT', 'Khách Trả', 'Trạng Thái', 'Thời Gian Check-in', 'Ngày Đặt'];

                                            // 2. Map dữ liệu
                                            const rows = bookings.map(b => [
                                                b.payment_code,
                                                b.full_name || 'Khách vãng lai',
                                                b.email || '',
                                                "'" + (b.phone_number || ''), // Thêm dấu ' để Excel không tự format số 0
                                                (b.amount || 0).toLocaleString('vi-VN') + 'đ',
                                                b.status === 'PAID' ? 'Đã thanh toán' : b.status,
                                                b.check_in_at ? new Date(b.check_in_at).toLocaleString('vi-VN') : 'Chưa lên xe',
                                                new Date(b.created_at).toLocaleString('vi-VN')
                                            ]);

                                            // 3. Nối thành chuỗi TSV (Tab Separated Values) - chuẩn nhất để paste vào Sheet/Excel
                                            const tsvContent = [
                                                headers.join('\t'),
                                                ...rows.map(r => r.join('\t'))
                                            ].join('\n');

                                            // 4. Copy
                                            navigator.clipboard.writeText(tsvContent)
                                                .then(() => alert("✅ Đã copy danh sách! \nBạn hãy mở Google Sheet và bấm Ctrl + V để dán."))
                                                .catch(() => alert("❌ Lỗi khi copy."));
                                        }}
                                        className="text-xs bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition font-bold shadow-sm flex items-center gap-1.5"
                                        title="Copy danh sách để dán vào Excel/Sheet"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                        Copy danh sách
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                                {bookings && bookings.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white text-slate-500 sticky top-0 shadow-sm z-10">
                                            <tr>
                                                <th className="p-3 font-medium">Họ tên / SĐT</th>
                                                <th className="p-3 font-medium">Mã vé / TT</th>
                                                <th className="p-3 text-center">Chi tiết</th>
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

                                                    {/* CỘT 3: CHI TIẾT */}
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => setSelectedBooking(bk)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                                            title="Xem chi tiết"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </button>
                                                    </td>

                                                    {/* CỘT 4: HÀNH ĐỘNG */}
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
                    )
                }
            </div >

            {/* --- MODAL CHI TIẾT BOOKING --- */}
            {
                selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            {/* Header Modal */}
                            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-orange-400" />
                                    Chi tiết vé: {selectedBooking.payment_code}
                                </h3>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Body Modal */}
                            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                {/* Thông tin khách */}
                                <div className="flex gap-4 items-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                                        {selectedBooking.full_name?.charAt(0) || 'K'}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-slate-800">{selectedBooking.full_name}</div>
                                        <div className="text-slate-500 text-sm flex items-center gap-1">
                                            📧 {selectedBooking.email || 'Không có email'}
                                        </div>
                                        <div className="text-slate-500 text-sm flex items-center gap-1">
                                            📞 {selectedBooking.phone_number}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="block text-slate-500 text-xs mb-1">Mã sinh viên</span>
                                        <span className="font-bold text-slate-800">{selectedBooking.student_id || '---'}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="block text-slate-500 text-xs mb-1">Ghế mong muốn</span>
                                        <span className="font-bold text-slate-800">{selectedBooking.seat_preference || 'Ngẫu nhiên'}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="block text-slate-500 text-xs mb-1">Số tiền</span>
                                        <span className="font-bold text-green-600 text-lg">{(selectedBooking.amount || 0).toLocaleString()}đ</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="block text-slate-500 text-xs mb-1">Trạng thái</span>
                                        <span className={`font-bold ${selectedBooking.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {selectedBooking.status === 'PAID' ? 'ĐÃ THANH TOÁN' : selectedBooking.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                    <span className="block text-yellow-800 text-xs font-bold mb-1 uppercase">Ghi chú của khách</span>
                                    <p className="text-slate-700 text-sm italic">
                                        "{selectedBooking.more || selectedBooking.notes || 'Không có ghi chú nào.'}"
                                    </p>
                                </div>

                                {/* Timeline */}
                                <div className="border-t border-slate-100 pt-4 mt-4">
                                    <h4 className="text-sm font-bold text-slate-800 mb-3">Lịch sử</h4>
                                    <div className="space-y-3 relative pl-4 border-l-2 border-slate-100">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-300 rounded-full border-2 border-white box-content"></div>
                                            <p className="text-xs text-slate-500">{new Date(selectedBooking.created_at).toLocaleString('vi-VN')}</p>
                                            <p className="text-sm font-medium text-slate-800">Đặt vé thành công</p>
                                        </div>
                                        {selectedBooking.check_in_at && (
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white box-content"></div>
                                                <p className="text-xs text-slate-500">{new Date(selectedBooking.check_in_at).toLocaleString('vi-VN')}</p>
                                                <p className="text-sm font-bold text-blue-700">Đã lên xe (Check-in)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Modal */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="px-5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- MODAL BẢNG TỔNG HỢP FULL MÀN HÌNH --- */}
            {
                showFullList && (
                    <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col">
                        {/* Header Full Modal */}
                        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-blue-600" />
                                    Danh sách chi tiết ({bookings?.length || 0} khách)
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Chuyến: {origin} - {destination} | {trip?.departure_time ? new Date(trip.departure_time).toLocaleString('vi-VN') : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFullList(false)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Đóng lại
                            </button>
                        </div>

                        {/* Table Container */}
                        <div className="flex-1 overflow-auto p-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-w-[1200px]">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs sticky top-0 shadow-sm border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 w-10 text-center">#</th>
                                            <th className="p-4">Mã Vé</th>
                                            <th className="p-4">Họ Tên</th>
                                            <th className="p-4">SĐT</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">MSSV</th>
                                            <th className="p-4 text-center">Ghế</th>
                                            <th className="p-4 text-right">Số tiền</th>
                                            <th className="p-4 text-center">Trạng thái</th>
                                            <th className="p-4 text-center">Check-in</th>
                                            <th className="p-4">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {bookings?.map((bk, index) => (
                                            <tr key={bk.id} className="hover:bg-blue-50 transition-colors">
                                                <td className="p-4 text-center text-slate-400 font-mono">{index + 1}</td>
                                                <td className="p-4 font-mono font-bold text-blue-600">{bk.payment_code}</td>
                                                <td className="p-4 font-bold text-slate-800">{bk.full_name || '---'}</td>
                                                <td className="p-4 text-slate-600">{bk.phone_number}</td>
                                                <td className="p-4 text-slate-500 max-w-[200px] truncate" title={bk.email}>{bk.email || '-'}</td>
                                                <td className="p-4 text-slate-600 font-mono">{bk.student_id || '-'}</td>
                                                <td className="p-4 text-center font-bold text-slate-700 bg-slate-50 rounded">{bk.seat_preference || 'N/A'}</td>
                                                <td className="p-4 text-right font-bold text-green-600">{(bk.amount || 0).toLocaleString()}đ</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${bk.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {bk.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {bk.check_in_at ? (
                                                        <span className="text-green-600 font-bold text-xs">✔ {new Date(bk.check_in_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-slate-500 italic whitespace-normal break-words min-w-[250px]">
                                                    {bk.more || bk.notes || ''}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}