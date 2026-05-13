"use client";

import { useParams, useRouter } from "next/navigation";

import { AdminForm } from "@/components/admin/admin-form";
import { BackLink } from "@/components/shared/back-link";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { PATCH } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

const EditAdminPage = () => {
  const params = useParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/admin/subadmins/${params.adminId}`,
    queryKeys: ["admin-details", params.adminId],
  });

  const { mutateAsync, isPending } = useApiMutation({
    url: `/admin/subadmins/${params.adminId}`,
    method: PATCH,
    invalidateKey: ["admin"],
  });

  const admin = data?.data;

  const onSubmit = async (values) => {
    await mutateAsync(values);
    router.push(`/admin/admins/${params.adminId}`);
  };

  return (
    <div className="space-y-6">
      <BackLink href={`/admin/admins/${params.adminId}`}>
        <H1>Edit Admin</H1>
      </BackLink>

      {isLoading ? <StateView type="loading" rows={6} /> : null}

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
        <AdminForm
          mode="edit"
          isSubmitting={isPending}
          submitLabel="Update Admin"
          defaultValues={{
            firstName: admin.firstName || "",
            lastName: admin.lastName || "",
            email: admin.email || "",
            phone: admin.phone || "",
            role: admin.role || "subAdmin",
            status: admin.status || "active",
            permissions: admin.permissions || [],
          }}
          onSubmit={onSubmit}
        />
      ) : null}
    </div>
  );
};

export default EditAdminPage;
