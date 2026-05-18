"use client";

import CategoryForm from "@/components/category/CategoryForm";
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
    <CategoryForm
      onSubmit={handleSubmit}
      isLoading={isPending}
      submitLabel="Create Category"
    />
  );
};

export default AddCategoryPage;
