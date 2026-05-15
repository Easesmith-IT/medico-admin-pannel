import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motion as appMotion } from "@/styles/motion";

export const MetricCard = ({ label, value, delta, icon: Icon, className }) => {
  return (
    <motion.article
      whileHover={appMotion.hoverLift.whileHover}
      transition={appMotion.hoverLift.transition}
      className={cn(
        "rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_22px_rgb(15_23_42_/_0.06)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#64748B]">{label}</p>
          <p className="text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]">{value}</p>
          {delta ? <p className="text-xs text-[#475569]">{delta}</p> : null}
        </div>
        {Icon ? (
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
    </motion.article>
  );
};
