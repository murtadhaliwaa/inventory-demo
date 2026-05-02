/** حمولة تصدير PDF — مشتركة بين Server Action والعميل */
export type DailyPdfPayload = {
  dateLabel: string
  adds: {
    time: string
    itemName: string
    supplierName: string
    /** لعرض علم في PDF؛ null أو OTHER بدون صورة */
    supplierCountryCode: string | null
    qtyUnit: string
  }[]
  withdraws: { time: string; itemName: string; qtyUnit: string }[]
  balances: { itemName: string; qtyUnit: string }[]
}
