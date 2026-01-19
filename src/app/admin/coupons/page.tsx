import { getCoupons } from '@/actions/admin-coupons';
import CouponsManager from '@/components/admin/coupons-manager';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
    title: 'Quản lý Mã Giảm Giá | Admin Holabus',
};

export default async function AdminCouponsPage() {
    const coupons = await getCoupons();

    return (
        <div className="min-h-screen bg-slate-50 p-4 pt-24 md:p-10 md:pt-32">
            <div className="mb-6">
                <Link href="/admin" className="text-slate-500 hover:text-orange-600 flex items-center gap-1 text-sm font-medium mb-2 transition">
                    <ChevronLeft className="w-4 h-4" /> Quay lại Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Quản lý Mã Giảm Giá</h1>
                <p className="text-slate-500 mt-1">Tạo và quản lý các mã coupon cho chiến dịch Tết.</p>
            </div>

            <CouponsManager initialCoupons={coupons as any} />
        </div>
    );
}
