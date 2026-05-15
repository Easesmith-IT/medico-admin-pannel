import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionCard } from "@/components/ui/SectionCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

export const DataGrid = ({
  columns = [],
  rows = [],
  loading = false,
  emptyTitle = "No records found",
  emptyDescription,
  renderRow,
  title,
  description,
  actions,
}) => {
  return (
    <SectionCard title={title} description={description} actions={actions}>
      {loading ? (
        <LoadingState variant="table" />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key || column.label} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) =>
              renderRow ? (
                renderRow(row, index)
              ) : (
                <TableRow key={row.id || index}>
                  {columns.map((column) => (
                    <TableCell key={`${column.key}-${index}`} className={column.cellClassName}>
                      {row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
};
