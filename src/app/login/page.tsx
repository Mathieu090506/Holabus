import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string }>;
}) {
  // 👇 1. GIẢI NÉN PROMISE (FIX LỖI NEXT.JS 15)
  const searchParams = await props.searchParams;
  const message = searchParams?.message;

  const supabase = await createClient();

  // Nếu đã đăng nhập rồi thì đá về trang chủ
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    return redirect('/');
  }

  // Server Action để xử lý đăng nhập Google
  const signInWithGoogle = async () => {
    'use server';
    const supabase = await createClient();

    // 👇 2. LẤY ORIGIN CHUẨN ĐỂ KHÔNG BỊ CHUYỂN HƯỚNG SAI
    const headersList = await headers();
    const origin = headersList.get('origin') || headersList.get('host') || 'http://localhost:3000';

    // Nếu origin không có http/https (thường là localhost), tự thêm vào
    const protocol = origin.includes('localhost') ? 'http' : 'https';
    const finalOrigin = origin.startsWith('http') ? origin : `${protocol}://${origin}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Sau khi Google xong, quay về đúng nơi đã gọi nó (Local về Local, Vercel về Vercel)
        redirectTo: `${finalOrigin}/auth/callback`,
      },
    });

    if (error) {
      console.log(error);
      return redirect('/login?message=Could not authenticate user');
    }

    return redirect(data.url);
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      {/* Left Side: Tet Image */}
      <div className="relative h-64 lg:h-auto lg:min-h-screen bg-red-50 order-1">
        <img
          src="/tet-atmosphere.png"
          alt="Không khí Tết"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 lg:p-12 text-white">
          <h2 className="text-2xl lg:text-4xl font-black mb-2 lg:mb-4">Về nhà đón Tết</h2>
          <p className="text-sm lg:text-lg font-medium opacity-90">Sum vầy bên gia đình cùng Hola Bus.</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-8 bg-white order-2 lg:order-none flex-1">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Đăng nhập</h1>
            <p className="text-gray-500">Chào mừng bạn quay trở lại với Hola Bus</p>
          </div>

          <form action={signInWithGoogle}>
            <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-sm hover:shadow-md">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Logo"
                className="w-6 h-6"
              />
              <span>Tiếp tục với Google</span>
            </button>
          </form>

          {/* Message for errors */}
          {message && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center rounded-xl">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}