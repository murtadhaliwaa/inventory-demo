import Link from "next/link"
import { getDailyReport, getDailyReportPdfPayload } from "@/lib/actions/inventory"
import { formatDecimalQuantity } from "@/lib/format"
import { itemUnitLabelFor } from "@/lib/item-unit"
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
import { PageHeader } from "@/components/layout/page-header"
import { DailyAllMovements } from "./report-tables"
import { ExportDailyPdfButton } from "./daily-report-pdf-button"
import { dailyMovementToClient } from "@/lib/serialize-inventory"
import { Button } from "@/components/ui/button"

/** تقرير يومي: إضافات مع مورد، سحوبات، تنبيهات، تصدير PDF */
export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ mp?: string }>
}) {
  const sp = await searchParams
  const mp = Math.max(1, parseInt(sp.mp ?? "1", 10) || 1)
  const r = await getDailyReport({ movementsPage: mp })
  const dateLabel = r.dayStart.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-8">
      <PageHeader title="تقرير اليوم" description={dateLabel}>
        <ExportDailyPdfButton loadPayload={getDailyReportPdfPayload} />
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
          <CardHeader>
            <CardTitle>ملخص الإضافات اليوم</CardTitle>
            <CardDescription>حركات نوع «إضافة» مع اسم المورد</CardDescription>
          </CardHeader>
          <CardContent>
            {r.addsTotal === 0 ? (
              <p className="text-muted-foreground text-sm">لا إضافات مسجّلة اليوم.</p>
            ) : (
              <>
                {r.addsTruncated ? (
                  <p className="text-muted-foreground mb-2 text-xs">
                    عرض أول {r.todaysAdds.length} من {r.addsTotal} إضافة اليوم.
                  </p>
                ) : null}
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-start">الساعة</TableHead>
                        <TableHead className="text-start">المادة</TableHead>
                        <TableHead className="text-start">المورد</TableHead>
                        <TableHead className="text-end">كمية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.todaysAdds.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-start whitespace-nowrap text-xs text-muted-foreground">
                            <span dir="ltr" className="inline-block">
                              {new Date(t.createdAt).toLocaleTimeString("ar-EG")}
                            </span>
                          </TableCell>
                          <TableCell className="text-start font-medium">
                            {t.item.name}
                            <Badge className="me-1.5 text-[10px]" variant="outline">
                              {itemUnitLabelFor(t.item.unit)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-start text-sm">{t.supplier?.name ?? "—"}</TableCell>
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
        <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
          <CardHeader>
            <CardTitle>ملخص السحوبات اليوم</CardTitle>
            <CardDescription>حركات نوع «سحب»</CardDescription>
          </CardHeader>
          <CardContent>
            {r.withdrawsTotal === 0 ? (
              <p className="text-muted-foreground text-sm">لا سحوبات اليوم.</p>
            ) : (
              <>
                {r.withdrawsTruncated ? (
                  <p className="text-muted-foreground mb-2 text-xs">
                    عرض أول {r.todaysWithdraws.length} من {r.withdrawsTotal} سحب اليوم.
                  </p>
                ) : null}
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-start">الساعة</TableHead>
                        <TableHead className="text-start">المادة</TableHead>
                        <TableHead className="text-end">كمية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.todaysWithdraws.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-start whitespace-nowrap text-xs text-muted-foreground">
                            <span dir="ltr" className="inline-block">
                              {new Date(t.createdAt).toLocaleTimeString("ar-EG")}
                            </span>
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
        <Card className="rounded-2xl border-destructive/60 bg-destructive/5 shadow-[var(--wms-surface-elevated)] lg:col-span-2">
          <CardHeader>
            <div className="text-destructive flex items-start justify-between gap-2">
              <div>
                <CardTitle>تنبيه: وصلت للحد الأدنى أو دونه</CardTitle>
                <CardDescription>مراجعة عاجلة للمخزون</CardDescription>
              </div>
              <AlertTriangle className="size-6 shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            {r.lowStock.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا مواد تحتاج تنبيهاً اليوم.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
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
                          {formatDecimalQuantity(i.currentQuantity)} {itemUnitLabelFor(i.unit)}
                        </TableCell>
                        <TableCell className="text-end font-mono text-sm tabular-nums text-muted-foreground">
                          {formatDecimalQuantity(i.minThreshold)} {itemUnitLabelFor(i.unit)}
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
      <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
        <CardHeader>
          <CardTitle>كل حركات اليوم</CardTitle>
          <CardDescription>
            إضافة وسحب — فلترة من الجدول. عرض {r.todaysMoves.length} من {r.todaysMovesTotal} حركة (صفحة{" "}
            {r.movementsPage} من {r.movementsTotalPages}).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DailyAllMovements rows={r.todaysMoves.map(dailyMovementToClient)} />
          {r.movementsTotalPages > 1 ? (
            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
              <span>
                صفحة الحركات {r.movementsPage} / {r.movementsTotalPages}
              </span>
              <div className="flex gap-2">
                {r.movementsPage > 1 ? (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={`/reports/daily?mp=${r.movementsPage - 1}`}>السابق</Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" disabled>
                    السابق
                  </Button>
                )}
                {r.movementsPage < r.movementsTotalPages ? (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={`/reports/daily?mp=${r.movementsPage + 1}`}>التالي</Link>
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
      <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
        <CardHeader>
          <CardTitle>الرصيد الحالي لكل مادة</CardTitle>
          <CardDescription>يُمثّل وضع المخزون بعد حركات اليوم (نهاية اليوم)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
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
                      {formatDecimalQuantity(i.currentQuantity)} {itemUnitLabelFor(i.unit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
