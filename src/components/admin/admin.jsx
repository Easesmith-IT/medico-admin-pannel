import { customId } from "@/lib/utils";
import { Actions } from "../shared/actions";
import { TableCell, TableRow } from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns/format";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { DELETE, PATCH } from "@/constants/apiMethods";
import { useEffect, useState } from "react";
import { getDisplayName } from "@/lib/display";
import { Switch } from "../ui/switch";
import { getCurrentAdminUser, canManageAdminMutations } from "@/lib/rbac";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export const Admin = ({ admin }) => {
  const router = useRouter();
  const currentUser = getCurrentAdminUser();
  const [isActive, setIsActive] = useState(admin?.status === "active");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const fullName = getDisplayName(admin);
  const email = admin?.email || "-";
  const canMutate = canManageAdminMutations(currentUser);
  const isSelf = String(currentUser?.id || currentUser?._id || "") === String(admin?._id || "");
  const mutationDisabled = !canMutate || isSelf;

  const { mutateAsync, isPending, error } = useApiMutation({
    url: `/admin/subadmins/${admin._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["admin"],
  });
  const { mutateAsync: deleteAdmin, isPending: isDeletePending } = useApiMutation({
    url: `/admin/subadmins/${admin._id}`,
    method: DELETE,
    invalidateKey: ["admin"],
  });

  const toggleStatus = async (value) => {
    if (mutationDisabled) return;
    setIsActive(value);
    await mutateAsync();
  };

  useEffect(() => {
    if (error) {
      setIsActive(admin?.status === "active");
    }
  }, [error]);

  return (
    <TableRow>
      <TableCell className="min-w-[8.5rem] whitespace-nowrap [overflow-wrap:normal]">
        {customId(admin?._id)}
      </TableCell>
      <TableCell className="capitalize">
        {fullName}
      </TableCell>
      <TableCell>{email}</TableCell>
      <TableCell>{admin?.phone}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant={isActive ? "success" : "destructive"}>
            {isPending ? <Spinner /> : isActive ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={isActive}
            onCheckedChange={toggleStatus}
            disabled={isPending || mutationDisabled}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300"
          />
        </div>
      </TableCell>
      <TableCell>
        {admin?.createdAt && format(new Date(admin?.createdAt), "dd MMM, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <Actions
            disabled={isDeletePending}
            onView={() => router.push(`/admin/admins/${admin._id}`)}
            onEdit={() => router.push(`/admin/admins/${admin._id}/edit`)}
            onDelete={
              mutationDisabled
                ? undefined
                : () => {
                    setIsDeleteOpen(true);
                  }
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Admin</AlertDialogTitle>
              <AlertDialogDescription>
                This action will deactivate the admin account and revoke active sessions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  disabled={isDeletePending}
                  onClick={async (event) => {
                    event.preventDefault();
                    await deleteAdmin();
                    setIsDeleteOpen(false);
                  }}
                >
                  {isDeletePending ? <Spinner /> : "Delete"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};

Admin.Skeleton = function AdminSkeleton() {
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
      <TableCell className="text-right">
        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
};
