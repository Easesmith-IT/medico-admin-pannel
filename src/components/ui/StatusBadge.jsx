import { OperationalBadge } from "@/components/ui/OperationalBadge";

export const StatusBadge = ({ status, ...props }) => {
  return <OperationalBadge status={status} {...props} />;
};
