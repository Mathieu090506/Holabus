import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banner */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <img src="/tet-atmosphere.png" alt="Tet Atmosphere" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-black text-white text-center drop-shadow-lg">
            Về Dự Án <span className="text-yellow-400">Hola Bus</span>
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 text-center font-medium">
            Dự án giúp sinh viên và người lao động xa nhà đặt vé xe về quê đón Tết một cách an toàn, thuận tiện và minh bạch nhất.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Tốc độ & Tiện lợi</h3>
              <p className="text-sm text-slate-500">Đặt vé chỉ trong 60 giây với quy trình tối ưu hóa.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Cộng đồng</h3>
              <p className="text-sm text-slate-500">Kết nối hàng ngàn người con xa xứ trên cùng những chuyến xe.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Tận tâm</h3>
              <p className="text-sm text-slate-500">Hỗ trợ khách hàng 24/7 trong suốt mùa cao điểm.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-bold hover:underline">
              <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}