import { TableCell, TableRow } from "@/components/ui/table";
import { EyeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SeverityBadge } from "./SeverityBadge";
import { Skeleton } from "../ui/skeleton";

export function CrashRow({ crash }) {
  const router = useRouter();

  return (
    <TableRow
      // onClick={() => navigate(`/admin/settings/${crash.id}`, { state: crash })}
      className=" hover:bg-muted/50"
    >
      <TableCell>{crash.errorId || "-"}</TableCell>
      <TableCell>
        <SeverityBadge severity={crash.severity} />
      </TableCell>
      <TableCell>{crash.environment}</TableCell>
      <TableCell className="font-mono">
        <p className="w-40 truncate">{crash.errorName}</p>
        <div className="text-xs text-muted-foreground w-40 truncate">
          {crash.file}
        </div>
      </TableCell>
      <TableCell>
        {crash.source}
        {/* <div className="text-xs text-muted-foreground">
          {crash.platform} · {crash.version}
        </div> */}
      </TableCell>
      <TableCell>{crash.userType}</TableCell>
      <TableCell>
        {crash.timeAgo}
        <div className="text-xs text-muted-foreground">{crash.timestamp}</div>
      </TableCell>
      <TableCell>{crash.status}</TableCell>
      <TableCell>
        <EyeIcon
          onClick={() =>
            router.push(`/admin/crash-report/${crash.id}`, { state: crash })
          }
          className="size-6 cursor-pointer"
        />
      </TableCell>
    </TableRow>
  );
}

CrashRow.Skeleton = function CrashRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="w-full h-5" />
      </TableCell>
    </TableRow>
  );
};
