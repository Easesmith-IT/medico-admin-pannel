import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { adminTheme } from "@/styles/theme";
import { motion as appMotion } from "@/styles/motion";

export const WorkspaceHeader = ({ title, subtitle, actions, className, sticky = true }) => {
  return (
    <motion.header
      {...appMotion.fadeUp}
      className={cn(
        "z-30 rounded-[18px] border border-white/60 bg-white/80 px-4 py-3 backdrop-blur-lg md:px-5",
        sticky && "sticky top-[calc(var(--app-header-height)+0.75rem)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className={cn(adminTheme.sectionTitle, "text-[#0F172A]")}>{title}</h1>
          {subtitle ? <p className="text-sm text-[#64748B]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </motion.header>
  );
};
