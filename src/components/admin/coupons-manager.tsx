'use client';

import { useState } from 'react';
import { createCoupon, deleteCoupon } from '@/actions/admin-coupons';
import { toast } from 'sonner';
import { Trash2, Plus, Ticket, CheckCircle2, XCircle } from 'lucide-react';

type Coupon = {
    id: string;
    code: string;
    discount_value: number;
    is_used: boolean;
    created_at: string;
    created_by: string | null;
    assigned_to: string | null;
};

export default function CouponsManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [newCode, setNewCode] = useState('');
    const [newDiscount, setNewDiscount] = useState(10);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('code', newCode);
        formData.append('discount_value', newDiscount.toString());

        const res = await createCoupon(formData);

        if (res.success) {
            toast.success(res.message);
            setNewCode('');
            setShowAddForm(false);
            window.location.reload();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleDelete = async (code: string) => {
        if (!confirm('Bạn có chắc muốn xóa mã này?')) return;

        const res = await deleteCoupon(code);
        if (res.success) {
            toast.success(res.message);
            setCoupons(prev => prev.filter(c => c.code !== code));
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-orange-500" /> Danh sách Mã giảm giá
                </h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Thêm mã mới
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleCreate} className="p-6 bg-slate-50 border-b border-slate-100 animate-in slide-in-from-top-2">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mã Coupon (VD: TET2026)</label>
                            <input
                                type="text"
                                required
                                value={newCode}
                                onChange={e => setNewCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none uppercase font-mono tracking-wide"
                                placeholder="NHAPMA..."
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Giảm (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="100"
                                    value={newDiscount}
                                    onChange={e => setNewDiscount(Number(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                                <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition h-[42px] disabled:opacity-50"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo mã'}
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <th className="p-4">Mã Coupon</th>
                            <th className="p-4">Giá trị</th>
                            <th className="p-4">Quay trúng?</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4">Ngày tạo</th>
                            <th className="p-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">Chưa có mã giảm giá nào</td>
                            </tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.code} className="border-t border-slate-100 hover:bg-slate-50/50 transition">
                                    <td className="p-4 font-mono font-bold text-slate-800">{coupon.code}</td>
                                    <td className="p-4 text-green-600 font-bold">-{coupon.discount_value}%</td>
                                    <td className="p-4">
                                        {coupon.assigned_to ? (
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                Đã trúng
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">
                                                --
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {coupon.is_used ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                Đã dùng
                                            </span>
                                        ) : coupon.assigned_to ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                <CheckCircle2 className="w-3 h-3" /> Chờ dùng
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <CheckCircle2 className="w-3 h-3" /> Khả dụng
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">
                                        {new Date(coupon.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(coupon.code)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                                            title="Xóa mã"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
