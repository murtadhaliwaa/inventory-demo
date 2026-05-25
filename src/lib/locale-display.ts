/** عربي مع أرقام إنجليزية (1، 2، 3) في كل الواجهة */
export const DISPLAY_LOCALE = "ar-EG-u-nu-latn"

export function formatLocaleDate(
  d: Date,
  opts?: Intl.DateTimeFormatOptions
): string {
  return d.toLocaleDateString(DISPLAY_LOCALE, opts)
}

export function formatLocaleDateTime(
  d: Date,
  opts?: Intl.DateTimeFormatOptions
): string {
  return d.toLocaleString(DISPLAY_LOCALE, opts)
}

export function formatLocaleTime(
  d: Date,
  opts?: Intl.DateTimeFormatOptions
): string {
  return d.toLocaleTimeString(DISPLAY_LOCALE, opts)
}

/** تاريخ بصيغة يوم/شهر/سنة (LTR ثابت): 24/5/2026 */
export function formatDateDmy(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

/** تاريخ ووقت: 24/5/2026 10:59 ص */
export function formatDateTimeDmy(d: Date): string {
  return `${formatDateDmy(d)} ${formatLocaleTime(d, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`
}

export function formatDateDmyLong(d: Date, withWeekday = false): string {
  return formatLocaleDate(d, {
    weekday: withWeekday ? "long" : undefined,
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
