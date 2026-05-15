import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const DetailSection = ({
  title,
  description,
  actions,
  children,
  className,
  variant = "default",
}) => {
  const isElevated = variant === "elevated";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        "rounded-[18px] border bg-white p-6",
        isElevated
          ? "border-slate-200 shadow-lg"
          : "border-slate-200 shadow-sm",
        className,
      )}
    >
      {/* Header */}
      {(title || actions) && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0">{children}</div>
    </motion.div>
  );
};
