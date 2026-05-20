"use client"

import { useMemo, type ReactNode } from "react"
import {
  dayOptions,
  joinYmd,
  MONTH_OPTIONS,
  splitYmd,
  yearOptions,
  type DateParts,
} from "@/lib/date-parts"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const triggerClass = "h-10 w-full min-h-10"

type DayMonthYearPickerProps = {
  value: string
  onChange: (ymd: string) => void
  idPrefix: string
  /** يوم+شهر+سنة | شهر+سنة | سنة فقط */
  mode?: "dmy" | "my" | "y"
}

function DateField({
  label,
  id,
  children,
  className,
}: {
  label: string
  id: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-muted-foreground text-xs font-medium">
        {label}
      </Label>
      {children}
    </div>
  )
}

export function DayMonthYearPicker({
  value,
  onChange,
  idPrefix,
  mode = "dmy",
}: DayMonthYearPickerProps) {
  const parts = splitYmd(value)
  const days = useMemo(() => dayOptions(parts.year, parts.month), [parts.year, parts.month])

  function patch(next: Partial<DateParts>) {
    onChange(joinYmd({ ...parts, ...next }))
  }

  const colCount = mode === "dmy" ? 3 : mode === "my" ? 2 : 1

  return (
    <div
      className={cn(
        "grid w-full items-end gap-3",
        colCount === 3 && "grid-cols-3",
        colCount === 2 && "grid-cols-2",
        colCount === 1 && "grid-cols-1 max-w-[10rem]"
      )}
      dir="rtl"
      aria-label="اختيار التاريخ"
    >
      {mode === "dmy" ? (
        <DateField label="اليوم" id={`${idPrefix}-day`}>
          <Select value={parts.day} onValueChange={(day) => patch({ day })}>
            <SelectTrigger id={`${idPrefix}-day`} className={triggerClass} dir="ltr">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {days.map((d) => (
                <SelectItem key={d} value={d} dir="ltr">
                  {Number(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DateField>
      ) : null}

      {mode !== "y" ? (
        <DateField label="الشهر" id={`${idPrefix}-month`}>
          <Select value={parts.month} onValueChange={(month) => patch({ month })}>
            <SelectTrigger id={`${idPrefix}-month`} className={triggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DateField>
      ) : null}

      <DateField label="السنة" id={`${idPrefix}-year`}>
        <Select value={parts.year} onValueChange={(year) => patch({ year })}>
          <SelectTrigger id={`${idPrefix}-year`} className={triggerClass} dir="ltr">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions().map((y) => (
              <SelectItem key={y} value={y} dir="ltr">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DateField>
    </div>
  )
}
