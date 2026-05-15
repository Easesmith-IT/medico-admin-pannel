import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";

export const AnalyticsStrip = ({ metrics = [], className }) => {
  return (
    <section className={cn("grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map((metric) => {
        const { key: metricKey, ...metricProps } = metric;
        return <MetricCard key={metricKey || metric.label} {...metricProps} />;
      })}
    </section>
  );
};
