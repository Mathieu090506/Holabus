'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Info, Phone, MessageCircle, Ticket, LogIn, User } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function MobileNav({ user }: { user: any }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            <button
                onClick={() => setOpen(true)}
                className="p-2 text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Menu className="w-7 h-7" />
            </button>

            {/* Overlay & Menu */}
            {open && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                        onClick={() => setOpen(false)}
                    ></div>

                    {/* Panel */}
                    <div className="relative w-[300px] h-full bg-white shadow-2xl p-6 animate-in slide-in-from-right duration-300 flex flex-col">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                            <span className="font-black text-2xl text-slate-800">
                                HOLA<span className="text-orange-500">BUS</span>
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Links */}
                        <nav className="flex-1 space-y-2">
                            <Link
                                href="/"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 font-bold transition"
                            >
                                <Home className="w-5 h-5" /> Trang chủ
                            </Link>

                            <Link
                                href="/about"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 font-bold transition"
                            >
                                <Info className="w-5 h-5" /> Về dự án
                            </Link>

                            <a
                                href={siteConfig.messengerUrl}
                                target="_blank"
                                className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-bold transition"
                            >
                                <MessageCircle className="w-5 h-5" /> Chat hỗ trợ
                            </a>

                            <div className="border-t border-slate-100 my-4"></div>

                            {user ? (
                                <>
                                    <div className="px-3 mb-2 flex items-center gap-3">
                                        {user.user_metadata.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Avt" className="w-10 h-10 rounded-full border border-slate-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                {user.user_metadata.full_name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Xin chào,</p>
                                            <p className="text-sm font-bold text-slate-800 truncate">{user.user_metadata.full_name}</p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/my-tickets"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 font-bold transition"
                                    >
                                        <Ticket className="w-5 h-5" /> Vé của tôi
                                    </Link>

                                    <Link
                                        href="/admin"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-bold transition"
                                    >
                                        <User className="w-5 h-5" /> Trang quản trị
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 font-bold transition"
                                >
                                    <LogIn className="w-5 h-5" /> Đăng nhập
                                </Link>
                            )}
                        </nav>

                        {/* Footer */}
                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <a
                                href={`tel:${siteConfig.hotlineUrl}`}
                                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-slate-800 transition"
                            >
                                <Phone className="w-5 h-5" /> Gọi Hotline
                            </a>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
