import type { Item, Supplier } from "@/generated/prisma"
import type { TransactionType } from "@/generated/prisma"

/** بيانات مادة للعرض في العميل (بدون Decimal) */
export type ItemForClient = {
  id: string
  name: string
  currentQuantity: string
  minThreshold: string
  unit: string
}

export function itemToClient(i: Item): ItemForClient {
  return {
    id: i.id,
    name: i.name,
    currentQuantity: i.currentQuantity.toString(),
    minThreshold: i.minThreshold.toString(),
    unit: i.unit,
  }
}

export type SupplierForClient = {
  id: string
  name: string
  countryCode: string
  notes: string | null
}

export function supplierToClient(s: Supplier): SupplierForClient {
  return {
    id: s.id,
    name: s.name,
    countryCode: s.countryCode,
    notes: s.notes,
  }
}

/** حركة يومية مع العلاقات — للجداول في العميل */
export type DailyMovementForClient = {
  id: string
  createdAt: string
  type: TransactionType
  quantity: string
  item: { id: string; name: string; unit: string }
  supplier: { id: string; name: string; countryCode: string } | null
}

type TransactionWithRelations = {
  id: string
  createdAt: Date
  type: TransactionType
  quantity: { toString(): string }
  item: Pick<Item, "id" | "name" | "unit">
  supplier: Pick<Supplier, "id" | "name" | "countryCode"> | null
}

export function dailyMovementToClient(t: TransactionWithRelations): DailyMovementForClient {
  return {
    id: t.id,
    createdAt: t.createdAt.toISOString(),
    type: t.type,
    quantity: t.quantity.toString(),
    item: {
      id: t.item.id,
      name: t.item.name,
      unit: t.item.unit,
    },
    supplier: t.supplier
      ? { id: t.supplier.id, name: t.supplier.name, countryCode: t.supplier.countryCode }
      : null,
  }
}
