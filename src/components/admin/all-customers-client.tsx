'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Download, MapPin, Calendar, User, Phone, Mail, FileText, Clock, Ticket } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Booking {
    id: string;
    created_at: string;
    status: string;
    amount: number;
    seat_number?: string;
    check_in_at?: string; // Add check_in_at field
    payment_code?: string; // Add payment_code field
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
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-xs tracking-wider whitespace-nowrap">
                            <tr>
                                <th className="p-4 pl-6">#</th>
                                <th className="p-4">Khách hàng</th>
                                <th className="p-4">Liên hệ</th>
                                <th className="p-4">Chuyến xe</th>
                                <th className="p-4 text-right">Giá vé</th>
                                <th className="p-4 text-center">Check-in</th>
                                <th className="p-4">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((bk, idx) => {
                                    // Determine display name/phone
                                    // Use Full Name from Booking first (User input at booking time), else Profile
                                    const name = bk.full_name || bk.profiles?.full_name || bk.profiles?.email || 'Khách hàng';
                                    const phone = bk.phone_number || bk.profiles?.phone || '-';
                                    const email = bk.profiles?.email || '-';
                                    const studentId = bk.student_id || bk.profiles?.student_id;
                                    const notes = bk.more || '';

                                    return (
                                        <tr key={bk.id} className="hover:bg-slate-50 transition align-top">
                                            <td className="p-4 pl-6 font-medium text-slate-400 whitespace-nowrap">{idx + 1}</td>
                                            <td className="p-4 min-w-[180px]">
                                                <div className="font-bold text-slate-900 flex items-start gap-2">
                                                    <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <span className="whitespace-normal">{name}</span>
                                                </div>
                                                {studentId && (
                                                    <div className="text-xs text-slate-500 ml-6 mt-1 flex items-center gap-1">
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono whitespace-nowrap">{studentId}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 space-y-1 min-w-[180px]">
                                                <div className="flex items-center gap-2 text-slate-600 whitespace-nowrap">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {phone}
                                                </div>
                                                <div className="flex items-start gap-2 text-slate-500 text-xs break-all">
                                                    <Mail className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" /> {email}
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                                        <Ticket className="w-3 h-3" /> {bk.payment_code || '---'}
                                                    </span>
                                                </div>
                                                <div className="font-bold text-slate-800 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-orange-500" />
                                                    {bk.trips.destination}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span>
                                                        {new Date(bk.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-800 whitespace-nowrap">
                                                {bk.amount.toLocaleString()}đ
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                {bk.check_in_at ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold border border-green-200 text-xs shadow-sm">
                                                        {new Date(bk.check_in_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 min-w-[250px] whitespace-normal text-sm text-slate-600">
                                                <span className="flex items-start gap-1">
                                                    {notes ? (
                                                        <>
                                                            <FileText className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" />
                                                            <span>{notes}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </span>
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
