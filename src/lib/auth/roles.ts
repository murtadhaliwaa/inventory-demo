import type { User } from "@supabase/supabase-js"

/** الحقول المستخدمة لتحديد صلاحية التعديل في الخادم */
export type SessionUserLike = {
  id: string
  email?: string | null
  app_metadata?: User["app_metadata"] | null
}

function appMetaRecord(user: SessionUserLike | null): Record<string, unknown> | null {
  const m = user?.app_metadata
  if (m && typeof m === "object" && !Array.isArray(m)) return m as Record<string, unknown>
  return null
}

function truthyFlag(v: unknown): boolean {
  if (v === true) return true
  if (v === 1) return true
  if (typeof v === "string") {
    const s = v.trim().toLowerCase()
    return s === "true" || s === "1" || s === "yes"
  }
  return false
}

/**
 * مشرف المخزن: إضافة / تعديل / حذف مواد وموردين، وتسجيل حركات اليوم.
 *
 * يُفعّل عبر Supabase → Authentication → المستخدم → **App Metadata** (Raw JSON)، مثلاً:
 * `{ "wms_admin": true }` أو `{ "wms_role": "admin" }`
 *
 * إضافة اختيارية: `WMS_ADMIN_EMAILS` (بريدات مفصولة بفاصلة) تُعامل كقائمة مشرفين أيضاً.
 * من دون `wms_admin` ولا بريد في القائمة: المستخدم **عرض فقط** (قراءة التقارير والجداول).
 */
export function isInventoryAdmin(user: SessionUserLike | null): boolean {
  if (!user) return false
  if (process.env.NODE_ENV === "development" && user.id === "dev") {
    return true
  }

  const meta = appMetaRecord(user)
  if (meta) {
    if (truthyFlag(meta.wms_admin)) return true
    if (typeof meta.wms_role === "string" && meta.wms_role.trim().toLowerCase() === "admin") {
      return true
    }
  }

  const raw = process.env.WMS_ADMIN_EMAILS?.trim()
  if (raw) {
    const allowed = raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
    const email = (user.email ?? "").trim().toLowerCase()
    return email.length > 0 && allowed.includes(email)
  }

  return false
}
