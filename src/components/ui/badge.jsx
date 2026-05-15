import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-primary/20 text-primary-foreground ring-1 ring-primary/40 [a&]:hover:bg-primary/30",
        secondary:
          "border-0 bg-[#EEF2FF] text-[#1E3A8A] ring-1 ring-[#1E3A8A]/20 [a&]:hover:bg-[#DFE8FF]",
        destructive:
          "border-0 bg-red-500/20 text-red-700 ring-1 ring-red-300/40 [a&]:hover:bg-red-500/30",
        success: "border-0 bg-emerald-500/20 text-emerald-700 ring-1 ring-emerald-300/40",
        outline:
          "border border-[#E5E7EB] bg-white text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        inprogress: "border-0 bg-amber-500/20 text-amber-700 ring-1 ring-amber-300/40",
        approved: "border-0 bg-emerald-500/20 text-emerald-700 ring-1 ring-emerald-300/40",
        pending: "border-0 bg-amber-500/20 text-amber-700 ring-1 ring-amber-300/40",
        rejected: "border-0 bg-red-500/20 text-red-700 ring-1 ring-red-300/40",
        completed: "border-0 bg-cyan-500/20 text-cyan-700 ring-1 ring-cyan-300/40",
        cancelled: "border-0 bg-rose-500/20 text-rose-700 ring-1 ring-rose-300/40",
        active: "border-0 bg-emerald-500/20 text-emerald-700 ring-1 ring-emerald-300/40",
        inactive: "border-0 bg-slate-500/20 text-slate-700 ring-1 ring-slate-300/40",
        paid: "border-0 bg-teal-500/20 text-teal-700 ring-1 ring-teal-300/40",
        refunded: "border-0 bg-violet-500/20 text-violet-700 ring-1 ring-violet-300/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
