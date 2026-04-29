import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

/**
 * تمرير جلسة Supabase (تحديث الـ cookies) + حماية المسارات عند تفعيل المصادقة
 *
 * ملاحظة Edge: اقرأ `NEXT_PUBLIC_*` هنا في الجذر دون تمريرها من `lib/env.ts`
 * حتى يضمّن Turbopack القيم في حزمة الـ middleware.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim()

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  if (!user && pathname !== "/login") {
    const u = new URL("/login", request.url)
    return NextResponse.redirect(u)
  }
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
