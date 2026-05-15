import { EmptyState } from "@/components/ui/EmptyState";

const DataNotFound = ({ name, className, actionLabel, actionHref }) => {
  return (
    <EmptyState
      className={className}
      title={`${name} not found`}
      description="No records are available for the current filters."
      actionLabel={actionLabel}
      actionHref={actionHref}
    />
  );
};

export default DataNotFound;
