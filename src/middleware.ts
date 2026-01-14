import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Initialize Redis & Ratelimit conditionally
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(70, "10 s"),
      analytics: true,
    });
  } catch (e) {
    console.warn("Failed to initialize Redis/Ratelimit:", e);
  }
}

export async function middleware(request: NextRequest) {

  const ip = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1';

  // Bỏ qua các file tĩnh (ảnh, css...) để tiết kiệm request Redis
  if (!request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|css|js|ico)$/)) {
    // Chỉ chạy Rate Limit nếu có cấu hình Redis hợp lệ
    if (ratelimit) {
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
  }

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