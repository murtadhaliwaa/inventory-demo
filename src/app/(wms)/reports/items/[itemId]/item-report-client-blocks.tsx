"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ReportPeriodFilters } from "@/components/reports/report-period-filters"
import { DailyAllMovements } from "../../daily/report-tables"
import type { ReportPeriodFilterInitial, ReportPeriodParams } from "@/lib/report-period"
import type { DailyMovementForClient } from "@/lib/serialize-inventory"

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
}) {
  return <ExportItemPdfButton itemId={props.itemId} periodParams={props.periodParams} />
}
