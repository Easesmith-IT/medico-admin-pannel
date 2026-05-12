import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-[#9CA3AF] focus-visible:border-[#93C5FD] focus-visible:ring-[#93C5FD]/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-20 w-full rounded-[12px] border bg-white px-3 py-2 text-sm shadow-[0_1px_1px_rgb(15_23_42_/_0.04)] transition-[color,box-shadow,border-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

export { Textarea }
