import { format } from "date-fns"

export type DateParts = { day: string; month: string; year: string }

const MONTH_NAMES = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const

/** اسم الشهر مع رقمه (مثل: أبريل 4) */
export const MONTH_OPTIONS: { value: string; label: string }[] = MONTH_NAMES.map(
  (name, i) => {
    const n = i + 1
    return { value: String(n).padStart(2, "0"), label: `${name} ${n}` }
  }
)

export function splitYmd(ymd: string): DateParts {
  const [y = "", m = "", d = ""] = ymd.split("-")
  return {
    year: y || String(new Date().getFullYear()),
    month: m || "01",
    day: d || "01",
  }
}

export function joinYmd(parts: DateParts): string {
  const year = parts.year.padStart(4, "0").slice(0, 4)
  const month = parts.month.padStart(2, "0").slice(0, 2)
  const day = parts.day.padStart(2, "0").slice(0, 2)
  const maxDay = daysInMonth(Number(year), Number(month))
  const safeDay = String(Math.min(Math.max(1, Number(day) || 1), maxDay)).padStart(2, "0")
  return `${year}-${month}-${safeDay}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function dayOptions(year: string, month: string): string[] {
  const n = daysInMonth(Number(year), Number(month))
  return Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, "0"))
}

export function yearOptions(count = 12): string[] {
  const y = new Date().getFullYear()
  return Array.from({ length: count }, (_, i) => String(y - i))
}

export function todayYmdLocal(): string {
  return format(new Date(), "yyyy-MM-dd")
}

export function yesterdayYmdLocal(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return format(d, "yyyy-MM-dd")
}
