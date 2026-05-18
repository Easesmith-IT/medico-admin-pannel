import { cn } from "@/lib/utils";

export function SectionLoader({ rows = 6, className }) {
  return (
    <div className={cn("app-glass relative overflow-hidden p-4", className)}>
      <div className="skeleton-line mb-4 h-4 w-48" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="skeleton-line h-10 w-full rounded-xl" />
        ))}
      </div>
      <div className="skeleton-glow" />
    </div>
  );
}
