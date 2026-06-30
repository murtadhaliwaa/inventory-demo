import {
  canDeleteInventory,
  canManageInventory,
  canViewAuditLog,
  type SessionUserLike,
} from "@/lib/auth/roles"
import { requireUser } from "@/lib/auth/require-user"

export async function requireManageUser(): Promise<SessionUserLike> {
  const user = await requireUser()
  if (!canManageInventory(user)) {
    throw new Error("ليس لديك صلاحية التعديل أو تسجيل الحركات")
  }
  return user
}

export async function requireDeleteUser(): Promise<SessionUserLike> {
  const user = await requireUser()
  if (!canDeleteInventory(user)) {
    throw new Error("ليس لديك صلاحية الحذف")
  }
  return user
}

export async function requireAuditViewer(): Promise<SessionUserLike> {
  const user = await requireUser()
  if (!canViewAuditLog(user)) {
    throw new Error("ليس لديك صلاحية عرض سجل التدقيق")
  }
  return user
}
