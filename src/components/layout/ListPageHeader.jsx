import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const ListPageHeader = ({ title, description, actions, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn("space-y-4", className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2 sm:shrink-0">{actions}</div>
        )}
      </div>
    </motion.div>
  );
};
