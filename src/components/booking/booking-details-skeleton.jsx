import { Skeleton } from "@/components/ui/skeleton";

export const BookingDetailsSkeleton = () => {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/40 bg-white/80 p-3">
        <Skeleton className="h-5 w-56" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <Skeleton className="h-56 w-full rounded-[32px]" />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-36 w-full rounded-2xl" />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
