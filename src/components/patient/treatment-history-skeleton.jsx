import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function TreatmentHistorySkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Info Skeleton */}
        <Card className="col-span-1 lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Skeleton */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader className="flex gap-5 justify-between items-start">
            <CardTitle className="text-2xl font-bold">
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <div className="flex gap-5 items-end">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-xl p-4 shadow-sm border bg-background"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>

                  <Skeleton className="h-5 w-56 mb-3" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-32 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Summary Skeleton */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                <Skeleton className="h-5 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical Snapshot Skeleton */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                <Skeleton className="h-5 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Treatments */}
              <div>
                <Skeleton className="h-4 w-32 mb-3" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-40 mb-2" />
                ))}
              </div>

              <Separator className="my-3" />

              {/* Medications */}
              <div>
                <Skeleton className="h-4 w-32 mb-3" />
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-4 w-36 mb-2" />
                ))}
              </div>

              <Separator className="my-3" />

              {/* Conditions */}
              <div>
                <Skeleton className="h-4 w-40 mb-3" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-44 mb-2" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
