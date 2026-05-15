import { GlassCard } from "@/components/ui/GlassCard";

export const IntelligenceCard = ({ title, children }) => (
  <GlassCard>
    {title ? <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3> : null}
    <div className="mt-3">{children}</div>
  </GlassCard>
);
