"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Mail, Phone, ShieldCheck, UserCircle2 } from "lucide-react";

import { BackLink } from "@/components/shared/back-link";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POST } from "@/constants/apiMethods";
import { permissions } from "@/constants/permissions";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getDisplayName } from "@/lib/display";
import { normalizeRole } from "@/lib/rbac";
import { customId } from "@/lib/utils";

const permissionLabelMap = permissions.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const AdminDetailsPage = () => {
  const params = useParams();

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/admin/subadmins/${params.adminId}`,
    queryKeys: ["admin-details", params.adminId],
  });

  const admin = data?.data;
  const role = normalizeRole(admin?.role);
  const isSuperAdmin = role === "superadmin";
  const permissionsList = isSuperAdmin
    ? permissions.map((item) => item.value)
    : admin?.permissions || [];
  const { mutateAsync: forceLogout, isPending: isForceLogoutPending } = useApiMutation({
    url: `/admin/subadmins/${params.adminId}/force-logout`,
    method: POST,
    invalidateKey: ["admin-details", params.adminId],
  });

  return (
    <div className="space-y-6">
      <BackLink href="/admin/admins">
        <H1>Admin Details</H1>
      </BackLink>

      {isLoading ? <StateView type="loading" rows={7} /> : null}

      {!isLoading && error ? (
        <StateView
          type="error"
          title="Unable to load admin"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}

      {!isLoading && !error && !admin ? (
        <StateView
          type="empty"
          title="Admin not found"
          description="The requested admin account does not exist."
          actionLabel="Back to admins"
          actionHref="/admin/admins"
        />
      ) : null}

      {!isLoading && !error && admin ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-primary" />
                Identity
              </CardTitle>
              <Button asChild variant="outline">
                <Link href={`/admin/admins/${admin._id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => forceLogout({})}
                disabled={isForceLogoutPending || isSuperAdmin}
              >
                Force Logout
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Admin ID" value={customId(admin._id)} />
              <InfoRow label="Name" value={getDisplayName(admin)} />
              <InfoRow label="Email" value={admin.email || "-"} icon={Mail} />
              <InfoRow label="Phone" value={admin.phone || "-"} icon={Phone} />
              <InfoRow
                label="Role"
                value={admin.role || "-"}
                extra={
                  <Badge variant={admin.status === "active" ? "success" : "destructive"}>
                    {admin.status || "inactive"}
                  </Badge>
                }
              />
              <InfoRow
                label="Created"
                value={
                  admin.createdAt ? format(new Date(admin.createdAt), "dd MMM yyyy, hh:mm a") : "-"
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {permissionsList.length > 0 ? (
                  permissionsList.map((permissionKey) => (
                    <Badge key={permissionKey} variant="secondary">
                      {permissionLabelMap[permissionKey] || permissionKey}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon, extra = null }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
    <div className="mb-1 flex items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      {extra}
    </div>
    <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
      {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
      <span>{value || "-"}</span>
    </p>
  </div>
);

export default AdminDetailsPage;
