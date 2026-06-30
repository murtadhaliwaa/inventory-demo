/** حمولة تصدير PDF لتقرير مادة واحدة */
export type ItemPdfPayload = {
  itemName: string
  unitLabel: string
  dateLabel: string
  openingQty: string
  closingQty: string
  totalAdded: string
  totalWithdrawn: string
  adds: {
    time: string
    supplierName: string
    supplierCountryCode: string | null
    qtyUnit: string
  }[]
  withdraws: { time: string; qtyUnit: string }[]
  addsTruncated?: boolean
  withdrawsTruncated?: boolean
}
