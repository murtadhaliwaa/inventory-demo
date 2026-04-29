/**
 * مفتاح الجلسة العام لـ Supabase — لوحة المشروع تعرض أحياناً «anon» (JWT) وأحياناً «publishable».
 */
export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  )
}

/**
 * مفاتيح مُتاحة في المتصفح (NEXT_PUBLIC_). استخدم دون الاعتماد على وحدات server-only
 */
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseAnonKey())
}
