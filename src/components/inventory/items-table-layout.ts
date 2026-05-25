import { cn } from "@/lib/utils"

/** تخطيط أعمدة جدول المواد — مسافات ومحاذاة موحّدة */
export type ItemsTableColAlign = "start" | "end" | "center"

export type ItemsTableColumnLayout = {
  align: ItemsTableColAlign
  /** عرض أدنى على الموبايل (تمرير أفقي) */
  minWidth: string
  /** عرض نسبي على الشاشات الكبيرة */
  desktopWidth: string
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
  name: { align: "start", minWidth: "min-w-[7rem]", desktopWidth: "md:w-[22%]" },
  unit: { align: "start", minWidth: "min-w-[4.5rem]", desktopWidth: "md:w-[12%]" },
  bal: { align: "end", minWidth: "min-w-[4.5rem]", desktopWidth: "md:w-[13%]" },
  safety: { align: "end", minWidth: "min-w-[5.5rem]", desktopWidth: "md:w-[13%]" },
  report: { align: "center", minWidth: "min-w-[5.5rem]", desktopWidth: "md:w-[14%]" },
  ops: { align: "center", minWidth: "min-w-[5.5rem]", desktopWidth: "md:w-[14%]" },
}

export const ITEMS_TABLE_CELL_PAD = "px-3 py-3 md:px-4"

/** عرض أدنى للجدول على الموبايل لمنع تداخل الأعمدة */
export const ITEMS_TABLE_MIN_WIDTH = "min-w-[42rem]"

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
    layout.minWidth,
    layout.desktopWidth,
    itemsTableAlignClass(layout.align),
    extra
  )
}
