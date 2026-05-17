"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import CategoryForm from "@/components/category/CategoryForm";
import { H2 } from "@/components/typography";
import { PUT } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { BackLink } from "@/components/shared/back-link";
import { StateView } from "@/components/shared/state-view";

const EditCategoryPage = () => {
  const { categoryId } = useParams();
  const router = useRouter();

  const { mutateAsync, isPending } = useApiMutation({
    url: `/items/update/${categoryId}`,
    method: PUT,
    invalidateKey: ["category"],
  });

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/items/category/${categoryId}`,
    queryKeys: ["category", categoryId],
  });

  const initialData = data?.data?.category || "";

  const handleSubmit = async (values) => {
    try {
      await mutateAsync(values);
      router.push("/admin/categories");
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  if (isLoading) {
    return <StateView type="loading" title="Loading category details" rows={5} />;
  }
  if (error) {
    return (
      <StateView
        type="error"
        title="Unable to load category"
        description={error.message}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <BackLink href="/admin/categories">
        <H2>Edit Category</H2>
      </BackLink>

      <CategoryForm
        defaultValues={initialData}
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Update"
      />
    </div>
  );
};

export default EditCategoryPage;
