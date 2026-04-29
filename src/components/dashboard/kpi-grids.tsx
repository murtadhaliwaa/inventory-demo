import type { DashboardData } from "@/lib/actions/inventory"
import { AlertTriangle, ClipboardList, Package, TrendingDown, Truck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiRow = {
  label: string
  sub: string
  Icon: LucideIcon
  iconClass?: string
  resolve: (d: DashboardData) => { value: string; danger?: boolean }
}

const PRIMARY_ROW: KpiRow[] = [
  {
    label: "حركات اليوم",
    sub: "إجمالي السجلات",
    Icon: ClipboardList,
    resolve: (d) => ({ value: String(d.todayMovementsCount) }),
  },
  {
    label: "إضافات اليوم",
    sub: "من الموردين",
    Icon: Truck,
    iconClass: "text-primary",
    resolve: (d) => ({ value: String(d.todayAdds) }),
  },
  {
    label: "سحوبات اليوم",
    sub: "صرف مخزون",
    Icon: TrendingDown,
    resolve: (d) => ({ value: String(d.todayWithdraws) }),
  },
  {
    label: "تنبيهات نقص",
    sub: "≤ حد الإنذار",
    Icon: AlertTriangle,
    iconClass: "text-red-600 dark:text-red-500",
    resolve: (d) => ({
      value: String(d.lowStock.length),
      danger: d.lowStock.length > 0,
    }),
  },
]

const SECONDARY_ROW: KpiRow[] = [
  {
    label: "مواد مسجّلة",
    sub: "أصناف",
    Icon: Package,
    resolve: (d) => ({ value: String(d.totalSkus) }),
  },
  {
    label: "موردون",
    sub: "في النظام",
    Icon: Truck,
    iconClass: "text-muted-foreground",
    resolve: (d) => ({ value: String(d.supplierCount) }),
  },
  {
    label: "متابعة",
    sub: "حالة المخزون",
    Icon: AlertTriangle,
    resolve: (d) => ({
      value: d.lowStock.length > 0 ? "عاجل" : "طبيعي",
      danger: d.lowStock.length > 0,
    }),
  },
]

function KpiStat({
  label,
  value,
  sub,
  icon,
  danger,
}: {
  label: string
  value: string
  sub: string
  icon: ReactNode
  danger?: boolean
}) {
  return (
    <Card
      className={cn(
        "wms-stat-card rounded-2xl border-border/60 shadow-none",
        danger && "wms-stat-card--danger border-red-600 dark:border-red-500"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-1 pb-2 pt-4">
        <div className="min-w-0 text-right text-sm text-muted-foreground">
          {label}
          <div
            className={cn(
              "text-2xl font-semibold tracking-tight",
              danger ? "text-red-700 dark:text-red-400" : "text-foreground"
            )}
          >
            {value}
          </div>
          <div className="text-[11px] text-muted-foreground">{sub}</div>
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
            danger
              ? "bg-red-600/12 text-red-700 dark:bg-red-500/15 dark:text-red-300"
              : "bg-muted/50 text-foreground/80 dark:bg-muted/40"
          )}
        >
          {icon}
        </div>
      </CardHeader>
    </Card>
  )
}

function KpiGrid({ rows, data, columns }: { rows: KpiRow[]; data: DashboardData; columns: string }) {
  return (
    <div className={cn("grid gap-3", columns)}>
      {rows.map((row) => {
        const { value, danger } = row.resolve(data)
        return (
          <KpiStat
            key={row.label}
            label={row.label}
            sub={row.sub}
            value={value}
            danger={danger}
            icon={<row.Icon className={cn("size-4", row.iconClass)} aria-hidden />}
          />
        )
      })}
    </div>
  )
}

export function DashboardKpiGrids({ data }: { data: DashboardData }) {
  return (
    <>
      <KpiGrid rows={PRIMARY_ROW} data={data} columns="sm:grid-cols-2 lg:grid-cols-4" />
      <KpiGrid rows={SECONDARY_ROW} data={data} columns="sm:grid-cols-3" />
    </>
  )
}
