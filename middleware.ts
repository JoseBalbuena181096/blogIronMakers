import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verificar estado de cuenta si el usuario está autenticado
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol, activo')
      .eq('id', user.id)
      .single()

    // Si la cuenta está desactivada y no estamos ya en la página de bloqueo
    if (profile?.activo === false && !request.nextUrl.pathname.startsWith('/auth/blocked')) {
      return NextResponse.redirect(new URL('/auth/blocked', request.url))
    }

    // Proteger rutas de admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (profile?.rol !== 'admin') {
        // No es admin, redirigir al home
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  } else if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/mis-cursos')) {
    // Si no hay usuario y trata de acceder a rutas protegidas
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }



  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/mis-cursos/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
