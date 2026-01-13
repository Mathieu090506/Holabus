'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Download, MapPin, Calendar, User, Phone, Mail, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Booking {
    id: string;
    created_at: string;
    status: string;
    amount: number;
    seat_number?: string;
    more?: string; // Correct column for notes
    full_name?: string; // Correct column for name
    phone_number?: string; // Correct column for phone
    student_id?: string;
    trips: {
        origin: string;
        destination: string;
        departure_time: string;
    };
    profiles?: {
        full_name: string;
        phone: string;
        email: string;
        student_id: string;
    };
}

export default function AllCustomersClient({ initialBookings }: { initialBookings: Booking[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);

    // Filter logic
    const filteredBookings = bookings.filter(b => {
        const term = searchTerm.toLowerCase();

        // Helper to safely get string
        const getStr = (s?: string) => (s || '').toLowerCase();

        // Check Profile info
        const profileName = getStr(b.profiles?.full_name);
        const profilePhone = getStr(b.profiles?.phone);
        const profileEmail = getStr(b.profiles?.email);
        const profileStudentId = getStr(b.profiles?.student_id); // Renamed to avoid conflict

        // Check Direct info (Prioritize these as they are snapshot of booking)
        const custName = getStr(b.full_name);
        const custPhone = getStr(b.phone_number);
        const custStudentId = getStr(b.student_id);

        // Check Trip info
        const dest = getStr(b.trips?.destination);
        const origin = getStr(b.trips?.origin);

        return profileName.includes(term) ||
            profilePhone.includes(term) ||
            profileEmail.includes(term) ||
            profileStudentId.includes(term) ||
            custName.includes(term) ||
            custPhone.includes(term) ||
            custStudentId.includes(term) ||
            dest.includes(term) ||
            origin.includes(term);
    });

    // Export to Excel
    const handleExportExcel = () => {
        const dataToExport = filteredBookings.map((b, index) => {
            const date = new Date(b.trips.departure_time);
            const dateStr = date.toLocaleDateString('vi-VN');
            const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            // Prioritize direct booking info, fallback to profile
            const displayName = b.full_name || b.profiles?.full_name || 'N/A';
            const displayPhone = b.phone_number || b.profiles?.phone || '';
            const displayStudentId = b.student_id || b.profiles?.student_id || '';
            const displayNotes = b.more || '';

            return {
                'STT': index + 1,
                'Mã Vé': b.id.slice(0, 8).toUpperCase(),
                'Họ Tên': displayName,
                'SĐT': displayPhone,
                'Email': b.profiles?.email || '',
                'MSSV': displayStudentId,
                'Chuyến Xe': `${b.trips.origin} - ${b.trips.destination}`,
                'Ngày Đi': dateStr,
                'Giờ Đi': timeStr,
                'Ghế': b.seat_number || 'Tự chọn',
                'Số Tiền': b.amount,
                'Trạng Thái': b.status,
                'Ghi Chú': displayNotes,
                'Ngày Đặt': new Date(b.created_at).toLocaleDateString('vi-VN')
            };
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Auto-width columns (basic)
        const wscols = [
            { wch: 5 },  // STT
            { wch: 10 }, // Ma Ve
            { wch: 20 }, // Ho Ten
            { wch: 12 }, // SDT
            { wch: 25 }, // Email
            { wch: 12 }, // MSSV
            { wch: 30 }, // Chuyen Xe
            { wch: 12 }, // Ngay DI
            { wch: 8 },  // Gio
            { wch: 10 }, // Ghe
            { wch: 12 }, // Tien
            { wch: 10 }, // Status
            { wch: 30 }, // Notes
            { wch: 12 }, // Ngay Dat
        ];
        worksheet['!cols'] = wscols;

        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachKhachHang");
        XLSX.writeFile(workbook, "Danh_Sach_Khach_Hang_HolaBus.xlsx");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 pt-24 md:p-10 md:pt-32 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm text-slate-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Danh sách Khách hàng</h1>
                        <p className="text-slate-500 mt-1">Tổng hợp toàn bộ vé đã bán ({filteredBookings.length} khách)</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên, sđt, chuyến..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleExportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">#</th>
                                <th className="p-4">Khách hàng</th>
                                <th className="p-4">Liên hệ</th>
                                <th className="p-4">Chuyến xe</th>
                                <th className="p-4">Ghế</th>
                                <th className="p-4 text-right">Giá vé</th>
                                <th className="p-4">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((bk, idx) => {
                                    // Determine display name/phone
                                    // Use Full Name from Booking first (User input at booking time), else Profile
                                    const name = bk.full_name || bk.profiles?.full_name || 'Khách vãng lai';
                                    const phone = bk.phone_number || bk.profiles?.phone || '-';
                                    const email = bk.profiles?.email || '-';
                                    const studentId = bk.student_id || bk.profiles?.student_id;
                                    const notes = bk.more || '';

                                    return (
                                        <tr key={bk.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4 pl-6 font-medium text-slate-400">{idx + 1}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" /> {name}
                                                </div>
                                                {studentId && (
                                                    <div className="text-xs text-slate-500 ml-6 flex items-center gap-1">
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{studentId}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 space-y-1">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                    <Mail className="w-3 h-3 text-slate-400" /> {email.length > 20 ? email.substring(0, 18) + '...' : email}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-orange-500" />
                                                    {bk.trips.destination}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(bk.trips.departure_time).toLocaleDateString('vi-VN')}
                                                    <span className="text-slate-300">|</span>
                                                    {new Date(bk.trips.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    Từ: {bk.trips.origin}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {bk.seat_number ? (
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold border border-blue-100 text-xs shadow-sm">
                                                        {bk.seat_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Tự chọn</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-800">
                                                {bk.amount.toLocaleString()}đ
                                            </td>
                                            <td className="p-4 max-w-[200px] truncate relative group cursor-help">
                                                <span className="text-slate-500 text-xs italic flex items-center gap-1">
                                                    {notes ? (
                                                        <>
                                                            <FileText className="w-3 h-3" /> {notes}
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </span>
                                                {/* Tooltip for long notes */}
                                                {notes && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-normal leading-relaxed">
                                                        {notes}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-400 italic">
                                        Không tìm thấy khách hàng nào.
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
