'use client'

import Link from 'next/link';
import { Facebook, Phone, MapPin, Mail } from 'lucide-react';

export default function SiteFooter() {
    return (
        <footer className="bg-[#020617] pt-24 pb-12 border-t border-slate-800 font-sans text-slate-400 mt-20">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column - Spans 2 cols */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white font-black text-2xl uppercase tracking-wide">HOLA BUS 2026</h4>
                        <p className="leading-relaxed text-sm max-w-sm">
                            Dự án phi lợi nhuận hỗ trợ sinh viên FPT University về quê ăn Tết an toàn, tiết kiệm.
                        </p>

                        <div className="flex items-center gap-4">
                            {/* Red Envelope Icon (CSS Layout) */}
                            <div className="w-10 h-14 bg-[#D0021B] rounded-[4px] border border-yellow-200 flex items-center justify-center shadow-sm relative overflow-hidden -rotate-12 hover:rotate-0 transition-transform cursor-pointer">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-[#B00015] rounded-b-full"></div>
                                <div className="w-[60%] h-[60%] border border-yellow-400 rounded-full flex items-center justify-center mt-3">
                                    <span className="text-yellow-400 font-bold text-[8px]">Tết</span>
                                </div>
                            </div>

                            <a
                                href="https://facebook.com/HolaBusFPTU.CSKH"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all shadow-lg shadow-blue-900/50"
                            >
                                <Facebook size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Liên Hệ</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li className="flex items-start gap-3">
                                <Phone className="shrink-0 text-[#D0021B]" size={20} />
                                <div>
                                    <span className="block text-white font-bold text-base">0943 597 513</span>
                                    <span className="text-slate-500 text-xs uppercase font-bold">Ms. Mai Linh (Điều phối tổng)</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="shrink-0 text-[#D0021B]" size={20} />
                                <div>
                                    <span className="block text-white font-bold text-base">0376 875 810</span>
                                    <span className="text-slate-500 text-xs uppercase font-bold">Ms. Anh Hồng (Trưởng phòng dịch vụ)</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="shrink-0 text-[#D0021B]" size={20} />
                                <div>
                                    <span className="block text-white font-bold text-base">holabus2026@gmail.com</span>
                                    <span className="text-slate-500 text-xs uppercase font-bold">Email Hỗ trợ</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Address Column */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Địa chỉ</h4>
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="shrink-0 text-[#D0021B]" size={20} />
                            <p className="leading-relaxed">
                                Đại học FPT Hà Nội,<br />
                                Khu Công nghệ cao Hòa Lạc, Km29<br />
                                Đại lộ Thăng Long, Hà Nội.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 text-center">
                    <p className="text-slate-500 text-xs md:text-sm font-medium">
                        © 2026 Hola Bus. Made by Nguyễn Dương Công Thành and Đoàn Thế Long.
                    </p>
                </div>
            </div>
        </footer>
    );
}
