"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarRange, Info, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { DayMonthYearPicker } from "@/components/ui/day-month-year-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  REPORT_PERIOD_OPTIONS,
  previewReportPeriod,
  type ReportPeriodFilterInitial,
  type ReportPeriodType,
} from "@/lib/report-period"
type ReportPeriodFiltersProps = {
  initial: ReportPeriodFilterInitial
  activeQuery: string
  /** مسار التقرير بدون query (مثل /reports/daily أو /reports/items/abc) */
  hrefBase?: string
}

const selectTriggerClass = "h-10 w-full min-h-10"

function filterState(
  period: ReportPeriodType,
  date: string,
  from: string,
  to: string
): ReportPeriodFilterInitial {
  return { type: period, dateInput: date, fromInput: from, toInput: to }
}

function buildReportQuery(
  period: ReportPeriodType,
  date: string,
  from: string,
  to: string
): string {
  const q = new URLSearchParams()
  q.set("period", period)
  if (period === "custom") {
    q.set("from", from)
    q.set("to", to)
  } else {
    q.set("date", date)
  }
  return q.toString()
}

export function ReportPeriodFilters({
  initial,
  activeQuery,
  hrefBase = "/reports/daily",
}: ReportPeriodFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [period, setPeriod] = useState<ReportPeriodType>(initial.type)
  const [date, setDate] = useState(initial.dateInput)
  const [from, setFrom] = useState(initial.fromInput)
  const [to, setTo] = useState(initial.toInput)

  useEffect(() => {
    setPeriod(initial.type)
    setDate(initial.dateInput)
    setFrom(initial.fromInput)
    setTo(initial.toInput)
  }, [initial.type, initial.dateInput, initial.fromInput, initial.toInput])

  const preview = useMemo(
    () => previewReportPeriod(filterState(period, date, from, to)),
    [period, date, from, to]
  )

  useEffect(() => {
    const next = buildReportQuery(period, date, from, to)
    if (next === activeQuery) return

    const t = window.setTimeout(() => {
      startTransition(() => {
        router.replace(`${hrefBase}?${next}`, { scroll: false })
      })
    }, 300)

    return () => window.clearTimeout(t)
  }, [period, date, from, to, activeQuery, router, hrefBase])

  const dateMode =
    period === "monthly" ? "my" : period === "yearly" ? "y" : period === "custom" ? null : "dmy"

  return (
    <section className="rounded-2xl border border-border/60 bg-card shadow-[var(--wms-surface-elevated)]">
      <div className="border-b border-border/50 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarRange className="size-4" aria-hidden />
            </span>
            <span>اختيار فترة التقرير</span>
          </div>
          {isPending ? (
            <span className="text-muted-foreground flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              جاري التحديث…
            </span>
          ) : (
            <span className="text-muted-foreground rounded-full bg-muted/40 px-2.5 py-1 text-xs">
              تحديث تلقائي
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
          <div className="w-full shrink-0 lg:w-40">
            <Label
              htmlFor="report-period-type"
              className="text-muted-foreground mb-1.5 block text-xs font-medium"
            >
              نوع التقرير
            </Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriodType)}>
              <SelectTrigger id="report-period-type" className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_PERIOD_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {period === "custom" ? (
            <>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-muted-foreground text-xs font-medium">من تاريخ</p>
                <DayMonthYearPicker idPrefix="from" value={from} onChange={setFrom} mode="dmy" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-muted-foreground text-xs font-medium">إلى تاريخ</p>
                <DayMonthYearPicker idPrefix="to" value={to} onChange={setTo} mode="dmy" />
              </div>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              {dateMode ? (
                <DayMonthYearPicker
                  idPrefix={period}
                  value={date}
                  onChange={setDate}
                  mode={dateMode}
                />
              ) : null}
            </div>
          )}
        </div>

        <div
          className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1 space-y-2 text-sm">
              <p className="font-semibold leading-snug text-foreground">{preview.title}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <span>
                  <span className="text-muted-foreground">من </span>
                  <span dir="ltr" className="font-mono tabular-nums" suppressHydrationWarning>
                    {preview.fromLabel}
                  </span>
                </span>
                <span>
                  <span className="text-muted-foreground">إلى </span>
                  <span dir="ltr" className="font-mono tabular-nums" suppressHydrationWarning>
                    {preview.toLabel}
                  </span>
                </span>
                <span className="text-muted-foreground tabular-nums">
                  ({preview.daysCount}{" "}
                  {preview.daysCount === 1 ? "يوم" : preview.daysCount === 2 ? "يومان" : "أيام"})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
