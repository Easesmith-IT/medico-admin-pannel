import Link from "next/link";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const StateView = ({
  type = "empty",
  title,
  description,
  className,
  actionLabel,
  actionHref,
  onAction,
  rows = 4,
}) => {
  if (type === "loading") {
    return (
      <div className={cn("space-y-3 py-3", className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  const action = actionHref ? (
    <Button asChild variant="outline" size="sm">
      <Link href={actionHref}>{actionLabel}</Link>
    </Button>
  ) : onAction ? (
    <Button onClick={onAction} variant="outline" size="sm">
      {actionLabel}
    </Button>
  ) : null;

  const icon =
    type === "error" ? (
      <AlertTriangleIcon className="size-5 text-destructive" />
    ) : (
      <RefreshCwIcon className="size-5 text-muted-foreground" />
    );

  return (
    <div
      className={cn(
        "flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#DCE3EE] bg-white px-5 py-7 text-center shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]",
        className
      )}
    >
      {icon}
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
};
