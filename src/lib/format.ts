import type { TransactionType } from "@/generated/prisma"

export {
  ITEM_UNITS,
  itemUnitLabel,
  itemUnitLabelFor,
  parseItemUnit,
  type ItemUnit,
} from "@/lib/item-unit"

const nf = (n: number) =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 4 }).format(n)

/** عرض كمية مخزنيّة (Decimal) */
export function formatDecimalQuantity(value: { toString: () => string } | string) {
  return nf(Number(String(value)))
}

export function transactionTypeLabel(t: TransactionType) {
  return t === "ADD" ? "إضافة" : "سحب"
}

export function directionLabelFromTransactionType(t: TransactionType) {
  return t === "ADD" ? "إضافة" : "سحب"
}
