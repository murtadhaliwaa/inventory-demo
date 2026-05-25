import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth/require-user"
import {
  reportSearchParams,
  resolveReportPeriod,
  toReportPeriodFilterInitial,
} from "@/lib/report-period"
import { reportUrlNeedsCanonicalSync } from "@/lib/report-url"
import { PageHeader } from "@/components/layout/page-header"
import { ReportBodySkeleton } from "@/components/reports/report-skeleton"
import {
  ItemReportFiltersBlock,
  ItemReportPdfExportBlock,
} from "./item-report-client-blocks"
import { ItemReportBody } from "./item-report-body"

async function getItemReportTitle(itemId: string) {
  await requireUser()
  return db.item.findUnique({
    where: { id: itemId },
    select: { name: true },
  })
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
  const meta = await getItemReportTitle(itemId)
  if (!meta) notFound()

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
      <PageHeader
        title={`تقرير: ${meta.name}`}
        description={`${period.titleLabel} · ${period.rangeLabel} · ${period.rangeNumeric}`}
      >
        <ItemReportPdfExportBlock itemId={itemId} periodParams={pdfParams} />
      </PageHeader>

      <ItemReportFiltersBlock
        itemId={itemId}
        initial={toReportPeriodFilterInitial(period)}
        activeQuery={canonical}
      />

      <Suspense fallback={<ReportBodySkeleton />}>
        <ItemReportBody itemId={itemId} period={period} reportParams={reportParams} hrefBase={hrefBase} />
      </Suspense>
    </div>
  )
}
