import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const DetailPageHero = ({
  title,
  subtitle,
  avatar,
  status,
  badges,
  metadata,
  actions,
  backUrl,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-slate-700/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg md:p-8",
        className,
      )}
    >
      {/* Background gradient accent */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Back button */}
      {backUrl && (
        <Link
          href={backUrl}
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      )}

      <div className="relative z-10 space-y-6">
        {/* Header with Avatar & Title */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          {/* Avatar Section */}
          {avatar && (
            <div className="shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg">
                {typeof avatar === "string" ? (
                  <img
                    src={avatar}
                    alt={title}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  avatar
                )}
              </div>
            </div>
          )}

          {/* Title & Info Section */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-slate-300">{subtitle}</p>}
            </div>

            {/* Status & Badges */}
            {(status || badges) && (
              <div className="flex flex-wrap gap-3">
                {status && (
                  <span className="inline-flex items-center rounded-full bg-blue-500/30 px-3 py-1 text-sm font-medium text-blue-100 ring-1 ring-blue-400/40">
                    {status}
                  </span>
                )}
                {badges &&
                  badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-slate-700/50 px-3 py-1 text-sm font-medium text-slate-200 ring-1 ring-slate-600/40"
                    >
                      {badge}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Metadata & Actions Row */}
        {(metadata || actions) && (
          <div className="flex flex-col gap-4 border-t border-slate-700/40 pt-6 md:flex-row md:items-center md:justify-between">
            {/* Metadata */}
            {metadata && (
              <div className="flex flex-wrap gap-6">
                {Array.isArray(metadata)
                  ? metadata.map((item, idx) => (
                      <div key={idx}>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">
                          {item.value}
                        </p>
                      </div>
                    ))
                  : metadata}
              </div>
            )}

            {/* Actions */}
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
        )}
      </div>
    </motion.div>
  );
};
