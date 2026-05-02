import type { User } from "@supabase/supabase-js"

/** شكل المستخدم في استدعاءات الخادم */
export type SessionUserLike = {
  id: string
  email?: string | null
  app_metadata?: User["app_metadata"] | null
}

/**
 * أي مستخدم مسجّل الدخول يملك صلاحية إدارة المخزن بالكامل
 * (مواد، موردون، حركات يومية).
 */
export function isInventoryAdmin(user: SessionUserLike | null): boolean {
  return user != null
}
