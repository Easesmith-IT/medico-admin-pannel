import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

export const IntelligenceSidebar = ({ title = "Intelligence", items = [], footer, className }) => {
  return (
    <aside className={cn("space-y-3", className)}>
      <GlassCard>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#475569]">{title}</h3>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id || item.label} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2">
              <p className="text-xs font-semibold text-[#334155]">{item.label}</p>
              <p className="mt-0.5 text-sm text-[#0F172A]">{item.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>
      {footer ? <GlassCard>{footer}</GlassCard> : null}
    </aside>
  );
};
