import type { User } from "@supabase/supabase-js"

/** شكل المستخدم في استدعاءات الخادم */
export type SessionUserLike = {
  id: string
  email?: string | null
  app_metadata?: User["app_metadata"] | null
}

export type WmsRole = "admin" | "operator" | "viewer"

function parseAdminEmails(): string[] {
  const raw = process.env.WMS_ADMIN_EMAILS?.trim()
  if (!raw) return []
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

function emailInAdminList(email: string | null | undefined): boolean {
  if (!email) return false
  const list = parseAdminEmails()
  if (list.length === 0) return false
  return list.includes(email.trim().toLowerCase())
}

/**
 * يحدد دور المستخدم:
 * - `app_metadata.wms_role`: admin | operator | viewer
 * - `app_metadata.wms_admin`: true → admin
 * - `WMS_ADMIN_EMAILS`: يمنح admin
 * - بدون إعداد: operator (توافق مع الحسابات الحالية)
 */
export function getWmsRole(user: SessionUserLike | null): WmsRole {
  if (!user) return "viewer"

  if (user.id === "dev" && process.env.NODE_ENV === "development") {
    return "admin"
  }

  const meta = user.app_metadata as Record<string, unknown> | null | undefined
  const role = meta?.wms_role
  if (role === "admin" || role === "operator" || role === "viewer") {
    return role
  }
  if (meta?.wms_admin === true) return "admin"
  if (emailInAdminList(user.email)) return "admin"

  return "operator"
}

/** أي مستخدم مسجّل — عرض اللوحة والتقارير */
export function canViewInventory(user: SessionUserLike | null): boolean {
  return user != null
}

/** إضافة/تعديل مواد وموردين وحركات */
export function canManageInventory(user: SessionUserLike | null): boolean {
  if (!user) return false
  const role = getWmsRole(user)
  return role === "admin" || role === "operator"
}

/** حذف مواد أو موردين */
export function canDeleteInventory(user: SessionUserLike | null): boolean {
  if (!user) return false
  const role = getWmsRole(user)
  if (role !== "admin") return false

  const allowList = parseAdminEmails()
  if (allowList.length === 0) return true
  return emailInAdminList(user.email)
}

/** عرض سجل التدقيق */
export function canViewAuditLog(user: SessionUserLike | null): boolean {
  return getWmsRole(user) === "admin"
}

/** @deprecated استخدم canManageInventory */
export function isInventoryAdmin(user: SessionUserLike | null): boolean {
  return canManageInventory(user)
}

export function wmsRoleLabel(role: WmsRole): string {
  switch (role) {
    case "admin":
      return "مشرف"
    case "operator":
      return "مشغّل"
    case "viewer":
      return "عرض فقط"
  }
}
