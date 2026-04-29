export type SessionUserLike = { id: string; email?: string | null }

/**
 * حذف مواد/موردين: إذا وُجدت `WMS_ADMIN_EMAILS` (مفصولة بفاصلة) فقط هذه البريدات يمكنها الحذف.
 * إذا المتغير فارغ أو غير مُعرّف: يُسمح للجميع (سلوك سابق، مناسب لنشر بسيط).
 */
export function canDeleteInventoryEntities(user: SessionUserLike | null): boolean {
  if (!user) return false
  if (process.env.NODE_ENV === "development" && user.id === "dev") {
    return true
  }
  const raw = process.env.WMS_ADMIN_EMAILS?.trim()
  if (!raw) return true
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  const email = (user.email ?? "").trim().toLowerCase()
  return email.length > 0 && allowed.includes(email)
}
