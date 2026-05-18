"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { OverlayLoader } from "@/components/loading/overlay-loader";
import { useGlobalLoading } from "@/components/loading/loading-provider";

export function ContentTransition({ children }) {
  const pathname = usePathname();
  const { syncStatus } = useGlobalLoading();
  const isRouteBusy = syncStatus === "syncing";

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <OverlayLoader
        active={isRouteBusy}
        inline
        viewportCentered
        label="Syncing command center workspace..."
        className="pointer-events-none !rounded-[24px] !bg-white/18"
      />
    </div>
  );
}
