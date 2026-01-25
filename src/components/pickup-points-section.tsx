'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2, X } from 'lucide-react';

export default function PickupPointsSection() {
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-200">
            <h2 className="text-2xl md:text-3xl font-black text-[#D0021B] mb-6 uppercase text-center border-b-2 border-red-100 pb-3">
                CÁC ĐIỂM ĐÓN TẠI HÒA LẠC
            </h2>

            <div
                className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 border border-slate-100 shadow-sm cursor-zoom-in group"
                onClick={() => setIsZoomed(true)}
            >
                <Image
                    src="/anhdiemdon.jpeg"
                    alt="Các điểm đón tại Hòa Lạc"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-slate-800 px-3 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 backdrop-blur-sm">
                        <Maximize2 className="w-4 h-4" />
                        Phóng to
                    </span>
                </div>
            </div>

            {/* Modal Zoom */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsZoomed(false)}
                >
                    <div className="relative w-full h-full md:w-[90vw] md:h-[90vh]">
                        <Image
                            src="/anhdiemdon.jpeg"
                            alt="Các điểm đón tại Hòa Lạc (Phóng to)"
                            fill
                            className="object-contain"
                            priority
                        />
                        <button
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur z-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsZoomed(false);
                            }}
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Point 1 */}
                <div className="flex items-start gap-3">
                    <div className="min-w-[24px] flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs ring-2 ring-white shadow-sm">1</div>
                        <div className="w-0.5 h-10 bg-slate-100 my-1"></div>
                    </div>
                    <div className="mt-0.5">
                        <h4 className="font-bold text-slate-800 text-sm">Chợ Hòa Lạc (FPT Shop)</h4>
                    </div>
                </div>

                {/* Point 2 */}
                <div className="flex items-start gap-3">
                    <div className="min-w-[24px] flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs ring-2 ring-white shadow-sm">2</div>
                        <div className="w-0.5 h-10 bg-slate-100 my-1"></div>
                    </div>
                    <div className="mt-0.5">
                        <h4 className="font-bold text-slate-800 text-sm">Cây Xăng 39</h4>
                    </div>
                </div>

                {/* Point 3 */}
                <div className="flex items-start gap-3">
                    <div className="min-w-[24px] flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs ring-2 ring-white shadow-sm">3</div>
                        <div className="w-0.5 h-10 bg-slate-100 my-1"></div>
                    </div>
                    <div className="mt-0.5">
                        <h4 className="font-bold text-slate-800 text-sm">Ngã ba Tân Xã</h4>
                    </div>
                </div>

                {/* Point 4 */}
                <div className="flex items-start gap-3">
                    <div className="min-w-[24px] flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm">4</div>
                    </div>
                    <div className="mt-0.5">
                        <h4 className="font-bold text-slate-800 text-sm">Đại học FPT (Điểm cuối)</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
