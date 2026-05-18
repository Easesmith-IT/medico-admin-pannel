"use client";

import { ActivityIcon, AlertTriangleIcon, CheckCircle2Icon, Loader2Icon, RefreshCwIcon, WorkflowIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tones = {
  syncing: {
    ring: "ring-[#93C5FD]/70 border-[#BFDBFE]/70 bg-[#EFF6FF]/85 text-[#1E40AF]",
    dot: "bg-[#2563EB]",
    Icon: ActivityIcon,
  },
  refreshing: {
    ring: "ring-[#93C5FD]/70 border-[#BFDBFE]/70 bg-[#EEF2FF]/85 text-[#1D4ED8]",
    dot: "bg-[#3B82F6]",
    Icon: RefreshCwIcon,
  },
  processing: {
    ring: "ring-[#FDBA74]/70 border-[#FED7AA]/70 bg-[#FFF7ED]/90 text-[#C2410C]",
    dot: "bg-[#EA580C]",
    Icon: WorkflowIcon,
  },
  success: {
    ring: "ring-[#86EFAC]/70 border-[#BBF7D0]/70 bg-[#ECFDF3]/90 text-[#047857]",
    dot: "bg-[#059669]",
    Icon: CheckCircle2Icon,
  },
  failed: {
    ring: "ring-[#FCA5A5]/70 border-[#FECACA]/70 bg-[#FEF2F2]/90 text-[#B91C1C]",
    dot: "bg-[#DC2626]",
    Icon: AlertTriangleIcon,
  },
  idle: {
    ring: "ring-[#CBD5E1]/60 border-[#E2E8F0]/80 bg-white/80 text-[#64748B]",
    dot: "bg-[#94A3B8]",
    Icon: Loader2Icon,
  },
};

export function InlineSyncIndicator({ state = "idle", label = "System ready", className }) {
  const tone = tones[state] || tones.idle;
  const Icon = tone.Icon;
  const animateDot = state !== "idle" && state !== "success";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${state}-${label}`}
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.96 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.02em] shadow-[0_8px_20px_rgba(15,23,42,0.12)] ring-1 backdrop-blur-xl",
          tone.ring,
          className,
        )}
      >
        <Icon className={cn("size-3.5", state === "refreshing" ? "animate-spin" : "")} />
        <span>{label}</span>
        <motion.span
          className={cn("size-1.5 rounded-full", tone.dot)}
          animate={animateDot ? { opacity: [0.4, 1, 0.4], scale: [0.9, 1.2, 0.9] } : { opacity: 1, scale: 1 }}
          transition={{ repeat: animateDot ? Infinity : 0, duration: 1.1, ease: "easeInOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
