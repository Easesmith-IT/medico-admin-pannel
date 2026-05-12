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
          "bg-primary text-primary-foreground shadow-[0_10px_18px_rgb(37_99_235_/_0.24)] hover:bg-[#1d4ed8]",
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_18px_rgb(37_99_235_/_0.24)] hover:bg-[#1d4ed8]",
        destructive:
          "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-200",
        outline:
          "border border-[#E5E7EB] bg-white text-[#111827] shadow-[0_1px_1px_rgb(15_23_42_/_0.05)] hover:bg-[#F8FAFC] hover:text-[#111827]",
        secondary:
          "border border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] hover:bg-[#F1F5F9]",
        ghost:
          "text-[#475569] hover:bg-[#EEF2FF] hover:text-[#1E3A8A]",
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
