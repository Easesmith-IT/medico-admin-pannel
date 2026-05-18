import { CardLoader } from "@/components/loading/card-loader";
import { SectionLoader } from "@/components/loading/section-loader";

export function TreatmentSkeleton() {
  return (
    <div className="space-y-6">
      <SectionLoader rows={3} />
      <CardLoader count={3} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <SectionLoader rows={8} />
        <SectionLoader rows={6} />
      </div>
    </div>
  );
}
