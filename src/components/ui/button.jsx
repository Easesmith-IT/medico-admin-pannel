import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        medico:
          "bg-primary text-primary-foreground shadow-[0_10px_24px_rgb(37_99_235_/_0.35)] hover:bg-[#1d4ed8]",
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_24px_rgb(37_99_235_/_0.35)] hover:bg-[#1d4ed8]",
        primaryAction:
          "bg-primary text-primary-foreground shadow-[0_10px_24px_rgb(37_99_235_/_0.35)] hover:bg-[#1d4ed8]",
        secondaryAction:
          "border border-[#E5E7EB] bg-white text-[#111827] shadow-[0_10px_22px_rgb(15_23_42_/_0.06)] hover:bg-[#F8FAFC] hover:text-[#111827]",
        destructive:
          "border border-red-200 bg-red-50 text-red-600 shadow-[0_10px_22px_rgb(239_68_68_/_0.1)] hover:bg-red-100 focus-visible:ring-red-200",
        dangerousAction:
          "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-200",
        outline:
          "border border-[#dbe4f8] bg-white/90 text-[#0f172a] shadow-[0_10px_22px_rgb(15_23_42_/_0.06)] hover:bg-white",
        premiumOutline:
          "border border-[#dbe4f8] bg-white/90 text-[#0f172a] shadow-[0_10px_22px_rgb(15_23_42_/_0.06)] hover:bg-white",
        secondary:
          "border border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] hover:bg-[#F1F5F9]",
        ghost:
          "text-[#475569] hover:bg-[#EEF2FF] hover:text-[#1E3A8A]",
        ghostAction:
          "text-[#475569] hover:bg-[#EEF2FF] hover:text-[#1E3A8A]",
        workflowAction:
          "border border-[#C7D2FE] bg-[#EEF2FF] text-[#1E3A8A] hover:bg-[#E0E7FF]",
        workflowPrimary:
          "bg-primary text-primary-foreground shadow-[0_10px_18px_rgb(37_99_235_/_0.24)] hover:bg-[#1d4ed8]",
        workflowInfo:
          "border border-[#bfdbfe] bg-blue-50 text-blue-700 hover:bg-blue-100",
        workflowWarning:
          "border border-[#fed7aa] bg-orange-50 text-orange-700 hover:bg-orange-100",
        workflowDanger:
          "bg-rose-600 text-white hover:bg-rose-700",
        heroLight:
          "bg-white text-[#0f172a] hover:bg-slate-100",
        heroGhost:
          "border border-white/40 bg-white/12 text-white hover:bg-white/20",
        heroDanger:
          "border border-rose-300/50 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-[10px] gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-[12px] px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
