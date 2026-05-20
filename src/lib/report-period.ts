import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isValid,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"
import { arEG } from "date-fns/locale"
import { formatDateDmy, formatDateDmyLong } from "@/lib/locale-display"

export type ReportPeriodType = "daily" | "weekly" | "monthly" | "yearly" | "custom"

export type ReportPeriodParams = {
  period?: string
  date?: string
  from?: string
  to?: string
}

export type ResolvedReportPeriod = {
  type: ReportPeriodType
  start: Date
  end: Date
  titleLabel: string
  rangeLabel: string
  /** من — إلى بأرقام واضحة (04/04/2025) */
  rangeNumeric: string
  dateInput: string
  fromInput: string
  toInput: string
}

/** قيم قابلة للتمرير إلى Client Components (بدون Date) */
export type ReportPeriodFilterInitial = Pick<
  ResolvedReportPeriod,
  "type" | "dateInput" | "fromInput" | "toInput"
>

export function toReportPeriodFilterInitial(
  period: ResolvedReportPeriod
): ReportPeriodFilterInitial {
  return {
    type: period.type,
    dateInput: period.dateInput,
    fromInput: period.fromInput,
    toInput: period.toInput,
  }
}

const PERIOD_TYPES: ReportPeriodType[] = ["daily", "weekly", "monthly", "yearly", "custom"]

export const REPORT_PERIOD_OPTIONS: { value: ReportPeriodType; label: string }[] = [
  { value: "daily", label: "يومي" },
  { value: "weekly", label: "أسبوعي" },
  { value: "monthly", label: "شهري" },
  { value: "yearly", label: "سنوي" },
  { value: "custom", label: "فترة مخصصة" },
]

/** YYYY-MM-DD كتقويم محلي (وليس UTC) */
function parseYmd(s: string | undefined, fallback: Date): Date {
  if (!s?.trim()) return fallback
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s.trim())
  if (!m) return fallback
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return isValid(d) ? d : fallback
}

function endOfLocalDay(d: Date): Date {
  const end = new Date(d)
  end.setHours(23, 59, 59, 999)
  return end
}

function startOfLocalDay(d: Date): Date {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  return start
}

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

function formatArDate(d: Date, withWeekday = false): string {
  return formatDateDmyLong(d, withWeekday)
}

/** تاريخ رقمي: يوم/شهر/سنة بأرقام إنجليزية */
export function formatReportDateNumeric(d: Date): string {
  return formatDateDmy(d)
}

export type ReportPeriodPreview = {
  title: string
  fromLabel: string
  toLabel: string
  spanLabel: string
  hint: string
  daysCount: number
}

/** معاينة الفترة قبل الضغط على «عرض التقرير» (للواجهة فقط) */
export function previewReportPeriod(filter: ReportPeriodFilterInitial): ReportPeriodPreview {
  const params: ReportPeriodParams =
    filter.type === "custom"
      ? { period: "custom", from: filter.fromInput, to: filter.toInput }
      : { period: filter.type, date: filter.dateInput }

  const r = resolveReportPeriod(params)
  const fromLabel = formatReportDateNumeric(r.start)
  const toLabel = formatReportDateNumeric(r.end)
  const daysCount =
    Math.floor((r.end.getTime() - r.start.getTime()) / (24 * 60 * 60 * 1000)) + 1

  const hints: Record<ReportPeriodType, string> = {
    daily: "يُعرض تقرير هذا اليوم فقط (من منتصف الليل حتى نهاية اليوم).",
    weekly: "يُحسب الأسبوع الكامل الذي يحتوي اليوم المختار (من السبت إلى الجمعة).",
    monthly: "يُعرض تقرير الشهر كاملاً من أول يوم إلى آخر يوم فيه.",
    yearly: "يُعرض تقرير السنة كاملة من 1 يناير حتى 31 ديسمبر.",
    custom: "يُعرض كل الحركات بين التاريخين اللذين حددتهما.",
  }

  let title = r.titleLabel
  if (r.type === "daily") {
    title = `تقرير يوم ${formatArDate(r.start, true)}`
  } else if (r.type === "monthly") {
    title = `تقرير ${format(r.start, "MMMM yyyy", { locale: arEG })}`
  } else if (r.type === "yearly") {
    title = `تقرير سنة ${format(r.start, "yyyy", { locale: arEG })}`
  }

  return {
    title,
    fromLabel,
    toLabel,
    spanLabel: `${fromLabel} ← ${toLabel}`,
    hint: hints[r.type],
    daysCount,
  }
}

export { todayYmdLocal as todayYmd, yesterdayYmdLocal as yesterdayYmd } from "@/lib/date-parts"

export function isReportPeriodType(v: string | undefined): v is ReportPeriodType {
  return !!v && PERIOD_TYPES.includes(v as ReportPeriodType)
}

function withRangeNumeric(
  row: Omit<ResolvedReportPeriod, "rangeNumeric">
): ResolvedReportPeriod {
  return {
    ...row,
    rangeNumeric: `${formatReportDateNumeric(row.start)} — ${formatReportDateNumeric(row.end)}`,
  }
}

/** يحوّل معاملات الرابط إلى فترة تقرير (توقيت محلي) */
export function resolveReportPeriod(params: ReportPeriodParams): ResolvedReportPeriod {
  const today = new Date()
  const type: ReportPeriodType = isReportPeriodType(params.period) ? params.period : "daily"
  const ref = parseYmd(params.date, today)

  if (type === "custom") {
    const from = startOfLocalDay(parseYmd(params.from, ref))
    const to = endOfLocalDay(parseYmd(params.to, ref))
    const start = from <= to ? from : to
    const end = from <= to ? to : from
    return withRangeNumeric({
      type,
      start,
      end,
      titleLabel: "تقرير فترة مخصصة",
      rangeLabel: `${formatArDate(start)} — ${formatArDate(end)}`,
      dateInput: toYmd(ref),
      fromInput: toYmd(start),
      toInput: toYmd(end),
    })
  }

  if (type === "weekly") {
    const start = startOfWeek(ref, { locale: arEG })
    const end = endOfLocalDay(endOfWeek(ref, { locale: arEG }))
    return withRangeNumeric({
      type,
      start,
      end,
      titleLabel: "تقرير أسبوعي",
      rangeLabel: `${formatArDate(start)} — ${formatArDate(end)}`,
      dateInput: toYmd(ref),
      fromInput: toYmd(start),
      toInput: toYmd(end),
    })
  }

  if (type === "monthly") {
    const start = startOfMonth(ref)
    const end = endOfLocalDay(endOfMonth(ref))
    return withRangeNumeric({
      type,
      start,
      end,
      titleLabel: "تقرير شهري",
      rangeLabel: `${formatArDate(start)} — ${formatArDate(end)}`,
      dateInput: toYmd(ref),
      fromInput: toYmd(start),
      toInput: toYmd(end),
    })
  }

  if (type === "yearly") {
    const start = startOfYear(ref)
    const end = endOfLocalDay(endOfYear(ref))
    return withRangeNumeric({
      type,
      start,
      end,
      titleLabel: "تقرير سنوي",
      rangeLabel: `${formatArDate(start)} — ${formatArDate(end)}`,
      dateInput: toYmd(ref),
      fromInput: toYmd(start),
      toInput: toYmd(end),
    })
  }

  const start = startOfLocalDay(ref)
  const end = endOfLocalDay(ref)
  return withRangeNumeric({
    type: "daily",
    start,
    end,
    titleLabel: "تقرير يومي",
    rangeLabel: formatArDate(start, true),
    dateInput: toYmd(ref),
    fromInput: toYmd(start),
    toInput: toYmd(end),
  })
}

/** بناء query string للتقارير مع الحفاظ على الفترة */
export function reportSearchParams(
  period: ResolvedReportPeriod,
  extra?: { mp?: number }
): string {
  const q = new URLSearchParams()
  q.set("period", period.type)
  if (period.type === "custom") {
    q.set("from", period.fromInput)
    q.set("to", period.toInput)
  } else {
    q.set("date", period.dateInput)
  }
  if (extra?.mp && extra.mp > 1) q.set("mp", String(extra.mp))
  return q.toString()
}
