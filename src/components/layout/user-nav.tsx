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
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all text-sm shadow-sm hover:shadow-md"
      >
        Đăng nhập
      </Link>
    );
  }

  return (
    <div className="relative">
      {/* NÚT BẤM HIỆN MENU (Avatar Only style) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group outline-none"
      >
        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200 group-hover:ring-2 group-hover:ring-sky-500 transition-all">
          {/* Simple Avatar Placeholder or Image */}
          {user.user_metadata.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
              {user.user_metadata.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        {/* IsOnline Indicator */}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
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