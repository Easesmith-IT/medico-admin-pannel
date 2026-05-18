import { cn } from "@/lib/utils";

export function CardLoader({ count = 4, className }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="app-glass relative overflow-hidden p-4">
          <div className="skeleton-line mb-3 h-3 w-20" />
          <div className="skeleton-line mb-3 h-7 w-24" />
          <div className="skeleton-line h-3 w-full" />
          <div className="skeleton-glow" />
        </div>
      ))}
    </div>
  );
}
