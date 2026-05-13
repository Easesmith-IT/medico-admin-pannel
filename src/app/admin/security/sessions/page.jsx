"use client";

import { format } from "date-fns";
import { ShieldAlert, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApiQuery } from "@/hooks/useApiQuery";
import { axiosInstance } from "@/lib/axiosInstance";

const SessionsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useApiQuery({
    url: "/admin/sessions/me",
    queryKeys: ["admin-sessions"],
  });

  const sessions = data?.data || [];

  const revokeOneMutation = useMutation({
    mutationFn: async (sessionId) => {
      const response = await axiosInstance.delete(`/admin/sessions/${sessionId}`);
      return response.data;
    },
    onSuccess: (payload) => {
      toast.success(payload?.message || "Session revoked");
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"], exact: false });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete("/admin/sessions/me/all");
      return response.data;
    },
    onSuccess: (payload) => {
      toast.success(payload?.message || "Sessions revoked");
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"], exact: false });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <H1>Security Sessions</H1>
        <Button
          variant="destructive"
          onClick={() => revokeAllMutation.mutate()}
          disabled={revokeAllMutation.isPending}
        >
          <ShieldAlert />
          Revoke Other Sessions
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Active and Historical Sessions</CardTitle>
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session._id}>
                    <TableCell className="max-w-sm truncate">
                      {session.userAgent || "Unknown device"}
                    </TableCell>
                    <TableCell>{session.ipAddress || "-"}</TableCell>
                    <TableCell>
                      {session.lastSeenAt
                        ? format(new Date(session.lastSeenAt), "dd MMM yyyy, hh:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {session.revokedAt
                        ? "Revoked"
                        : session.isCurrentSession
                        ? "Current"
                        : "Active"}
                    </TableCell>
                    <TableCell className="text-right">
                      {!session.revokedAt && !session.isCurrentSession ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeOneMutation.mutate(session._id)}
                          disabled={revokeOneMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Revoke
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {!isLoading && sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      No sessions found.
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

export default SessionsPage;
