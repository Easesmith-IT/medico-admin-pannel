import Link from "next/link";
import { InboxIcon } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";
import { cn } from "@/lib/utils";

export const EmptyState = ({
  title = "No data available",
  description,
  actionLabel,
  actionHref,
  onAction,
  icon: Icon = InboxIcon,
  className,
}) => {
  const action = actionHref ? (
    <ActionButton asChild tone="secondary" size="sm">
      <Link href={actionHref}>{actionLabel}</Link>
    </ActionButton>
  ) : onAction ? (
    <ActionButton tone="secondary" size="sm" onClick={onAction}>{actionLabel}</ActionButton>
  ) : null;

  return (
    <div className={cn("flex min-h-40 flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[#CBD5E1] bg-gradient-to-b from-white to-[#F8FAFC] px-5 py-8 text-center", className)}>
      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8]">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
      {description ? <p className="max-w-md text-sm text-[#64748B]">{description}</p> : null}
      {action}
    </div>
  );
};
