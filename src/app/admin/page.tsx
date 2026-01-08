import { createAdminClient } from '@/utils/supabase/admin';
import Link from 'next/link';
import { DollarSign, Ticket, Users, TrendingUp, Map, ArrowRight, Plus, PieChart, BarChart3 } from 'lucide-react';
import { QrCode } from 'lucide-react';
// Import 2 biểu đồ bạn vừa tạo (Đảm bảo bạn đã tạo file ở bước trước)
import RevenueChart from '@/components/admin/revenue-chart';
import DestinationChart from '@/components/admin/destination-chart';

export default async function AdminDashboard() {
    const supabase = createAdminClient();

    // --- 1. LẤY DỮ LIỆU BOOKINGS KÈM THÔNG TIN CHUYẾN XE ---
    // Chúng ta cần join bảng trips để biết vé đó đi đâu (destination)
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
      amount,
      created_at,
      status,
      trips ( destination )
    `)
        .eq('status', 'PAID'); // Chỉ tính vé đã thanh toán

    // --- 2. TÍNH TOÁN CÁC CHỈ SỐ KPI CƠ BẢN ---
    const totalRevenue = bookings?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalTickets = bookings?.length || 0;

    // Lấy tổng user
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    // Lấy thống kê truy cập
    const { data: stats } = await supabase.from('daily_stats').select('visit_count, date');
    const totalVisits = stats?.reduce((sum, item) => sum + item.visit_count, 0) || 0;

    // Lấy số lượt hôm nay (theo múi giờ server/db - UTC, nên cẩn thận, nhưng demo thì ok)
    // Để đơn giản ta just lấy ngày cuối cùng trong db hoặc filter JS
    const todayStr = new Date().toISOString().split('T')[0];
    const todayVisits = stats?.find(s => s.date === todayStr)?.visit_count || 0;

    // --- 3. XỬ LÝ DỮ LIỆU CHO BIỂU ĐỒ CỘT (DOANH THU 7 NGÀY GẦN NHẤT) ---
    // Tạo mảng 7 ngày gần nhất: ['2025-12-28', '2025-12-27', ...]
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0]; // Format YYYY-MM-DD
    }).reverse();

    // Map qua từng ngày để tính tổng tiền ngày đó
    const revenueData = last7Days.map(date => {
        // Lọc ra các vé được tạo trong ngày 'date'
        const dailyTotal = bookings?.filter(b => b.created_at.startsWith(date))
            .reduce((sum, b) => sum + b.amount, 0) || 0;

        // Trả về object cho Recharts
        return {
            name: date.split('-').slice(1).join('/'), // Chuyển 2024-12-28 thành "12/28" cho ngắn
            total: dailyTotal
        };
    });

    // --- 4. XỬ LÝ DỮ LIỆU CHO BIỂU ĐỒ TRÒN (THỊ PHẦN ĐỊA ĐIỂM) ---
    const destinationStats: Record<string, number> = {};

    bookings?.forEach((b: any) => {
        // Lấy tên địa điểm (nếu booking mất trip thì gọi là 'Khác')
        const dest = b.trips?.destination || 'Khác';
        // Cộng dồn số lượng
        destinationStats[dest] = (destinationStats[dest] || 0) + 1;
    });

    // Chuyển object { 'Nam Định': 5, 'Thái Bình': 2 } thành mảng [{ name: 'Nam Định', value: 5 }, ...]
    const destinationData = Object.keys(destinationStats).map(key => ({
        name: key,
        value: destinationStats[key]
    }));

    // --- 5. LẤY DANH SÁCH CHUYẾN XE (CHO BẢNG QUẢN LÝ) ---
    const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .order('departure_time', { ascending: true });

    return (
        <div className="min-h-screen bg-slate-50 p-4 pt-24 md:p-10 md:pt-32">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Phân tích & Tăng trưởng kinh doanh</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <form action={async () => {
                        'use server';
                        const { syncCassoTransactions } = await import('@/actions/casso');
                        const res = await syncCassoTransactions();
                        // Trong thực tế nên dùng client component + toast, nhưng đây là server component thuần
                        console.log(res);
                    }}>
                        <button className="bg-blue-600 text-white border border-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm w-full md:w-auto text-center flex items-center justify-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Đồng bộ Bank
                        </button>
                    </form>
                    <Link href="/" className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition shadow-sm w-full md:w-auto text-center">
                        Xem trang chủ
                    </Link>
                </div>
            </div>

            {/* --- KHỐI 1: KPIs (CHỈ SỐ CHÍNH) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card Doanh Thu */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tổng Doanh Thu</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalRevenue.toLocaleString()}đ</h3>
                        </div>
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
                        <TrendingUp className="w-3 h-3 mr-1" /> Doanh thu thực nhận
                    </div>
                </div>

                {/* Card Vé Bán Ra */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Vé Đã Bán</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalTickets}</h3>
                        </div>
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <Ticket className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">Đã thanh toán thành công</div>
                </div>

                {/* Card User */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Người dùng</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{userCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">Tài khoản sinh viên</div>
                </div>

                {/* Card Visits (NEW) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Lượt truy cập</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalVisits.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        <span className="text-purple-600 font-bold">+{todayVisits}</span> hôm nay
                    </div>
                </div>
            </div>

            {/* --- KHỐI 2: BIỂU ĐỒ PHÂN TÍCH (VISUALIZATIONS) - PHẦN MỚI --- */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 mb-8">

                {/* CHART 1: DOANH THU (Chiếm 4 phần) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="mb-6">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-orange-500" /> Biểu đồ doanh thu (7 ngày)
                        </h3>
                        <p className="text-sm text-slate-500">Theo dõi dòng tiền vé bán ra</p>
                    </div>
                    {/* Component Chart Cột */}
                    <div className="h-[350px] w-full">
                        <RevenueChart data={revenueData} />
                    </div>
                </div>

                {/* CHART 2: ĐỊA ĐIỂM HOT (Chiếm 3 phần) */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="mb-2">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-500" /> Thị phần tuyến đường
                        </h3>
                        <p className="text-sm text-slate-500">Các điểm đến được đặt nhiều nhất</p>
                    </div>
                    {/* Component Chart Tròn */}
                    <div className="flex-grow flex items-center justify-center min-h-[300px]">
                        {destinationData.length > 0 ? (
                            <DestinationChart data={destinationData} />
                        ) : (
                            <div className="text-center text-slate-400">
                                Chưa có dữ liệu vé để phân tích
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- KHỐI 3: QUẢN LÝ CHUYẾN XE (BẢNG DỮ LIỆU) --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Map className="w-5 h-5 text-slate-500" /> Quản lý Chuyến xe
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Danh sách các chuyến đang mở bán</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Link
                            href="/admin/config"
                            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2 shadow-sm flex-1 md:flex-none justify-center"
                        >
                            <TrendingUp className="w-4 h-4" /> <span className="hidden sm:inline">Nội dung</span>
                        </Link>
                        <Link
                            href="/admin/scan"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition flex items-center gap-2 shadow-lg flex-1 md:flex-none justify-center"
                        >
                            <QrCode className="w-4 h-4" /> Soát vé
                        </Link>
                        <Link
                            href="/admin/trips/new"
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-1 md:flex-none justify-center"
                        >
                            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Thêm chuyến</span><span className="inline sm:hidden">Thêm</span>
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="p-4 pl-6">Điểm đi / Điểm đến</th>
                                <th className="p-4">Thời gian</th>
                                <th className="p-4">Giá vé</th>
                                <th className="p-4 text-right pr-6">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {trips?.map((trip) => (
                                <tr key={trip.id} className="hover:bg-slate-50 transition group">
                                    <td className="p-4 pl-6">
                                        <div className="font-bold text-slate-800 text-base group-hover:text-orange-600 transition">{trip.destination}</div>
                                        <div className="text-slate-500 text-xs mt-1">Từ: {trip.origin}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-700">{new Date(trip.departure_time).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-slate-400 text-xs">{new Date(trip.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{trip.price.toLocaleString()}đ</div>
                                        {/* Không còn total_seats nên có thể bỏ hoặc để trống */}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <Link
                                            href={`/admin/trips/${trip.id}`}
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                        >
                                            Chỉnh sửa <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!trips || trips.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">
                                        Chưa có chuyến xe nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}