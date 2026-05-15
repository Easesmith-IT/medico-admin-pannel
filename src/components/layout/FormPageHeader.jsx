import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const FormPageHeader = ({ title, description, backUrl, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn("space-y-4", className)}
    >
      {backUrl && (
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        )}
      </div>
    </motion.div>
  );
};
