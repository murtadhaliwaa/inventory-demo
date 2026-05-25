import { ReportBodySkeleton, ReportFiltersSkeleton } from "@/components/reports/report-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div className="min-w-0 max-w-full space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <ReportFiltersSkeleton />
      <ReportBodySkeleton />
    </div>
  )
}
