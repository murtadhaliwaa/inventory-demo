"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import type { DailyPdfPayload } from "@/lib/daily-report-pdf-types"
import type { ReportPeriodFilterInitial, ReportPeriodParams } from "@/lib/report-period"
import type { DailyMovementForClient } from "@/lib/serialize-inventory"

const ReportPeriodFilters = dynamic(
  () =>
    import("@/components/reports/report-period-filters").then((m) => m.ReportPeriodFilters),
  { ssr: false, loading: () => <p className="text-muted-foreground text-sm">جاري تحميل الفلاتر…</p> }
)

const DailyAllMovements = dynamic(
  () => import("./report-tables").then((m) => m.DailyAllMovements),
  { ssr: false, loading: () => <p className="text-muted-foreground text-sm">جاري تحميل الجدول…</p> }
)

const ExportDailyPdfButton = dynamic(
  () => import("./daily-report-pdf-button").then((m) => m.ExportDailyPdfButton),
  {
    ssr: false,
    loading: () => (
      <Button type="button" variant="outline" disabled className="min-h-11 w-full sm:w-auto">
        تصدير التقرير PDF
      </Button>
    ),
  }
)

export function ReportFiltersBlock(props: {
  initial: ReportPeriodFilterInitial
  activeQuery: string
}) {
  return <ReportPeriodFilters {...props} />
}

export function ReportMovementsBlock(props: {
  rows: DailyMovementForClient[]
  showFullDateTime: boolean
}) {
  return <DailyAllMovements {...props} />
}

export function ReportPdfExportBlock(props: {
  periodParams: ReportPeriodParams
  payload: DailyPdfPayload
  exportKey: string
}) {
  return (
    <ExportDailyPdfButton
      key={props.exportKey}
      periodParams={props.periodParams}
      payload={props.payload}
    />
  )
}
