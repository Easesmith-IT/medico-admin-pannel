"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

function TableSkeletonRows({ rows = 5, columns = 8 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div key={colIndex} className="skeleton-line h-8 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TableLoader({ active, rows = 5, columns = 8, className }) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn("pointer-events-none absolute inset-0 z-20 rounded-[24px] bg-white/35 p-4 backdrop-blur-[1px]", className)}
        >
          <TableSkeletonRows rows={rows} columns={columns} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
