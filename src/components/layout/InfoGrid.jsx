import { cn } from "@/lib/utils";

export const InfoGrid = ({ items, columns = 2, className }) => {
  return (
    <div
      className={cn(
        `grid gap-6`,
        {
          "grid-cols-1": columns === 1,
          "grid-cols-1 sm:grid-cols-2": columns === 2,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3": columns === 3,
        },
        className,
      )}
    >
      {items.map((item, idx) => (
        <div key={idx} className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {item.label}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {item.value || "Not provided"}
          </p>
        </div>
      ))}
    </div>
  );
};
