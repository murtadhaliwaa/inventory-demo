"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { flushSync } from "react-dom"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDailyReportPdfPayload } from "@/lib/actions/inventory"
import type { DailyPdfPayload } from "@/lib/daily-report-pdf-types"
import type { ReportPeriodParams } from "@/lib/report-period"
import { countryFlagCdnUrl } from "@/lib/supplier-country"

export type { DailyPdfPayload }

const C = {
  bg: "#ffffff",
  text: "#171717",
  muted: "#525252",
  border: "#d4d4d4",
  cellBorder: "#e5e5e5",
  theadBg: "#f5f5f5",
  red: "#b91c1c",
} as const

function asciiPdfFileName(dateLabel: string) {
  const digits = dateLabel.replace(/[^\d]/g, "").slice(0, 14)
  return `etihad-wms-daily-${digits || Date.now()}.pdf`
}

type ExportDailyPdfButtonProps = {
  periodParams: ReportPeriodParams
  payload: DailyPdfPayload
}

/**
 * تصدير PDF — ألوان hex فقط (html2canvas لا يدعم lab() من Tailwind)
 * العنصر مرئي للرaster (opacity 1) ومزاح خارج الشاشة
 */
function periodParamsKey(p: ReportPeriodParams | undefined): string {
  if (!p) return ""
  return [p.period ?? "", p.date ?? "", p.from ?? "", p.to ?? ""].join("|")
}

export function ExportDailyPdfButton(props: ExportDailyPdfButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<DailyPdfPayload>(props.payload)
  const periodKey = periodParamsKey(props.periodParams)

  useEffect(() => {
    setPreview(props.payload)
  }, [periodKey, props.payload])

  const displayPayload = preview

  async function exportPdf() {
    setBusy(true)
    try {
      const data = await getDailyReportPdfPayload(props.periodParams)

      flushSync(() => {
        setPreview(data)
      })

      const el = ref.current
      if (!el) return
      await document.fonts.ready.catch(() => {})
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

      const w = Math.max(1, el.scrollWidth)
      const h = Math.max(1, el.scrollHeight)
      const maxCanvasPx = 8192
      let scale = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1.5 : 2)
      const estW = w * scale
      const estH = h * scale
      if (estW > maxCanvasPx || estH > maxCanvasPx) {
        scale = Math.min(maxCanvasPx / w, maxCanvasPx / h, scale)
      }

      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: C.bg,
        logging: false,
        foreignObjectRendering: false,
        scrollX: 0,
        scrollY: 0,
      })

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("لم يُحمَل محتوى التقرير للصورة.")
      }

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgWidth = pageWidth - margin * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = margin

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin
        pdf.addPage()
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight)
        heightLeft -= pageHeight - margin * 2
      }

      pdf.save(asciiPdfFileName(data.dateLabel))
    } catch (e) {
      console.error("[PDF export]", e)
      const detail = e instanceof Error ? e.message : String(e)
      window.alert(`تعذّر إنشاء ملف PDF.\n\n${detail}`)
    } finally {
      setBusy(false)
    }
  }

  const wrap: CSSProperties = {
    pointerEvents: "none",
    position: "fixed",
    top: 0,
    left: -10000,
    zIndex: 1,
    width: 794,
    maxWidth: 794,
    boxSizing: "border-box",
    backgroundColor: C.bg,
    color: C.text,
    padding: 24,
    opacity: 1,
    fontFamily: "Tahoma, Arial, Helvetica, sans-serif",
    lineHeight: 1.5,
  }

  const tableBase: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
    color: C.text,
  }

  const thTd: CSSProperties = {
    border: `1px solid ${C.border}`,
    padding: "8px",
  }

  const sectionGap: CSSProperties = { marginTop: 24 }
  const h1: CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: C.text,
  }
  const dateLine: CSSProperties = { fontSize: 14, color: C.muted, margin: "8px 0 0 0" }
  const headerRule: CSSProperties = {
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: 12,
  }
  const h2: CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    margin: "0 0 8px 0",
    color: C.text,
  }
  const h2Red: CSSProperties = { ...h2, color: C.red }
  const emptyMsg: CSSProperties = { fontSize: 14, color: C.muted, margin: 0 }

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
        {busy ? "جاري التصدير…" : "تصدير التقرير PDF"}
      </Button>

      <div ref={ref} style={wrap} dir="rtl" aria-hidden>
        <div style={headerRule}>
          <h1 style={h1}>معمل الاتحاد — تقرير مخزون</h1>
          <p style={dateLine}>{displayPayload?.dateLabel ?? "…"}</p>
        </div>

        <section style={sectionGap}>
          <h2 style={h2Red}>المواد المضافة (مع المورد)</h2>
          {(displayPayload?.adds ?? []).length === 0 ? (
            <p style={emptyMsg}>لا إضافات في هذه الفترة.</p>
          ) : (
            <table style={tableBase}>
              <thead>
                <tr style={{ backgroundColor: C.theadBg }}>
                  <th style={{ ...thTd, textAlign: "start" }}>الوقت</th>
                  <th style={{ ...thTd, textAlign: "start" }}>المادة</th>
                  <th style={{ ...thTd, textAlign: "start" }}>المورد</th>
                  <th style={{ ...thTd, textAlign: "end" }}>الكمية</th>
                </tr>
              </thead>
              <tbody>
                {(displayPayload?.adds ?? []).map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>
                      <span dir="ltr" style={{ display: "inline-block" }}>
                        {r.time}
                      </span>
                    </td>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>{r.itemName}</td>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>
                      {(() => {
                        const flagSrc =
                          r.supplierCountryCode != null
                            ? countryFlagCdnUrl(r.supplierCountryCode, 32)
                            : null
                        return flagSrc ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              verticalAlign: "middle",
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={flagSrc}
                              alt=""
                              width={24}
                              height={18}
                              style={{
                                objectFit: "cover",
                                borderRadius: 3,
                                border: `1px solid ${C.cellBorder}`,
                                flexShrink: 0,
                              }}
                            />
                            <span>{r.supplierName}</span>
                          </span>
                        ) : (
                          r.supplierName
                        )
                      })()}
                    </td>
                    <td
                      style={{
                        ...thTd,
                        borderColor: C.cellBorder,
                        textAlign: "end",
                        fontFamily: "Consolas, monospace",
                      }}
                    >
                      {r.qtyUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={sectionGap}>
          <h2 style={h2}>المواد المسحوبة</h2>
          {(displayPayload?.withdraws ?? []).length === 0 ? (
            <p style={emptyMsg}>لا سحوبات في هذه الفترة.</p>
          ) : (
            <table style={tableBase}>
              <thead>
                <tr style={{ backgroundColor: C.theadBg }}>
                  <th style={{ ...thTd, textAlign: "start" }}>الوقت</th>
                  <th style={{ ...thTd, textAlign: "start" }}>المادة</th>
                  <th style={{ ...thTd, textAlign: "end" }}>الكمية</th>
                </tr>
              </thead>
              <tbody>
                {(displayPayload?.withdraws ?? []).map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>
                      <span dir="ltr" style={{ display: "inline-block" }}>
                        {r.time}
                      </span>
                    </td>
                    <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>{r.itemName}</td>
                    <td
                      style={{
                        ...thTd,
                        borderColor: C.cellBorder,
                        textAlign: "end",
                        fontFamily: "Consolas, monospace",
                      }}
                    >
                      {r.qtyUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={sectionGap}>
          <h2 style={h2}>الرصيد المتبقي لكل مادة (نهاية الفترة)</h2>
          <table style={tableBase}>
            <thead>
              <tr style={{ backgroundColor: C.theadBg }}>
                <th style={{ ...thTd, textAlign: "start" }}>المادة</th>
                <th style={{ ...thTd, textAlign: "end" }}>الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {(displayPayload?.balances ?? []).map((r, i) => (
                <tr key={i}>
                  <td style={{ ...thTd, borderColor: C.cellBorder, textAlign: "start" }}>{r.itemName}</td>
                  <td
                    style={{
                      ...thTd,
                      borderColor: C.cellBorder,
                      textAlign: "end",
                      fontFamily: "Consolas, monospace",
                    }}
                  >
                    {r.qtyUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  )
}
