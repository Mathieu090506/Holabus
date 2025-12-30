'use client'

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, User, Ticket, ChevronDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserNav({ user }: { user: any }) {
  const adminEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";

  // 2. Tách thành mảng và xóa khoảng trắng thừa (nếu có)
  const ADMIN_EMAILS = adminEnv.split(',').map(email => email.trim());

  // 3. Kiểm tra user hiện tại có nằm trong danh sách không
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  // ---------------------

  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="bg-white text-orange-600 border border-orange-100 hover:bg-orange-50 font-bold py-2.5 px-6 rounded-full transition shadow-sm hover:shadow-md text-sm"
      >
        Đăng nhập
      </Link>
    );
  }

  return (
    <div className="relative">
      {/* NÚT BẤM HIỆN MENU */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/50 hover:bg-white backdrop-blur-md pl-2 pr-4 py-1.5 rounded-full border border-white/20 transition-all duration-300 group"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
          {user.user_metadata.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate group-hover:text-orange-700">
          {user.user_metadata.full_name}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <>
          {/* Lớp phủ để click outside thì đóng */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              <p className="text-xs text-slate-500">Đăng nhập với email</p>
              <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
            </div>

            <div className="p-1">
              <Link href="/my-tickets" className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" onClick={() => setIsOpen(false)}>
                <Ticket className="w-4 h-4" /> Vé của tôi
              </Link>
              {/* Nếu là Admin thì hiện thêm link Admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" /> Trang quản trị
                </Link>
              )}
            </div>

            <div className="border-t border-slate-50 p-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}