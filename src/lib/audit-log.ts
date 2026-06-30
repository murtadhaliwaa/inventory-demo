import { db } from "@/lib/db"
import type { Prisma } from "@/generated/prisma"

export type AuditAction =
  | "ITEM_CREATE"
  | "ITEM_UPDATE"
  | "ITEM_DELETE"
  | "SUPPLIER_CREATE"
  | "SUPPLIER_UPDATE"
  | "SUPPLIER_DELETE"
  | "TRANSACTION_ADD"
  | "TRANSACTION_WITHDRAW"

type LogAuditInput = {
  userId?: string | null
  userEmail?: string | null
  action: AuditAction
  entityType: string
  entityId?: string | null
  details?: Prisma.InputJsonValue
}

export async function logAudit(input: LogAuditInput) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId ?? null,
        userEmail: input.userEmail ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        details: input.details ?? undefined,
      },
    })
  } catch (e) {
    console.error("[audit]", e)
  }
}

export async function listRecentAuditLogs(limit = 100) {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(500, Math.max(1, limit)),
  })
}
