import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_MAP = {
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
  completed: "completed",
  cancelled: "cancelled",
  canceled: "cancelled",
  active: "active",
  inactive: "inactive",
  "in progress": "inprogress",
  paid: "paid",
  refunded: "refunded",
};

const LABEL_MAP = {
  inprogress: "In Progress",
};

export const getStatusVariant = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  return STATUS_MAP[normalized] || "outline";
};

export const OperationalBadge = ({ status, className }) => {
  const variant = getStatusVariant(status);
  const label = LABEL_MAP[variant] || status || "Unknown";

  return (
    <Badge
      variant={variant}
      className={cn("h-6 rounded-full px-2.5 text-[11px] font-semibold tracking-[0.02em]", className)}
    >
      {label}
    </Badge>
  );
};
