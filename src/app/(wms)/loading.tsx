import { PageHeaderSkeleton } from "@/components/layout/page-skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function WmsLoading() {
  return (
    <div className="min-w-0 max-w-full space-y-8">
      <PageHeaderSkeleton />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}
