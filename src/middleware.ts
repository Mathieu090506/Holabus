import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// --- 1. KHỞI TẠO RATE LIMIT (UPSTASH) ---
// Tạo kết nối Redis (Chấp nhận biến môi trường có thể undefined lúc build, nhưng phải có lúc chạy)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Cấu hình giới hạn: Cho phép 20 request trong vòng 10 giây (Khá thoải mái cho người dùng thật)
// Nếu spam tool bắn 1000 req/s -> Chặn ngay lập tức.
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
})

export async function middleware(request: NextRequest) {
  // ============================================================
  // A. LỚP BẢO VỆ 1: CHỐNG SPAM (RATE LIMIT)
  // ============================================================
  
  // Chỉ chạy Rate Limit ở môi trường Production hoặc khi Test spam
  // (Bỏ dòng if dưới nếu muốn test luôn ở localhost)
  // if (process.env.NODE_ENV === 'production') {
    const ip = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1';
    
    // Bỏ qua các file tĩnh (ảnh, css...) để tiết kiệm request Redis
    if (!request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|css|js|ico)$/)) {
      try {
        const { success } = await ratelimit.limit(ip);
        
        if (!success) {
          // ⛔ PHÁT HIỆN SPAM -> TRẢ VỀ LỖI 429 NGAY LẬP TỨC
          return new NextResponse('🚦 Bạn thao tác quá nhanh! Vui lòng chờ một chút.', { status: 429 });
        }
      } catch (error) {
        console.error("Lỗi kết nối Redis Rate Limit:", error);
        // Nếu Redis lỗi thì vẫn cho qua (Fail Open) để không chặn người dùng thật
      }
    }
  // }

  // ============================================================
  // B. LỚP BẢO VỆ 2: XÁC THỰC NGƯỜI DÙNG (SUPABASE AUTH)
  // ============================================================
  
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Lấy thông tin User hiện tại
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Định nghĩa các Email là Admin
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

  // 3. BẢO VỆ ROUTE /ADMIN
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 4. BẢO VỆ ROUTE /MY-TICKETS
  if (request.nextUrl.pathname.startsWith('/my-tickets') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/my-tickets/:path*',
    // Middleware chạy trên mọi trang để Rate Limit bảo vệ toàn diện
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}