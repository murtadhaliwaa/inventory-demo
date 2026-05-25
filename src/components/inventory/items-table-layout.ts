import { cn } from "@/lib/utils"

/** تخطيط أعمدة جدول المواد — مسافات ومحاذاة موحّدة */
export type ItemsTableColAlign = "start" | "end" | "center"

export type ItemsTableColumnLayout = {
  align: ItemsTableColAlign
  width: string
}

/** ترتيب الأعمدة من اليمين: الاسم → الوحدة → الرصيد → حد الإنذار → تقرير → إدارة */
export const ITEMS_TABLE_COLUMN_ORDER = [
  "name",
  "unit",
  "bal",
  "safety",
  "report",
  "ops",
] as const

export type ItemsTableColumnId = (typeof ITEMS_TABLE_COLUMN_ORDER)[number]

export const ITEMS_TABLE_LAYOUT: Record<ItemsTableColumnId, ItemsTableColumnLayout> = {
  name: { align: "start", width: "w-[22%]" },
  unit: { align: "start", width: "w-[13%]" },
  bal: { align: "end", width: "w-[13%]" },
  safety: { align: "end", width: "w-[13%]" },
  report: { align: "center", width: "w-[14%]" },
  ops: { align: "center", width: "w-[14%]" },
}

export const ITEMS_TABLE_CELL_PAD = "px-4 py-3"

export function itemsTableAlignClass(align: ItemsTableColAlign): string {
  if (align === "end") return "text-end"
  if (align === "center") return "text-center"
  return "text-start"
}

export function itemsTableColumnClass(columnId: ItemsTableColumnId | string, extra?: string): string {
  const layout = ITEMS_TABLE_LAYOUT[columnId as ItemsTableColumnId]
  if (!layout) {
    return cn(ITEMS_TABLE_CELL_PAD, extra)
  }
  return cn(
    ITEMS_TABLE_CELL_PAD,
    layout.width,
    itemsTableAlignClass(layout.align),
    extra
  )
}
