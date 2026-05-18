import { CardLoader } from "@/components/loading/card-loader";
import { SectionLoader } from "@/components/loading/section-loader";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <CardLoader count={4} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionLoader rows={5} className="lg:col-span-2" />
        <SectionLoader rows={5} />
      </div>
    </div>
  );
}
