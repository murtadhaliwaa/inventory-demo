import type { DashboardData } from "@/lib/actions/inventory"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDecimalQuantity } from "@/lib/format"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { cn } from "@/lib/utils"

const headCell = "text-start text-red-800 dark:text-red-300"
const bodyRow =
  "border-red-100 transition-colors duration-100 hover:bg-red-100/45 dark:border-red-900/80 dark:hover:bg-red-950/45"

type Row = DashboardData["lowStock"][number]

export function LowStockPanel({ lowStock }: { lowStock: Row[] }) {
  const hasAlerts = lowStock.length > 0

  return (
    <Card
      className={cn(
        "wms-dashboard-panel flex min-w-0 max-w-full flex-col gap-0 py-6 shadow-none",
        hasAlerts && "wms-dashboard-panel--alert",
        hasAlerts && "bg-red-50/35 dark:bg-red-950/25"
      )}
    >
      <CardHeader
        className={cn(
          "gap-0 pb-3 transition-colors duration-150",
          hasAlerts && "bg-red-50/80 dark:bg-red-950/35"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <CardTitle
              className={cn(
                "leading-snug",
                hasAlerts && "text-red-800 dark:text-red-300"
              )}
            >
              تنبيهات النقص (الحد الأدنى)
            </CardTitle>
            <CardDescription>
              مواد وصلت كميتها إلى حد الإنذار أو دونه — يظهر باللون الأحمر
            </CardDescription>
          </div>
          {hasAlerts ? (
            <AlertTriangle
              className="size-6 shrink-0 text-red-600 dark:text-red-400"
              aria-hidden
            />
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="min-w-0 px-3 sm:px-6">
        {!hasAlerts ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            لا يوجد تنبيه — المخزون فوق حدود الأمان.
          </p>
        ) : (
          <Table className="w-max min-w-full">
            <TableHeader>
              <TableRow className="border-red-200/90 hover:bg-transparent dark:border-red-900/70">
                <TableHead className={headCell}>المادة</TableHead>
                <TableHead className={headCell}>الوحدة</TableHead>
                <TableHead className={cn(headCell, "text-end")}>رصيد</TableHead>
                <TableHead className={cn(headCell, "text-end text-red-800/85 dark:text-red-400/85")}>
                  حد إنذار
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((i) => (
                <TableRow key={i.id} className={cn(bodyRow, "bg-red-50/65 dark:bg-red-950/40")}>
                  <TableCell className="text-start font-medium text-red-950 dark:text-red-100">
                    {i.name}
                  </TableCell>
                  <TableCell className="text-start align-middle">
                    <Badge
                      variant="outline"
                      className="border-red-300 text-xs text-red-900 dark:border-red-700 dark:text-red-100"
                    >
                      {itemUnitLabelFor(i.unit)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end font-mono text-sm font-semibold tabular-nums text-red-800 dark:text-red-200">
                    {formatDecimalQuantity(i.currentQuantity)} {itemUnitLabelFor(i.unit)}
                  </TableCell>
                  <TableCell className="text-end font-mono text-sm tabular-nums text-red-700/95 dark:text-red-300/95">
                    {formatDecimalQuantity(i.minThreshold)} {itemUnitLabelFor(i.unit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
