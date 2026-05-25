import { Suspense } from "react"
import { redirect } from "next/navigation"
import {
  reportSearchParams,
  resolveReportPeriod,
  toReportPeriodFilterInitial,
} from "@/lib/report-period"
import { reportUrlNeedsCanonicalSync } from "@/lib/report-url"
import { PageHeader } from "@/components/layout/page-header"
import { ReportBodySkeleton } from "@/components/reports/report-skeleton"
import {
  ReportFiltersBlock,
  ReportPdfExportBlock,
} from "./report-client-blocks"
import { DailyReportBody } from "./report-body"

/** تقرير مخزون حسب الفترة: يومي / أسبوعي / شهري / سنوي / مخصص */
export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ mp?: string; period?: string; date?: string; from?: string; to?: string }>
}) {
  const sp = await searchParams
  const mp = Math.max(1, parseInt(sp.mp ?? "1", 10) || 1)
  const period = resolveReportPeriod(sp)
  const reportParams = {
    period: period.type,
    date: period.dateInput,
    from: period.fromInput,
    to: period.toInput,
    movementsPage: mp,
  }
  const canonical = reportSearchParams(period)

  if (reportUrlNeedsCanonicalSync(sp, period)) {
    const mpSuffix = mp > 1 ? `&mp=${mp}` : ""
    redirect(`/reports/daily?${canonical}${mpSuffix}`)
  }

  const pdfParams = {
    period: period.type,
    date: period.dateInput,
    from: period.fromInput,
    to: period.toInput,
  }

  return (
    <div className="min-w-0 max-w-full space-y-8">
      <PageHeader
        title={period.titleLabel}
        description={`${period.rangeLabel} · ${period.rangeNumeric}`}
      >
        <ReportPdfExportBlock periodParams={pdfParams} />
      </PageHeader>

      <ReportFiltersBlock
        initial={toReportPeriodFilterInitial(period)}
        activeQuery={canonical}
      />

      <Suspense fallback={<ReportBodySkeleton />}>
        <DailyReportBody period={period} reportParams={reportParams} />
      </Suspense>
    </div>
  )
}
