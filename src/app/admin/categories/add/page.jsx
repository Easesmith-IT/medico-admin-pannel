"use client";

import CategoryForm from "@/components/category/CategoryForm";
import { BackLink } from "@/components/shared/back-link";
import { H2 } from "@/components/typography";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddCategoryPage = () => {
  const router = useRouter();

  const { mutateAsync, isPending } = useApiMutation({
    url: "/items/create",
    method: POST,
    invalidateKey: ["category"],
  });

  const handleSubmit = async (values) => {
    try {
      await mutateAsync(values);
      router.push("/admin/categories");
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  return (
    <div className="space-y-6">
      <BackLink href="/admin/categories">
        <H2>Add Category</H2>
      </BackLink>

      <CategoryForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Create"
      />
    </div>
  );
};

export default AddCategoryPage;
