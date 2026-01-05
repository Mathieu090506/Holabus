import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // 2. Định nghĩa các Email là Admin (Lấy từ biến môi trường)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

  // 3. BẢO VỆ ROUTE /ADMIN
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Nếu chưa đăng nhập -> Đá về Login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Nếu đăng nhập rồi nhưng không phải Admin -> Đá về Home
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 4. BẢO VỆ ROUTE /MY-TICKETS (Phải đăng nhập mới được vào)
  if (request.nextUrl.pathname.startsWith('/my-tickets') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/my-tickets/:path*',
    // Cần thiết để middleware chạy đúng với supabase auth
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}