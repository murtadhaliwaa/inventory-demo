import type { Metadata, Viewport } from "next"
import { Baloo_Bhaijaan_2, Geist_Mono } from "next/font/google"
import { AppProviders } from "@/components/providers/app-providers"
import "./globals.css"

/** خط الواجهة الرئيسي — عائلة Baloo مع دعم العربية */
const baloo = Baloo_Bhaijaan_2({
  subsets: ["arabic", "latin"],
  variable: "--font-baloo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "معمل الاتحاد | نظام إدارة المخازن",
  description: "معمل الاتحاد — مواد خام ومنتجات نهائية (بلاستيك وأنابيب)",
  /** أيقونة التبويب — بدون `app/favicon.ico` الافتراضي حتى لا يتجاوز الشعار */
  icons: {
    icon: [{ url: "/company-logo.png", type: "image/png", sizes: "865x646" }],
    shortcut: [{ url: "/company-logo.png", type: "image/png", sizes: "865x646" }],
    apple: [{ url: "/company-logo.png", type: "image/png", sizes: "180x180" }],
  },
}

/** شاشات آمنة + مقياس مناسب للجوال (الشقوق والهوم انديكاتور) */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

/**
 * واجهة RTL + Baloo Bhaijaan 2 + مزوّدات واجهة
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={baloo.variable}>
      <body className={`${baloo.className} ${geistMono.variable} antialiased subpixel-antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
