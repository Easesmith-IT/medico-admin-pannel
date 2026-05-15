import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motion as appMotion } from "@/styles/motion";

export const PageHero = ({
  title,
  description,
  metadata,
  badges,
  actions,
  className,
}) => {
  return (
    <motion.section
      {...appMotion.sectionReveal}
      className={cn(
        "rounded-[20px] border border-[#DCE6F8] bg-gradient-to-br from-[#0F1F3A] via-[#152A4E] to-[#1B3770] p-5 text-white shadow-[0_20px_52px_rgb(15_23_42_/_0.28)] md:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A8C4FF]">Operations Workspace</p>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-[30px]">{title}</h2>
          {description ? <p className="max-w-3xl text-sm text-[#DBEAFE]/90 md:text-base">{description}</p> : null}
          {metadata ? <div className="flex flex-wrap gap-2 text-xs text-[#BFDBFE]">{metadata}</div> : null}
          {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </motion.section>
  );
};
