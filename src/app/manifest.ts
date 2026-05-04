import type { MetadataRoute } from "next"

/** يُستخدم لاختصارات سطح المكتب و«تثبيت التطبيق» — نفس شعار `public/company-logo.png` */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "معمل الاتحاد — نظام إدارة المخازن",
    short_name: "معمل الاتحاد",
    description: "معمل الاتحاد — مواد خام ومنتجات نهائية (بلاستيك وأنابيب)",
    start_url: "/",
    display: "browser",
    dir: "rtl",
    lang: "ar",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    icons: [
      { src: "/company-logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/company-logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  }
}
