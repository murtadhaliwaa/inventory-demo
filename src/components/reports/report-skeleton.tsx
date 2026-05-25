import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ReportFiltersSkeleton() {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <Skeleton className="h-10 w-full lg:w-40" />
        <Skeleton className="h-10 min-w-0 flex-1" />
      </div>
      <Skeleton className="mt-4 h-16 w-full rounded-xl" />
    </section>
  )
}

export function ReportBodySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
