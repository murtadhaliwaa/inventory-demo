import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/env"

type UserLike = { id: string; email?: string | null }

/** طلب واحد لكل render — يمنع تكرار getUser بين الصفحة والـ actions */
const fetchAuthUser = cache(async (): Promise<UserLike | null> => {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "development") {
      return { id: "dev", email: "dev@local" }
    }
    return null
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * تُستخدم داخل Server Actions / Server Components لربط المستخدم بـ Supabase.
 */
export async function getServerUser(): Promise<UserLike | null> {
  return fetchAuthUser()
}

/**
 * يرمي إذا تعذّر التحقق من المستخدم. في بيئة الإنتاج يتطلّب إعدادات Supabase كاملة.
 */
export async function requireUser() {
  if (!isSupabaseConfigured() && process.env.NODE_ENV === "development") {
    return { id: "dev", email: "dev@local" } as const
  }
  if (!isSupabaseConfigured()) {
    throw new Error("إعدادات Supabase غير مكتملة. راجع .env")
  }
  const user = await fetchAuthUser()
  if (!user) {
    throw new Error("وصول غير مصرح")
  }
  return user
}

export { isSupabaseConfigured } from "@/lib/env"
