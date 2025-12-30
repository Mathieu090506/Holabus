import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Bus, Ticket, LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default async function Header() {
  // 1. Kiểm tra trạng thái đăng nhập
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Logic Đăng xuất (Form Server Action đơn giản)
  // Lưu ý: Trong thực tế bạn có thể tách ra component client riêng, nhưng để đơn giản ta dùng form
  const signOut = async () => {
    'use server';
    const sb = await createClient();
    await sb.auth.signOut();
    // Redirect về home thì cần import redirect, nhưng ở đây ta để form action tự xử lý reload
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* LOGO BÊN TRÁI */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-orange-600 p-2 rounded-lg group-hover:bg-orange-700 transition">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            HOLA<span className="text-orange-600">BUS</span>
          </span>
        </Link>

        {/* MENU BÊN PHẢI */}
        <div className="flex items-center gap-4">

          {user ? (
            <>
              {/* --- ĐÂY LÀ NÚT BẠN CẦN THÊM --- */}
              <Link
                href="/my-tickets"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors bg-orange-50 px-4 py-2 rounded-full border border-orange-100 hover:border-orange-300"
              >
                <Ticket className="w-4 h-4" />
                <span>Vé của tôi</span>
              </Link>
              {/* ------------------------------- */}

              {/* Avatar / User Info */}
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200 ml-2">
                <div className="hidden md:block text-right">
                  <p className="text-xs text-gray-500">Xin chào,</p>
                  <p className="text-sm font-bold text-gray-800 max-w-[100px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </p>
                </div>

                {/* Nút Đăng xuất */}
                <form action="/auth/signout" method="post">
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition" title="Đăng xuất">
                    <LogOut className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            // Nếu chưa đăng nhập
            <Link
              href="/login"
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-bold transition shadow-lg shadow-gray-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}