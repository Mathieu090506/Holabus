import TripEditor from '@/components/admin/trip-editor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewTripPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 pt-32">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-8 font-medium transition">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>

        {/* Gọi Editor không truyền props -> Chế độ tạo mới */}
        <TripEditor />
      </div>
    </div>
  );
}