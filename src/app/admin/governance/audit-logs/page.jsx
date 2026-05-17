"use client";

import { format } from "date-fns";
import { DownloadCloud } from "lucide-react";
import { useState } from "react";

import { H1 } from "@/components/typography";
import { StateView } from "@/components/shared/state-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApiQuery } from "@/hooks/useApiQuery";
import { axiosInstance } from "@/lib/axiosInstance";

const AuditLogsPage = () => {
  const [action, setAction] = useState("");
  const [severity, setSeverity] = useState("");

  const query = new URLSearchParams();
  if (action) query.set("action", action);
  if (severity) query.set("severity", severity);

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/admin/audit-logs?${query.toString()}`,
    queryKeys: ["admin-audit-logs", action, severity],
  });

  const logs = data?.data || [];

  const onExport = async () => {
    const response = await axiosInstance.get(`/admin/audit-logs/export?${query.toString()}`);
    const rows = response?.data?.data?.rows || [];
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "admin-audit-logs.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <H1>Governance Audit Logs</H1>
        <Button variant="outline" onClick={onExport}>
          <DownloadCloud className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="Filter by action"
            className="max-w-sm"
          />
          <Input
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            placeholder="Filter by severity"
            className="max-w-xs"
          />
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            Apply
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <StateView
              type="error"
              title="Unable to load audit logs"
              description={error.message}
              actionLabel="Retry"
              onAction={refetch}
              className="mb-4"
            />
          ) : null}
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={`audit-log-skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  : null}

                {logs.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.createdAt
                        ? format(new Date(item.createdAt), "dd MMM yyyy, hh:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>{item.action || "-"}</TableCell>
                    <TableCell>{item.severity || "-"}</TableCell>
                    <TableCell>{item.actorEmail || item.actorAdminId || "-"}</TableCell>
                    <TableCell>{item.targetAdminId || "-"}</TableCell>
                  </TableRow>
                ))}

                {!isLoading && !error && logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      No audit logs available.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
