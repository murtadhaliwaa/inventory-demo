import Link from "next/link"
import { getDailyReport } from "@/lib/actions/inventory"
import { formatDecimalQuantity } from "@/lib/format"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { reportSearchParams, type ResolvedReportPeriod } from "@/lib/report-period"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertTriangle } from "lucide-react"
import { CountryFlag } from "@/components/inventory/country-flag"
import { dailyMovementToClient } from "@/lib/serialize-inventory"
import { Button } from "@/components/ui/button"
import { ReportMovementsBlock } from "./report-client-blocks"
import { formatDateTimeDmy, formatLocaleTime } from "@/lib/locale-display"
import type { ReportPeriodParams } from "@/lib/report-period"

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

type DailyReportBodyProps = {
  period: ResolvedReportPeriod
  reportParams: ReportPeriodParams & { movementsPage: number }
}

export async function DailyReportBody({ period, reportParams }: DailyReportBodyProps) {
  const r = await getDailyReport(reportParams)
  const qs = (page: number) => `/reports/daily?${reportSearchParams(period, { mp: page })}`
  const periodNoun = period.type === "daily" ? "اليوم" : "الفترة"

  return (
    <>
      <div className="grid min-w-0 max-w-full gap-4 lg:grid-cols-2 lg:items-start">
        <Card className="min-w-0 max-w-full rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
          <CardHeader>
            <CardTitle>ملخص الإضافات</CardTitle>
            <CardDescription>حركات نوع «إضافة» مع اسم المورد خلال {periodNoun}</CardDescription>
          </CardHeader>
          <CardContent>
            {r.addsTotal === 0 ? (
              <p className="text-muted-foreground text-sm">لا إضافات مسجّلة في هذه الفترة.</p>
            ) : (
              <>
                {r.addsTruncated ? (
                  <p className="text-muted-foreground mb-2 text-xs">
                    عرض أول {r.todaysAdds.length} من {r.addsTotal} إضافة.
                  </p>
                ) : null}
                <div className="min-w-0 overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-start">
                          {r.showFullDateTime ? "التاريخ والوقت" : "الساعة"}
                        </TableHead>
                        <TableHead className="text-start">المادة</TableHead>
                        <TableHead className="text-start">المورد</TableHead>
                        <TableHead className="text-end">كمية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.todaysAdds.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-start">
                            {periodTimeCell(new Date(t.createdAt), r.showFullDateTime)}
                          </TableCell>
                          <TableCell className="text-start font-medium">
                            {t.item.name}
                            <Badge className="me-1.5 text-[10px]" variant="outline">
                              {itemUnitLabelFor(t.item.unit)}
                            </Badge>
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
                            {formatDecimalQuantity(t.quantity)} {itemUnitLabelFor(t.item.unit)}
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
            <CardDescription>حركات نوع «سحب» خلال {periodNoun}</CardDescription>
          </CardHeader>
          <CardContent>
            {r.withdrawsTotal === 0 ? (
              <p className="text-muted-foreground text-sm">لا سحوبات في هذه الفترة.</p>
            ) : (
              <>
                {r.withdrawsTruncated ? (
                  <p className="text-muted-foreground mb-2 text-xs">
                    عرض أول {r.todaysWithdraws.length} من {r.withdrawsTotal} سحب.
                  </p>
                ) : null}
                <div className="min-w-0 overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-start">
                          {r.showFullDateTime ? "التاريخ والوقت" : "الساعة"}
                        </TableHead>
                        <TableHead className="text-start">المادة</TableHead>
                        <TableHead className="text-end">كمية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.todaysWithdraws.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-start">
                            {periodTimeCell(new Date(t.createdAt), r.showFullDateTime)}
                          </TableCell>
                          <TableCell className="text-start font-medium">{t.item.name}</TableCell>
                          <TableCell className="text-end font-mono text-sm tabular-nums">
                            {formatDecimalQuantity(t.quantity)} {itemUnitLabelFor(t.item.unit)}
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
        <Card className="min-w-0 max-w-full rounded-2xl border-destructive/60 bg-destructive/5 shadow-[var(--wms-surface-elevated)] lg:col-span-2">
          <CardHeader>
            <div className="text-destructive flex items-start justify-between gap-2">
              <div>
                <CardTitle>تنبيه: وصلت للحد الأدنى أو دونه</CardTitle>
                <CardDescription>حسب الرصيد عند نهاية الفترة</CardDescription>
              </div>
              <AlertTriangle className="size-6 shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            {r.lowStock.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا مواد تحتاج تنبيهاً في نهاية هذه الفترة.</p>
            ) : (
              <div className="min-w-0 overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start">المادة</TableHead>
                      <TableHead className="text-start">الوحدة</TableHead>
                      <TableHead className="text-end">رصيد</TableHead>
                      <TableHead className="text-end">حد الإنذار</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {r.lowStock.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="max-w-40 text-start font-medium text-destructive" title={i.name}>
                          {i.name}
                        </TableCell>
                        <TableCell className="text-start align-middle">
                          <Badge variant="outline" className="text-xs">
                            {itemUnitLabelFor(i.unit)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end font-mono text-sm tabular-nums text-destructive">
                          {formatDecimalQuantity(i.currentQuantity)}
                        </TableCell>
                        <TableCell className="text-end font-mono text-sm tabular-nums text-muted-foreground">
                          {formatDecimalQuantity(i.minThreshold)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="min-w-0 max-w-full rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
        <CardHeader>
          <CardTitle>كل حركات الفترة</CardTitle>
          <CardDescription>
            إضافة وسحب — فلترة من الجدول. عرض {r.todaysMoves.length} من {r.todaysMovesTotal} حركة (صفحة{" "}
            {r.movementsPage} من {r.movementsTotalPages}).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ReportMovementsBlock
            rows={r.todaysMoves.map(dailyMovementToClient)}
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
      <Card className="min-w-0 max-w-full rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
        <CardHeader>
          <CardTitle>الرصيد عند نهاية الفترة</CardTitle>
          <CardDescription>وضع المخزون المحسوب بعد حركات الفترة المحددة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-w-0 overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">المادة</TableHead>
                  <TableHead className="text-start">الوحدة</TableHead>
                  <TableHead className="text-end">الرصيد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {r.endBalances.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="text-start font-medium">{i.name}</TableCell>
                    <TableCell className="text-start align-middle">
                      <Badge variant="secondary" className="text-xs">
                        {itemUnitLabelFor(i.unit)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end font-mono text-sm tabular-nums">
                      {formatDecimalQuantity(i.currentQuantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
