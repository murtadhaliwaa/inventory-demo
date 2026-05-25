import Link from "next/link"
import { notFound } from "next/navigation"
import { getItemPeriodReport } from "@/lib/actions/inventory"
import { formatDecimalQuantity } from "@/lib/format"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { reportSearchParams, type ResolvedReportPeriod } from "@/lib/report-period"
import type { ReportPeriodParams } from "@/lib/report-period"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertTriangle, Package } from "lucide-react"
import { CountryFlag } from "@/components/inventory/country-flag"
import { dailyMovementToClient } from "@/lib/serialize-inventory"
import { Button } from "@/components/ui/button"
import { ItemReportMovementsBlock } from "./item-report-client-blocks"
import { formatDateTimeDmy, formatLocaleTime } from "@/lib/locale-display"

function periodTimeCell(d: Date, showFull: boolean) {
  if (showFull) {
    return (
      <span dir="ltr" className="inline-block whitespace-nowrap text-xs tabular-nums">
        {formatDateTimeDmy(d)}
      </span>
    )
  }
  return (
    <span dir="ltr" className="inline-block whitespace-nowrap text-xs text-muted-foreground tabular-nums">
      {formatLocaleTime(d)}
    </span>
  )
}

type ItemReportBodyProps = {
  itemId: string
  period: ResolvedReportPeriod
  reportParams: ReportPeriodParams & { movementsPage: number }
  hrefBase: string
}

export async function ItemReportBody({ itemId, period, reportParams, hrefBase }: ItemReportBodyProps) {
  const r = await getItemPeriodReport(itemId, reportParams)
  if (!r) notFound()

  const item = r.item
  const qs = (page: number) => `${hrefBase}?${reportSearchParams(period, { mp: page })}`
  const unit = itemUnitLabelFor(item.unit)
  const periodNoun = period.type === "daily" ? "اليوم" : "الفترة"
  const fmt = (q: { toString: () => string }) => `${formatDecimalQuantity(q)} ${unit}`

  return (
    <>
      <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>
                الوحدة: {unit} · حد الإنذار: {fmt(item.minThreshold)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-2">
            <CardDescription>رصيد بداية الفترة</CardDescription>
            <CardTitle className="font-mono text-xl tabular-nums" dir="ltr">
              {fmt(r.openingBalance?.currentQuantity ?? item.currentQuantity)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-2">
            <CardDescription>إجمالي الإضافات</CardDescription>
            <CardTitle className="font-mono text-xl tabular-nums text-emerald-600 dark:text-emerald-400" dir="ltr">
              +{fmt(r.totalAdded)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="pb-2">
            <CardDescription>إجمالي السحوبات</CardDescription>
            <CardTitle className="font-mono text-xl tabular-nums text-amber-700 dark:text-amber-400" dir="ltr">
              −{fmt(r.totalWithdrawn)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription>رصيد نهاية الفترة</CardDescription>
            <CardTitle className="font-mono text-xl tabular-nums" dir="ltr">
              {fmt(r.closingBalance?.currentQuantity ?? item.currentQuantity)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {r.isLowStock ? (
        <Card className="rounded-2xl border-destructive/60 bg-destructive/5">
          <CardHeader>
            <div className="text-destructive flex items-start justify-between gap-2">
              <div>
                <CardTitle>تنبيه: الرصيد عند أو دون حد الإنذار</CardTitle>
                <CardDescription>حسب الرصيد المحسوب عند نهاية الفترة</CardDescription>
              </div>
              <AlertTriangle className="size-6 shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              الرصيد:{" "}
              <span className="font-mono font-semibold tabular-nums" dir="ltr">
                {fmt(r.closingBalance?.currentQuantity ?? item.currentQuantity)}
              </span>
              {" · "}
              الحد:{" "}
              <span className="font-mono tabular-nums text-muted-foreground" dir="ltr">
                {fmt(item.minThreshold)}
              </span>
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid min-w-0 max-w-full gap-4 lg:grid-cols-2 lg:items-start">
        <Card className="min-w-0 max-w-full rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
          <CardHeader>
            <CardTitle>ملخص الإضافات</CardTitle>
            <CardDescription>إضافات هذه المادة خلال {periodNoun}</CardDescription>
          </CardHeader>
          <CardContent>
            {r.addsTotal === 0 ? (
              <p className="text-muted-foreground text-sm">لا إضافات في هذه الفترة.</p>
            ) : (
              <>
                {r.addsTruncated ? (
                  <p className="text-muted-foreground mb-2 text-xs">
                    عرض أول {r.periodAdds.length} من {r.addsTotal} إضافة.
                  </p>
                ) : null}
                <div className="min-w-0 overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-start">
                          {r.showFullDateTime ? "التاريخ والوقت" : "الساعة"}
                        </TableHead>
                        <TableHead className="text-start">المورد</TableHead>
                        <TableHead className="text-end">كمية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.periodAdds.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-start">
                            {periodTimeCell(new Date(t.createdAt), r.showFullDateTime)}
                          </TableCell>
                          <TableCell className="text-start text-sm">
                            {t.supplier ? (
                              <span className="inline-flex items-center gap-2">
                                <CountryFlag code={t.supplier.countryCode} size={18} />
                                <span className="min-w-0">{t.supplier.name}</span>
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-end font-mono text-sm tabular-nums">
                            {formatDecimalQuantity(t.quantity)} {unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 max-w-full rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
          <CardHeader>
            <CardTitle>ملخص السحوبات</CardTitle>
            <CardDescription>سحوبات هذه المادة خلال {periodNoun}</CardDescription>
          </CardHeader>
          <CardContent>
            {r.withdrawsTotal === 0 ? (
              <p className="text-muted-foreground text-sm">لا سحوبات في هذه الفترة.</p>
            ) : (
              <>
                {r.withdrawsTruncated ? (
                  <p className="text-muted-foreground mb-2 text-xs">
                    عرض أول {r.periodWithdraws.length} من {r.withdrawsTotal} سحب.
                  </p>
                ) : null}
                <div className="min-w-0 overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-start">
                          {r.showFullDateTime ? "التاريخ والوقت" : "الساعة"}
                        </TableHead>
                        <TableHead className="text-end">كمية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.periodWithdraws.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-start">
                            {periodTimeCell(new Date(t.createdAt), r.showFullDateTime)}
                          </TableCell>
                          <TableCell className="text-end font-mono text-sm tabular-nums">
                            {formatDecimalQuantity(t.quantity)} {unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 max-w-full rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
        <CardHeader>
          <CardTitle>كل حركات الفترة</CardTitle>
          <CardDescription>
            إضافة وسحب لهذه المادة — عرض {r.periodMoves.length} من {r.periodMovesTotal} حركة (صفحة{" "}
            {r.movementsPage} من {r.movementsTotalPages}).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ItemReportMovementsBlock
            rows={r.periodMoves.map(dailyMovementToClient)}
            showFullDateTime={r.showFullDateTime}
          />
          {r.movementsTotalPages > 1 ? (
            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
              <span>
                صفحة الحركات {r.movementsPage} / {r.movementsTotalPages}
              </span>
              <div className="flex gap-2">
                {r.movementsPage > 1 ? (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={qs(r.movementsPage - 1)}>السابق</Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" disabled>
                    السابق
                  </Button>
                )}
                {r.movementsPage < r.movementsTotalPages ? (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={qs(r.movementsPage + 1)}>التالي</Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" disabled>
                    التالي
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
