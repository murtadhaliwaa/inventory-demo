"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { countryCodeToFlag, countryFlagCdnUrl } from "@/lib/supplier-country"
import { cn } from "@/lib/utils"

type Props = {
  code: string
  /** ارتفاع الصورة بالبكسل (تقريبي) */
  size?: number
  className?: string
}

/**
 * علم الدولة كصورة (CDN) — يعمل على ويندوز حيث إيموجي الأعلام لا يظهر كعلم.
 * عند OTHER أو فشل التحميل: أيقونة كرة أرضية أو إيموجي احتياطي.
 */
export function CountryFlag({ code, size = 18, className }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const u = code.trim().toUpperCase()
  const src = countryFlagCdnUrl(u, Math.max(28, Math.round(size * 2)))
  const useImage = src !== null && !imgFailed

  if (u === "OTHER" || src === null) {
    return (
      <Globe
        className={cn("shrink-0 text-muted-foreground", className)}
        aria-hidden
        style={{ width: size * 1.15, height: size * 1.15 }}
      />
    )
  }

  if (!useImage) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center text-lg leading-none [font-family:system-ui,'Segoe_UI_Emoji','Apple_Color_Emoji',sans-serif]",
          className
        )}
        aria-hidden
      >
        {countryCodeToFlag(u)}
      </span>
    )
  }

  return (
    <>
      {/* صور خارجية (flagcdn) — بدون next/image لتفادي remotePatterns */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={Math.round((size * 4) / 3)}
        height={size}
        className={cn(
          "inline-block shrink-0 rounded-sm border border-border/50 object-cover align-middle shadow-sm",
          className
        )}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
      />
    </>
  )
}
