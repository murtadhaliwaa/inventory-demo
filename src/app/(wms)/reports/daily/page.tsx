import { getDailyReport } from "@/lib/actions/inventory"
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
import { ExportDailyPdfButton, type DailyPdfPayload } from "./daily-report-pdf-button"
import { dailyMovementToClient } from "@/lib/serialize-inventory"

function buildPdfPayload(r: Awaited<ReturnType<typeof getDailyReport>>): DailyPdfPayload {
  const dateLabel = r.dayStart.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const adds = r.todaysAdds.map((t) => ({
    time: new Date(t.createdAt).toLocaleTimeString("ar-EG", { timeStyle: "short" }),
    itemName: t.item.name,
    supplierName: t.supplier?.name ?? "—",
    qtyUnit: `${formatDecimalQuantity(t.quantity)} ${itemUnitLabelFor(t.item.unit)}`,
  }))
  const withdraws = r.todaysWithdraws.map((t) => ({
    time: new Date(t.createdAt).toLocaleTimeString("ar-EG", { timeStyle: "short" }),
    itemName: t.item.name,
    qtyUnit: `${formatDecimalQuantity(t.quantity)} ${itemUnitLabelFor(t.item.unit)}`,
  }))
  const balances = r.endBalances.map((i) => ({
    itemName: i.name,
    qtyUnit: `${formatDecimalQuantity(i.currentQuantity)} ${itemUnitLabelFor(i.unit)}`,
  }))
  return { dateLabel, adds, withdraws, balances }
}

/** تقرير يومي: إضافات مع مورد، سحوبات، تنبيهات، تصدير PDF */
export default async function DailyReportPage() {
  const r = await getDailyReport()
  const pdfPayload = buildPdfPayload(r)
  const dateLabel = r.dayStart.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  return (
    <div className="space-y-8">
      <PageHeader title="تقرير اليوم" description={dateLabel}>
        <ExportDailyPdfButton payload={pdfPayload} />
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
          <CardHeader>
            <CardTitle>ملخص الإضافات اليوم</CardTitle>
            <CardDescription>حركات نوع «إضافة» مع اسم المورد</CardDescription>
          </CardHeader>
          <CardContent>
            {r.todaysAdds.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا إضافات مسجّلة اليوم.</p>
            ) : (
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
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
          <CardHeader>
            <CardTitle>ملخص السحوبات اليوم</CardTitle>
            <CardDescription>حركات نوع «سحب»</CardDescription>
          </CardHeader>
          <CardContent>
            {r.todaysWithdraws.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا سحوبات اليوم.</p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
        <CardHeader>
          <CardTitle>كل حركات اليوم</CardTitle>
          <CardDescription>إضافة وسحب — فلترة من الجدول</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyAllMovements rows={r.todaysAll.map(dailyMovementToClient)} />
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
        <CardHeader>
          <CardTitle>الرصيد الحالي لكل مادة</CardTitle>
          <CardDescription>يُمثّل وضع المخزون بعد حركات اليوم (نهاية اليوم)</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
