import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { getItemPeriodReport } from "@/lib/actions/inventory"
import {
  reportSearchParams,
  resolveReportPeriod,
  toReportPeriodFilterInitial,
  type ResolvedReportPeriod,
} from "@/lib/report-period"
import type { ReportPeriodParams } from "@/lib/report-period"
import { reportUrlNeedsCanonicalSync } from "@/lib/report-url"
import { PageHeader } from "@/components/layout/page-header"
import { ReportBodySkeleton } from "@/components/reports/report-skeleton"
import {
  ItemReportFiltersBlock,
  ItemReportPdfExportBlock,
} from "./item-report-client-blocks"
import { ItemReportBody } from "./item-report-body"

type ItemReportPageContentProps = {
  itemId: string
  period: ResolvedReportPeriod
  reportParams: ReportPeriodParams & { movementsPage: number }
  hrefBase: string
  pdfParams: ReportPeriodParams
  canonical: string
}

async function ItemReportPageContent({
  itemId,
  period,
  reportParams,
  hrefBase,
  pdfParams,
  canonical,
}: ItemReportPageContentProps) {
  const report = await getItemPeriodReport(itemId, reportParams)
  if (!report) notFound()

  return (
    <>
      <PageHeader
        title={`تقرير: ${report.item.name}`}
        description={`${period.titleLabel} · ${period.rangeLabel} · ${period.rangeNumeric}`}
      >
        <ItemReportPdfExportBlock itemId={itemId} periodParams={pdfParams} />
      </PageHeader>

      <ItemReportFiltersBlock
        itemId={itemId}
        initial={toReportPeriodFilterInitial(period)}
        activeQuery={canonical}
      />

      <ItemReportBody
        itemId={itemId}
        period={period}
        reportParams={reportParams}
        hrefBase={hrefBase}
        preloaded={report}
      />
    </>
  )
}

export default async function ItemReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ itemId: string }>
  searchParams: Promise<{ mp?: string; period?: string; date?: string; from?: string; to?: string }>
}) {
  const { itemId } = await params
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
  const hrefBase = `/reports/items/${itemId}`

  if (reportUrlNeedsCanonicalSync(sp, period)) {
    const mpSuffix = mp > 1 ? `&mp=${mp}` : ""
    redirect(`${hrefBase}?${canonical}${mpSuffix}`)
  }

  const pdfParams = {
    period: period.type,
    date: period.dateInput,
    from: period.fromInput,
    to: period.toInput,
  }

  return (
    <div className="min-w-0 max-w-full space-y-8">
      <Suspense fallback={<ReportBodySkeleton />}>
        <ItemReportPageContent
          itemId={itemId}
          period={period}
          reportParams={reportParams}
          hrefBase={hrefBase}
          pdfParams={pdfParams}
          canonical={canonical}
        />
      </Suspense>
    </div>
  )
}
