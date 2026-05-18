"use client";

import { motion } from "framer-motion";
import { ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function OverlayLoader({
  active,
  label = "Processing operational request...",
  stage,
  className,
  inline = false,
  viewportCentered = false,
}) {
  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "absolute inset-0 z-40 flex justify-center rounded-[20px] border border-white/35 bg-white/40 p-4 backdrop-blur-md",
        viewportCentered ? "items-start" : "items-center",
        inline ? "rounded-[16px]" : "",
        className,
      )}
    >
      <div
        className={cn(
          "min-w-[260px] rounded-2xl border border-[#DBEAFE] bg-white/85 px-4 py-3 text-center shadow-[0_18px_34px_rgba(15,23,42,0.16)]",
          viewportCentered ? "sticky" : "",
        )}
        style={viewportCentered ? { top: "calc(50vh - 4rem)" } : undefined}
      >
        <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_0_20px_rgba(37,99,235,0.45)]">
          <ActivityIcon className="size-4 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
        {stage ? <p className="mt-1 text-xs text-[#64748B]">{stage}</p> : null}
      </div>
    </motion.div>
  );
}
