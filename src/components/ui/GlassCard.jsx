import { cn } from "@/lib/utils";

export const GlassCard = ({ className, children }) => {
  return (
    <div className={cn("rounded-[18px] border border-white/70 bg-white/75 p-4 backdrop-blur-xl shadow-[0_12px_30px_rgb(15_23_42_/_0.08)]", className)}>
      {children}
    </div>
  );
};
