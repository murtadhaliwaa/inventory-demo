/** وحدات المخزون الموحّدة (قيمة الحقل `unit` في قاعدة البيانات) */
export const ITEM_UNITS = ["TON", "KG", "PIECE"] as const
export type ItemUnit = (typeof ITEM_UNITS)[number]

export const itemUnitLabel: Record<ItemUnit, string> = {
  TON: "طن",
  KG: "كيلو",
  PIECE: "قطعة",
}

export function parseItemUnit(raw: string): ItemUnit {
  const u = String(raw ?? "")
    .trim()
    .toUpperCase()
  if (u === "TON" || u === "KG" || u === "PIECE") return u
  return "KG"
}

/** عرض العربية للوحدة المخزّنة كنص */
export function itemUnitLabelFor(raw: string): string {
  return itemUnitLabel[parseItemUnit(raw)]
}
