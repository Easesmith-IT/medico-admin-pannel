"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TopProgressLoader({ active, className }) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-full z-[55] h-2 border-y border-white/30 bg-white/35 backdrop-blur-lg",
            className,
          )}
        >
          <div className="relative h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1D4ED8]/15 via-[#3B82F6]/25 to-[#1D4ED8]/15" />
            <motion.div
              className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-[#2563EB]/20 via-[#60A5FA] to-[#2563EB]/20 shadow-[0_0_20px_rgba(37,99,235,0.6)]"
              animate={{ x: ["-40%", "320%"] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
