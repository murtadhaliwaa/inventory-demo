"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import { Popover } from "radix-ui"
import { ALL_COUNTRIES_FOR_SELECT, filterSupplierCountries, supplierCountryLabelAr } from "@/lib/supplier-country"
import { CountryFlag } from "@/components/inventory/country-flag"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Props = {
  id: string
  name?: string
  defaultValue?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

function CountryTriggerContent({ code }: { code: string }) {
  return (
    <span className="flex min-w-0 flex-1 items-center justify-start gap-2 text-start">
      <CountryFlag code={code} size={20} className="shrink-0" />
      <span className="min-w-0 truncate">{supplierCountryLabelAr(code)}</span>
    </span>
  )
}

/**
 * اختيار دولة مع بحث — مصمّم للعمل داخل Dialog:
 * - يفتح للأسفل دون قلب للأعلى (تجنّب القصّ عند حافة المتصفح)
 * - z-index أعلى من نافذة الحوار
 * - رأس ثابت مع حقل بحث واضح، والقائمة تمرّر داخل إطار بارتفاع محدود
 */
export function SupplierCountryCombobox({
  id,
  name = "countryCode",
  defaultValue = "SA",
  required = true,
  className,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const [q, setQ] = useState("")
  const listId = useId()
  const searchInputId = `${id}-search`

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const id1 = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) return
        const el = document.getElementById(searchInputId) as HTMLInputElement | null
        el?.focus()
        el?.select()
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(id1)
    }
  }, [open, searchInputId])

  const filtered = useMemo(() => filterSupplierCountries(q), [q])

  return (
    <div className={cn("space-y-0", className)}>
      <input type="hidden" name={name} value={value} required={required} readOnly />
      <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
        <Popover.Trigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listId}
            className="h-auto min-h-9 w-full touch-manipulation justify-between gap-2 px-3 py-2 font-normal"
          >
            <CountryTriggerContent code={value} />
            <ChevronDownIcon
              className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={6}
            avoidCollisions={false}
            className={cn(
              "border-border bg-popover text-popover-foreground z-[200] flex w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-lg border p-0 shadow-lg outline-none",
              "max-h-[min(65dvh,26rem)]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
            )}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="shrink-0 border-b border-border/70 bg-muted/40 px-3 py-2.5">
              <Label htmlFor={searchInputId} className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <SearchIcon className="size-3.5 opacity-80" aria-hidden />
                بحث عن الدولة
              </Label>
              <Input
                id={searchInputId}
                type="search"
                dir="rtl"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="اسم الدولة أو الرمز — يُقبل بدون همزة (مثال: ايران، السعوديه)"
                className="mt-2 h-9 bg-background"
                autoComplete="off"
              />
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-1 [-webkit-overflow-scrolling:touch]"
              role="presentation"
            >
              <ul id={listId} role="listbox" className="space-y-0.5">
                {filtered.length === 0 ? (
                  <li className="px-2 py-8 text-center text-sm text-muted-foreground">
                    لا توجد دولة تطابق البحث
                  </li>
                ) : (
                  filtered.map(({ code, labelAr }) => (
                    <li key={code} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={value === code}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-sm transition-colors",
                          value === code ? "bg-primary/15 text-foreground" : "hover:bg-muted/90"
                        )}
                        onClick={() => {
                          setValue(code)
                          setOpen(false)
                          setQ("")
                        }}
                      >
                        <CountryFlag code={code} size={20} className="shrink-0" />
                        <span className="min-w-0 flex-1 leading-snug">{labelAr}</span>
                        {code !== "OTHER" ? (
                          <span
                            className="rounded bg-muted/80 px-1 py-0.5 font-mono text-[10px] text-muted-foreground tabular-nums shrink-0"
                            dir="ltr"
                          >
                            {code}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="shrink-0 border-t border-border/60 bg-muted/20 px-2 py-1.5 text-center text-[10px] text-muted-foreground">
              {filtered.length === ALL_COUNTRIES_FOR_SELECT.length
                ? `${ALL_COUNTRIES_FOR_SELECT.length} دولة — اكتب للتصفية`
                : `${filtered.length} من ${ALL_COUNTRIES_FOR_SELECT.length}`}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
