"use client"

import { useRef, useState, type CSSProperties } from "react"
import { flushSync } from "react-dom"
import { FileDown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getItemReportPdfPayload } from "@/lib/actions/inventory"
import type { ItemPdfPayload } from "@/lib/item-report-pdf-types"
import type { ReportPeriodParams } from "@/lib/report-period"
import { countryFlagCdnUrl } from "@/lib/supplier-country"

const C = {
  bg: "#ffffff",
  text: "#171717",
  muted: "#525252",
  border: "#d4d4d4",
  cellBorder: "#e5e5e5",
  theadBg: "#f5f5f5",
  red: "#b91c1c",
} as const

function asciiPdfFileName(itemName: string) {
  const safe = itemName.replace(/[^\w\u0600-\u06FF]+/g, "-").slice(0, 40)
  return `etihad-wms-item-${safe || "report"}-${Date.now()}.pdf`
}

type ExportItemPdfButtonProps = {
  itemId: string
  periodParams: ReportPeriodParams
}

export function ExportItemPdfButton(props: ExportItemPdfButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<ItemPdfPayload | null>(null)

  async function exportPdf() {
    setBusy(true)
    try {
      const [{ default: html2canvas }, { jsPDF }, data] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
        getItemReportPdfPayload(props.itemId, props.periodParams),
      ])

      if (data.addsTruncated || data.withdrawsTruncated) {
        toast.warning(
          "تم اقتطاع التقرير: يُصدَّر أول 2000 حركة فقط. راجع التقرير على الشاشة للتفاصيل الكاملة.",
          { duration: 8000 }
        )
      }

      flushSync(() => setPreview(data))

      const el = ref.current
      if (!el) return

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: C.bg,
        logging: false,
      })
      const img = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgW = pageW - margin * 2
      const imgH = (canvas.height * imgW) / canvas.width
      let y = margin
      let remaining = imgH

      pdf.addImage(img, "PNG", margin, y, imgW, imgH)
      remaining -= pageH - margin * 2

      while (remaining > 0) {
        pdf.addPage()
        y = margin - (imgH - remaining)
        pdf.addImage(img, "PNG", margin, y, imgW, imgH)
        remaining -= pageH - margin * 2
      }

      pdf.save(asciiPdfFileName(data.itemName))
    } finally {
      setBusy(false)
    }
  }

  const wrap: CSSProperties = {
    position: "fixed",
    left: -10000,
    top: 0,
    width: 720,
    padding: 24,
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: "Tahoma, Arial, sans-serif",
    fontSize: 14,
    lineHeight: 1.5,
    opacity: 1,
    pointerEvents: "none",
  }
  const thTd: CSSProperties = {
    padding: "8px 10px",
    border: `1px solid ${C.border}`,
    fontSize: 13,
  }
  const tableBase: CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 8 }
  const sectionGap: CSSProperties = { marginBottom: 20 }
  const h1: CSSProperties = { fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }
  const dateLine: CSSProperties = { fontSize: 14, color: C.muted, margin: 0 }
  const h2: CSSProperties = { fontSize: 16, fontWeight: 600, margin: "0 0 8px 0" }
  const h2Red: CSSProperties = { ...h2, color: C.red }
  const emptyMsg: CSSProperties = { fontSize: 14, color: C.muted, margin: 0 }
  const summaryRow: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: `1px solid ${C.cellBorder}`,
    fontSize: 14,
  }

  const d = preview

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="default"
        className="min-h-11 w-full touch-manipulation gap-2 sm:w-auto sm:min-h-9"
        onClick={() => void exportPdf()}
        disabled={busy}
      >
        <FileDown className="size-3.5" />
        {busy ? "جاري التصدير…" : "تصدير تقرير المادة PDF"}
      </Button>

      <div ref={ref} style={wrap} dir="rtl" aria-hidden>
        <div style={{ marginBottom: 16, borderBottom: `2px solid ${C.border}`, paddingBottom: 12 }}>
          <h1 style={h1}>معمل الاتحاد — تقرير مادة</h1>
          <p style={dateLine}>{d?.dateLabel ?? "…"}</p>
        </div>

        <section style={sectionGap}>
          <h2 style={h2}>ملخص الفترة</h2>
          <div>
            <div style={summaryRow}>
              <span>رصيد بداية الفترة</span>
              <span dir="ltr">{d?.openingQty}</span>
            </div>
            <div style={summaryRow}>
              <span>إجمالي الإضافات</span>
              <span dir="ltr">{d?.totalAdded}</span>
            </div>
            <div style={summaryRow}>
              <span>إجمالي السحوبات</span>
              <span dir="ltr">{d?.totalWithdrawn}</span>
            </div>
            <div style={{ ...summaryRow, borderBottom: "none", fontWeight: 700 }}>
              <span>رصيد نهاية الفترة</span>
              <span dir="ltr">{d?.closingQty}</span>
            </div>
          </div>
        </section>

        <section style={sectionGap}>
          <h2 style={h2Red}>الإضافات (مع المورد)</h2>
          {(d?.adds ?? []).length === 0 ? (
            <p style={emptyMsg}>لا إضافات في هذه الفترة.</p>
          ) : (
            <table style={tableBase}>
              <thead>
                <tr style={{ backgroundColor: C.theadBg }}>
                  <th style={{ ...thTd, textAlign: "start" }}>الوقت</th>
                  <th style={{ ...thTd, textAlign: "start" }}>المورد</th>
                  <th style={{ ...thTd, textAlign: "end" }}>الكمية</th>
                </tr>
              </thead>
              <tbody>
                {(d?.adds ?? []).map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>
                      <span dir="ltr">{r.time}</span>
                    </td>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>
                      {(() => {
                        const flagSrc =
                          r.supplierCountryCode != null
                            ? countryFlagCdnUrl(r.supplierCountryCode, 32)
                            : null
                        return flagSrc ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={flagSrc} alt="" width={24} height={18} />
                            <span>{r.supplierName}</span>
                          </span>
                        ) : (
                          r.supplierName
                        )
                      })()}
                    </td>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "end", fontFamily: "monospace" }}>
                      {r.qtyUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={sectionGap}>
          <h2 style={h2}>السحوبات</h2>
          {(d?.withdraws ?? []).length === 0 ? (
            <p style={emptyMsg}>لا سحوبات في هذه الفترة.</p>
          ) : (
            <table style={tableBase}>
              <thead>
                <tr style={{ backgroundColor: C.theadBg }}>
                  <th style={{ ...thTd, textAlign: "start" }}>الوقت</th>
                  <th style={{ ...thTd, textAlign: "end" }}>الكمية</th>
                </tr>
              </thead>
              <tbody>
                {(d?.withdraws ?? []).map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>
                      <span dir="ltr">{r.time}</span>
                    </td>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "end", fontFamily: "monospace" }}>
                      {r.qtyUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  )
}
