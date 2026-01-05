import { createClient } from '@/utils/supabase/server';
import TripEditor from '@/components/admin/trip-editor';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Lấy thông tin chuyến xe
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !trip) return notFound();

  // 2. LẤY DANH SÁCH HÀNH KHÁCH (MỚI)
  // Sắp xếp theo ngày đặt mới nhất
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 pt-24 md:pt-32">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-8 font-medium transition">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>

        {/* Truyền thêm props bookings xuống Editor */}
        <TripEditor trip={trip} bookings={bookings || []} />
      </div>
    </div>
  );
}