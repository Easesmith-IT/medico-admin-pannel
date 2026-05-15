import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export const StateView = ({
  type = "empty",
  title,
  description,
  className,
  actionLabel,
  actionHref,
  onAction,
  rows = 5,
}) => {
  if (type === "loading") {
    return <LoadingState className={className} rows={rows} />;
  }

  return (
    <EmptyState
      className={className}
      title={title || (type === "error" ? "Something went wrong" : "No records found")}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
      onAction={onAction}
      icon={type === "error" ? AlertTriangleIcon : RefreshCwIcon}
    />
  );
};
