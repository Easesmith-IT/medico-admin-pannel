"use client";

import { cn } from "@/lib/utils";

export const FilterBar = ({ className, children }) => {
  return (
    <div
      className={cn(
        "relative z-10 rounded-[18px] border border-[#EAECEF] bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_10px_20px_rgb(15_23_42_/_0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
};
