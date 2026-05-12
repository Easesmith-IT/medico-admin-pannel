"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const ServicePartnerDetailsSkeleton = () => {
  return (
    <div className="space-y-5">
      <Skeleton className="h-28 rounded-[24px]" />
      <Skeleton className="h-72 rounded-[32px]" />
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
      </div>
      <Skeleton className="h-12 rounded-[20px]" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <Skeleton className="h-72 rounded-[28px]" />
          <Skeleton className="h-64 rounded-[28px]" />
          <Skeleton className="h-80 rounded-[28px]" />
        </div>
        <Skeleton className="h-[520px] rounded-[24px]" />
      </div>
    </div>
  );
};
