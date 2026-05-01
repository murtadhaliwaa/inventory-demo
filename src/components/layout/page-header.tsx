import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  description?: string
  className?: string
  children?: ReactNode
}

/** عنوان صفحة موحّد + وصف + إجراءات اختيارية */
export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="min-w-0 space-y-1.5 text-right">
        <div className="wms-page-accent-line" aria-hidden />
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed sm:text-sm md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {children}
        </div>
      ) : null}
    </div>
  )
}
