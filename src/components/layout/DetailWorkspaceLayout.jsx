import { cn } from "@/lib/utils";
import { WorkspaceHeader } from "@/components/ui/WorkspaceHeader";
import { PageHero } from "@/components/ui/PageHero";
import { AnalyticsStrip } from "@/components/ui/AnalyticsStrip";
import { IntelligenceSidebar } from "@/components/ui/IntelligenceSidebar";
import { Timeline } from "@/components/ui/Timeline";

export const DetailWorkspaceLayout = ({
  header,
  hero,
  metrics = [],
  nav,
  main,
  sidebar,
  timeline = [],
  className,
}) => {
  return (
    <div className={cn("space-y-5", className)}>
      {header ? <WorkspaceHeader {...header} /> : null}
      {hero ? <PageHero {...hero} /> : null}
      {metrics.length ? <AnalyticsStrip metrics={metrics} /> : null}
      {nav ? (
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">
          <div className="flex min-w-max items-center gap-2">{nav}</div>
        </div>
      ) : null}

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-5">{main}</section>
        <aside className="min-w-0 space-y-5">
          {sidebar ? <IntelligenceSidebar {...sidebar} /> : null}
          {timeline.length ? (
            <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#475569]">Activity Timeline</h3>
              <Timeline events={timeline} className="mt-3 border-l border-[#DBEAFE] pl-3" />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
