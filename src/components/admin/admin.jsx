import { customId } from "@/lib/utils";
import { Actions } from "../shared/actions";
import { TableCell, TableRow } from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns/format";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { PATCH } from "@/constants/apiMethods";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";

export const Admin = ({ admin }) => {
  const [isActive, setIsActive] = useState(admin?.status === "active");

  const { mutateAsync, isPending, data, error } = useApiMutation({
    url: `/admin/subadmins/${admin._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["admin"],
  });

  const toggleStatus = async (value) => {
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
      <TableCell>{customId(admin?._id)}</TableCell>
      <TableCell className="capitalize">
        {admin?.firstName} {admin?.lastName}
      </TableCell>
      <TableCell>{admin?.email}</TableCell>
      <TableCell>{admin?.phone}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant={isActive ? "success" : "destructive"}>
            {isPending ? <Spinner /> : isActive ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={isActive}
            onCheckedChange={toggleStatus}
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-orange-500"
          />
        </div>
      </TableCell>
      <TableCell>
        {admin?.createdAt && format(new Date(admin?.createdAt), "dd MMM, yyyy")}
      </TableCell>
      {/* <TableCell className="text-right">
        <Actions />
      </TableCell> */}
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
      {/* <TableCell className="text-right">
        <Skeleton className="w-full h-5" />
      </TableCell> */}
    </TableRow>
  );
};
