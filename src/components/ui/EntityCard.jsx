import { cn } from "@/lib/utils";
import { OperationalBadge } from "@/components/ui/OperationalBadge";

export const EntityCard = ({ title, subtitle, status, meta = [], actions, className }) => {
  return (
    <article className={cn("rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_18px_rgb(15_23_42_/_0.05)]", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-[#0F172A]">{title}</h4>
          {subtitle ? <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p> : null}
        </div>
        {status ? <OperationalBadge status={status} /> : null}
      </div>
      {meta.length ? (
        <div className="mt-3 grid gap-1 text-xs text-[#64748B]">
          {meta.map((item) => (
            <p key={item.label}><span className="font-semibold text-[#475569]">{item.label}:</span> {item.value}</p>
          ))}
        </div>
      ) : null}
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
};
