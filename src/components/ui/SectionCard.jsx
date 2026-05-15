import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motion as appMotion } from "@/styles/motion";

export const SectionCard = ({ title, description, actions, children, className }) => {
  return (
    <motion.section
      {...appMotion.fadeUp}
      className={cn(
        "rounded-[18px] border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_22px_rgb(15_23_42_/_0.06)] md:p-5",
        className,
      )}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-[#64748B]">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      )}
      <div className="min-w-0">{children}</div>
    </motion.section>
  );
};
