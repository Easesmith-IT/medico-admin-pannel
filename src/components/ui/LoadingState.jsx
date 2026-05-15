import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const LoadingState = ({ variant = "list", className, rows = 5 }) => {
  if (variant === "card") {
    return (
      <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4", className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-20" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-xl" />
      ))}
    </div>
  );
};
