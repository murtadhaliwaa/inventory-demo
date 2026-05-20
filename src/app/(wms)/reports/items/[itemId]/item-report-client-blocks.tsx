"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import type { ItemPdfPayload } from "@/lib/item-report-pdf-types"
import type { ReportPeriodFilterInitial, ReportPeriodParams } from "@/lib/report-period"
import type { DailyMovementForClient } from "@/lib/serialize-inventory"

const ReportPeriodFilters = dynamic(
  () =>
    import("@/components/reports/report-period-filters").then((m) => m.ReportPeriodFilters),
  { ssr: false, loading: () => <p className="text-muted-foreground text-sm">جاري تحميل الفلاتر…</p> }
)

const DailyAllMovements = dynamic(
  () => import("../../daily/report-tables").then((m) => m.DailyAllMovements),
  { ssr: false, loading: () => <p className="text-muted-foreground text-sm">جاري تحميل الجدول…</p> }
)

const ExportItemPdfButton = dynamic(
  () => import("./item-report-pdf-button").then((m) => m.ExportItemPdfButton),
  {
    ssr: false,
    loading: () => (
      <Button type="button" variant="outline" disabled className="min-h-11 w-full sm:w-auto">
        تصدير تقرير المادة PDF
      </Button>
    ),
  }
)

export function ItemReportFiltersBlock(props: {
  itemId: string
  initial: ReportPeriodFilterInitial
  activeQuery: string
}) {
  return (
    <ReportPeriodFilters
      initial={props.initial}
      activeQuery={props.activeQuery}
      hrefBase={`/reports/items/${props.itemId}`}
    />
  )
}

export function ItemReportMovementsBlock(props: {
  rows: DailyMovementForClient[]
  showFullDateTime: boolean
}) {
  return <DailyAllMovements {...props} singleItem />
}

export function ItemReportPdfExportBlock(props: {
  itemId: string
  periodParams: ReportPeriodParams
  payload: ItemPdfPayload
  exportKey: string
}) {
  return (
    <ExportItemPdfButton
      key={props.exportKey}
      itemId={props.itemId}
      periodParams={props.periodParams}
      payload={props.payload}
    />
  )
}
