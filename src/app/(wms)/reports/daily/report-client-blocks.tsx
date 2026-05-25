"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ReportPeriodFilters } from "@/components/reports/report-period-filters"
import { DailyAllMovements } from "./report-tables"
import type { ReportPeriodFilterInitial, ReportPeriodParams } from "@/lib/report-period"
import type { DailyMovementForClient } from "@/lib/serialize-inventory"

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
  hrefBase?: string
}) {
  return <ReportPeriodFilters {...props} />
}

export function ReportMovementsBlock(props: {
  rows: DailyMovementForClient[]
  showFullDateTime: boolean
}) {
  return <DailyAllMovements {...props} />
}

export function ReportPdfExportBlock(props: { periodParams: ReportPeriodParams }) {
  return <ExportDailyPdfButton periodParams={props.periodParams} />
}
