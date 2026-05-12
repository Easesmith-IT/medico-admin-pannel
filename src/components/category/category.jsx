"use client";

import { DELETE, PATCH } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { customId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Actions } from "../shared/actions";
import { ConfirmModal } from "../shared/confirm-modal";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import { TableCell, TableRow } from "../ui/table";
import AddCategoryModal from "./add-category-modal";

export const Category = ({ category }) => {
  const router = useRouter();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(category?.isActive || false);
  const [isUpdateCategoryModalOpen, setIsUpdateCategoryModalOpen] =
    useState(false);

  const onView = () => router.push(`/admin/categories/${category?._id}`);
  const onEdit = () => router.push(`/admin/categories/${category?._id}/update`);

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  const { mutateAsync, isPending } = useApiMutation({
    url: `/items/delete/${category?._id}`,
    method: DELETE,
    invalidateKey: ["category"],
  });

  const handleDeleteCategory = async () => {
    await mutateAsync();
  };

  const {
    mutateAsync: toggleCategoryStatus,
    isPending: isTogglePending,
    error,
  } = useApiMutation({
    url: `/items/toggle-status/${category?._id}`,
    method: PATCH,
    invalidateKey: ["category"],
  });

  const toggleStatus = async () => {
    setIsActive((prev) => !prev);
    await toggleCategoryStatus();
  };

  useEffect(() => {
    if (error) setIsActive(category?.isActive);
  }, [error, category?.isActive]);

  return (
    <>
      <TableRow>
        <TableCell
          className="min-w-[8.5rem] cursor-pointer whitespace-nowrap font-medium text-[#1D4ED8] [overflow-wrap:normal] hover:underline"
          onClick={onView}
        >
          {customId(category?._id)}
        </TableCell>
        <TableCell className="cursor-pointer font-medium text-[#0F172A] hover:text-[#1D4ED8] hover:underline" onClick={onView}>
          {category.name}
        </TableCell>
        <TableCell>
          <p className="w-80 whitespace-pre-wrap">{category.description || "NA"}</p>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge variant={isActive ? "success" : "destructive"}>
              {isTogglePending ? (
                <Spinner />
              ) : isActive ? (
                "Active"
              ) : (
                "Inactive"
              )}
            </Badge>

            <Switch
              checked={isActive}
              onCheckedChange={toggleStatus}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300"
            />
          </div>
        </TableCell>
        <TableCell>
          {new Date(category.createdAt).toLocaleDateString()}
        </TableCell>
        {/* <TableCell>{category.createdBy || "NA"}</TableCell> */}

        <TableCell className="text-right">
          <Actions onView={onView} onDelete={onDelete} onEdit={onEdit} />
        </TableCell>
      </TableRow>


      {isAlertModalOpen && (
        <ConfirmModal
          header="Delete Category"
          description="Are you sure you want to delete this category?"
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={isPending}
          onConfirm={handleDeleteCategory}
        />
      )}
    </>
  );
};

Category.Skeleton = function CategorySkeleton() {
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
      <TableCell className="text-right">
        <Skeleton className="w-full h-5" />
      </TableCell>
    </TableRow>
  );
};
