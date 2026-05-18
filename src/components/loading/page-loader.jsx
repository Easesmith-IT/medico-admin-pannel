import { CardLoader } from "@/components/loading/card-loader";
import { SectionLoader } from "@/components/loading/section-loader";
import { TableLoader } from "@/components/loading/table-loader";
import { cn } from "@/lib/utils";

export function PageLoader({ className }) {
  return (
    <div className={cn("space-y-5", className)}>
      <CardLoader />
      <SectionLoader rows={4} />
      <div className="relative app-glass p-4">
        <div className="h-10 opacity-0" />
        <TableLoader active rows={6} columns={8} className="!rounded-[18px] !bg-transparent !p-0" />
      </div>
    </div>
  );
}
