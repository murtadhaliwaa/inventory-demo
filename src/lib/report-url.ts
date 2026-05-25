import type { ResolvedReportPeriod } from "@/lib/report-period"

type PeriodSearchParams = {
  period?: string
  date?: string
  from?: string
  to?: string
}

/** هل الرابط يحتاج إعادة توجيه لمزامنة query (بدون تأخير الزيارة الأولى بدون معاملات) */
export function reportUrlNeedsCanonicalSync(
  sp: PeriodSearchParams,
  period: ResolvedReportPeriod
): boolean {
  const hasExplicit =
    sp.period != null || sp.date != null || sp.from != null || sp.to != null
  if (!hasExplicit) return false

  const urlPeriod = sp.period ?? "daily"
  if (urlPeriod !== period.type) return true

  if (period.type === "custom") {
    return sp.from !== period.fromInput || sp.to !== period.toInput
  }

  return sp.date != null && sp.date !== period.dateInput
}
