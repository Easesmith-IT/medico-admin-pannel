import { cn } from "@/lib/utils";

export const FormFooter = ({ className, children }) => {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      {children}
    </div>
  );
};
