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

/** تاريخ بصيغة يوم/شهر/سنة مع أرقام إنجليزية: 04/04/2025 */
export function formatDateDmy(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = String(d.getFullYear())
  return `${day}/${month}/${year}`
}

export function formatDateDmyLong(d: Date, withWeekday = false): string {
  return formatLocaleDate(d, {
    weekday: withWeekday ? "long" : undefined,
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
