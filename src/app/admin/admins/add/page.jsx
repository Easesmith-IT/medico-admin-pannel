"use client";

import { useRouter } from "next/navigation";

import { AdminForm } from "@/components/admin/admin-form";
import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";

const AddAdminPage = () => {
  const router = useRouter();

  const { mutateAsync, isPending } = useApiMutation({
    url: "/admin/signup",
    method: POST,
    invalidateKey: ["admin"],
  });

  const onSubmit = async (values) => {
    await mutateAsync(values);
    router.push("/admin/admins");
  };

  return (
    <div className="space-y-6">
      <BackLink href="/admin/admins">
        <H1>Create Admin</H1>
      </BackLink>

      <AdminForm
        mode="create"
        isSubmitting={isPending}
        submitLabel="Save Admin"
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default AddAdminPage;
