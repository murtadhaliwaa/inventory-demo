import type { DashboardData } from "@/lib/actions/inventory"
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
import { formatDecimalQuantity, directionLabelFromTransactionType } from "@/lib/format"
import { formatLocaleDateTime } from "@/lib/locale-display"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { TransactionType } from "@/generated/prisma"
import { CountryFlag } from "@/components/inventory/country-flag"

type Tx = DashboardData["recentTransactions"][number]

const rowHover =
  "border-border/50 transition-colors duration-100 hover:bg-muted/[0.45] dark:hover:bg-muted/25"

export function RecentMovementsPanel({ transactions }: { transactions: Tx[] }) {
  return (
    <Card className="wms-dashboard-panel flex min-w-0 max-w-full flex-col gap-0 py-6 shadow-none">
      <CardHeader className="gap-0 pb-3">
        <CardTitle className="leading-snug">أحدث الحركات</CardTitle>
        <CardDescription>آخر التحديثات على المخزون</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-3 sm:px-6">
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-sm leading-relaxed">لا توجد حركات بعد.</p>
        ) : (
          <div className="max-h-72 max-w-full min-w-0 overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch] touch-pan-x touch-pan-y">
            <Table className="w-max min-w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-start">الزمن</TableHead>
                  <TableHead className="text-start">المادة</TableHead>
                  <TableHead className="text-start">النوع</TableHead>
                  <TableHead className="text-end">كمية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((l) => (
                  <TableRow key={l.id} className={rowHover}>
                    <TableCell className="text-start whitespace-nowrap text-xs text-muted-foreground">
                      <span dir="ltr" className="inline-block">
                        {formatLocaleDateTime(new Date(l.createdAt), {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-start whitespace-nowrap text-sm text-foreground">
                      {l.item.name}
                    </TableCell>
                    <TableCell className="text-start align-top">
                      <div className="flex flex-col items-start gap-0.5">
                        <Badge
                          variant={l.type === TransactionType.ADD ? "default" : "secondary"}
                          className="text-xs font-medium"
                        >
                          {directionLabelFromTransactionType(l.type)}
                        </Badge>
                        {l.type === TransactionType.ADD && l.supplier ? (
                          <span className="inline-flex max-w-none items-center gap-0.5 text-[10px] leading-tight whitespace-nowrap text-muted-foreground">
                            <span className="me-0.5 shrink-0" aria-hidden>
                              <CountryFlag code={l.supplier.countryCode} size={14} />
                            </span>
                            <span className="min-w-0">{l.supplier.name}</span>
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-end font-mono text-sm tabular-nums text-foreground">
                      {formatDecimalQuantity(l.quantity)} {itemUnitLabelFor(l.item.unit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
