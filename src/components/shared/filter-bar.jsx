"use client";

import { cn } from "@/lib/utils";

export const FilterBar = ({ className, children }) => {
  return (
    <div
      className={cn(
        "relative z-10 app-glass-panel p-4 sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
};
