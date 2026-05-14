import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('SEU-PROJETO')) return supabaseResponse

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  let user = null
  let role = 'student'
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) {
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      role = p?.role || 'student'
    }
  } catch { return supabaseResponse }

  const { pathname } = request.nextUrl
  const isPrivileged = role === 'seller' || role === 'admin'

  if (pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    if (!isPrivileged) return NextResponse.redirect(new URL('/catalog', request.url))
  }
  if (pathname.startsWith('/my-courses') || pathname.startsWith('/learn')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
  }
  if ((pathname === '/login' || pathname === '/register') && user) {
    return NextResponse.redirect(new URL(isPrivileged ? '/dashboard' : '/catalog', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
