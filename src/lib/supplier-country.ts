import type { LocaleData } from "i18n-iso-countries"
import countries from "i18n-iso-countries"
import arLocale from "i18n-iso-countries/langs/ar.json"

countries.registerLocale(arLocale as LocaleData)

const ISO_ALPHA2 = new Set(Object.keys(countries.getAlpha2Codes()))

export type SupplierCountryRow = { code: string; labelAr: string }

function buildAllCountriesForSelect(): SupplierCountryRow[] {
  const keys = Object.keys(countries.getAlpha2Codes())
  const rows: SupplierCountryRow[] = keys.map((code) => {
    const upper = code.toUpperCase()
    const labelAr = countries.getName(upper, "ar") ?? upper
    return {
      code: upper,
      labelAr,
    }
  })
  rows.sort((a, b) => a.labelAr.localeCompare(b.labelAr, "ar"))
  rows.unshift({ code: "OTHER", labelAr: "أخرى / غير محدد" })
  return rows
}

/** كل الدول (ISO alpha-2) + خيار «أخرى» — مرتبة بالاسم العربي */
export const ALL_COUNTRIES_FOR_SELECT: SupplierCountryRow[] = buildAllCountriesForSelect()

export function isValidSupplierCountryCode(code: string): boolean {
  const u = code.trim().toUpperCase()
  if (u === "OTHER") return true
  return u.length === 2 && ISO_ALPHA2.has(u)
}

/** تحويل رمز الدولة إلى إيموجي علم (Unicode regional indicators) — احتياطي عند تعذّر تحميل الصورة */
export function countryCodeToFlag(code: string): string {
  const u = code.trim().toUpperCase()
  if (u === "OTHER" || u.length !== 2 || !/^[A-Z]{2}$/.test(u)) return "🏳️"
  const base = 0x1f1e6
  return [...u].map((c) => String.fromCodePoint(base + c.charCodeAt(0) - 65)).join("")
}

/** رابط PNG لعلم الدولة (عرض ثابت) — يعتمد على flagcdn.com */
export function countryFlagCdnUrl(code: string, widthPx = 40): string | null {
  const u = code.trim().toUpperCase()
  if (u === "OTHER" || u.length !== 2 || !/^[A-Z]{2}$/.test(u)) return null
  return `https://flagcdn.com/w${widthPx}/${u.toLowerCase()}.png`
}

export function supplierCountryLabelAr(code: string): string {
  const u = code.trim().toUpperCase()
  if (u === "OTHER") return "أخرى / غير محدد"
  const n = countries.getName(u, "ar")
  if (n && n.length > 0) return n
  return u
}

/**
 * تطبيع عربي للبحث: لا يلزم نفس شكل الألف/الهمزة/التاء المربوطة…
 * مثال: «ايران» تطابق «إيران»، و«السعوديه» تطابق «السعودية».
 */
export function normalizeArabicForSearch(input: string): string {
  let s = input.normalize("NFC")
  s = s.replace(/[\u0640\u200c\u200d]/g, "") // كشيدة، ZWJ/ZWNJ
  // حركات وتشكيل شائع
  s = s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
  // أشكال الألف والهمزات
  s = s.replace(/\u0622/g, "ا") // آ
  s = s.replace(/\u0623/g, "ا") // أ
  s = s.replace(/\u0625/g, "ا") // إ
  s = s.replace(/\u0671/g, "ا") // ٱ
  s = s.replace(/\u0624/g, "و") // ؤ
  s = s.replace(/\u0626/g, "ي") // ئ
  s = s.replace(/\u0629/g, "ه") // ة → ه
  s = s.replace(/\u0649/g, "ي") // ى → ي
  s = s.replace(/\u06cc/g, "ي") // ی فارسية → ي
  return s.trim().toLowerCase()
}

/** بحث بالاسم العربي (مع تطبيع مرن) أو رمز الدولة (لاتيني) */
export function filterSupplierCountries(query: string): SupplierCountryRow[] {
  const raw = query.trim()
  if (!raw) return ALL_COUNTRIES_FOR_SELECT
  const qLoose = normalizeArabicForSearch(raw)
  const lowerLatin = raw.toLowerCase()
  return ALL_COUNTRIES_FOR_SELECT.filter(({ code, labelAr }) => {
    const labelLoose = normalizeArabicForSearch(labelAr)
    const codeLc = code.toLowerCase()
    const matchCode =
      codeLc.includes(lowerLatin) || lowerLatin.includes(codeLc)
    return (
      labelAr.includes(raw) ||
      (qLoose.length > 0 && labelLoose.includes(qLoose)) ||
      matchCode
    )
  })
}
