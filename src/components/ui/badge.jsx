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
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-[#EEF2FF] text-[#1E3A8A] [a&]:hover:bg-[#DFE8FF]",
        destructive:
          "border border-red-200 bg-red-50 text-red-600 [a&]:hover:bg-red-100 focus-visible:ring-red-200",
        success: "border border-emerald-200 bg-emerald-50 text-emerald-700",
        outline:
          "border-[#E5E7EB] bg-white text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        inprogress: "border border-amber-200 bg-amber-50 text-amber-700",
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
