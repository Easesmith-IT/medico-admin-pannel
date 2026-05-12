import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrashRow } from "./CrashRow";
import DataNotFound from "../shared/DataNotFound";
import Spinner from "../shared/Spinner";

export function CrashTable({ crashes, isLoading }) {
  return (
    <div className="overflow-x-auto overflow-y-visible table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Error Id</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {crashes.map((crash) => (
            <CrashRow key={crash.id} crash={crash} />
          ))}
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <CrashRow.Skeleton key={index} />
            ))}
        </TableBody>
      </Table>
      {crashes.length === 0 && !isLoading && (
        <DataNotFound name="Crash Reports" />
      )}
    </div>
  );
}
