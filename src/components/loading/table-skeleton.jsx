import { TableLoader } from "@/components/loading/table-loader";

export function TableSkeleton(props) {
  return <TableLoader active {...props} />;
}
