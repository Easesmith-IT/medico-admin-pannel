import { CardLoader } from "@/components/loading/card-loader";
import { SectionLoader } from "@/components/loading/section-loader";
import { cn } from "@/lib/utils";

export const LoadingState = ({ variant = "list", className, rows = 5 }) => {
  if (variant === "card") {
    return <CardLoader count={rows} className={className} />;
  }

  return <SectionLoader rows={rows} className={cn("bg-white/65", className)} />;
};
