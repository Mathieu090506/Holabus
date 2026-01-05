'use client'

import Link from 'next/link';
import { Bus, Facebook, Instagram, Twitter, Globe, Smartphone, QrCode } from 'lucide-react';

export default function SiteFooter() {
    return (
        <footer className="bg-[#FFFCF8] pt-20 pb-10 border-t border-slate-100 font-sans">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white">
                                <Bus className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">TetBus</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            Kết nối bạn với những người thân yêu dịp Tết Nguyên Đán. Được tin dùng bởi hơn 1 triệu hành khách trên khắp Việt Nam.
                        </p>
                    </div>

                    {/* About Column */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 text-lg">Về chúng tôi</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-medium">
                            <li><Link href="/about" className="hover:text-red-600 transition-colors">Về HolaBus</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Đối tác nhà xe</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Tin tức & Blog</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Tuyển dụng</Link></li>
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 text-lg">Hỗ trợ</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-medium">
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Trung tâm trợ giúp</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Điều khoản sử dụng</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-red-600 transition-colors">Liên hệ</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-sm font-medium">
                        © 2025 TetBus Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-slate-400">
                        <Globe className="w-5 h-5 hover:text-slate-900 cursor-pointer transition-colors" />
                        <Facebook className="w-5 h-5 hover:text-blue-600 cursor-pointer transition-colors" />
                        <Instagram className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
                        <Twitter className="w-5 h-5 hover:text-sky-500 cursor-pointer transition-colors" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
