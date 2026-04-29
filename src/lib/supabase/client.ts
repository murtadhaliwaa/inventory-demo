import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseAnonKey } from "@/lib/env"

/**
 * عميل المتصفح لاشتراكات الوقت الحقيقي (Realtime) والمصادقة من الواجهة
 */
export function createBrowserClientSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseAnonKey()!
  )
}
