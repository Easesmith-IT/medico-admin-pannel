import { MoreHorizontal, MoreHorizontalIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TableCell, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { ConfirmModal } from "../shared/confirm-modal";
import { useEffect, useState } from "react";
import { Actions } from "../shared/actions";
import { DELETE, PATCH } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useRouter } from "next/navigation";
import { Switch } from "../ui/switch";
import { Spinner } from "../ui/spinner";

export const ServicePartner = ({ servicePartner }) => {
  const router = useRouter();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(servicePartner.isActive || false);

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  const onView = () => {
    router.push(`/admin/service-partners/${servicePartner?._id}`);
  };

  const onEdit = () => {
    router.push(`/admin/service-partners/${servicePartner?._id}/update`);
  };

  const { mutateAsync: deleteServicePartner, isPending: isDeleteLoading } =
    useApiMutation({
      url: `/serviceProvider/service-provider/${servicePartner?._id}`,
      method: DELETE,
      invalidateKey: ["service-provider"],
    });

  const handleDeleteServicePartner = async () => {
    await deleteServicePartner();
  };

  const { mutateAsync, isPending, data, error } = useApiMutation({
    url: `/serviceProvider/${servicePartner._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["service-provider"],
  });

  const toggleStatus = async () => {
    setIsActive((prev) => !prev);
    await mutateAsync();
  };

  useEffect(() => {
    if (error) {
      setIsActive(servicePartner.isActive);
    }
  }, [error]);

  return (
    <>
      <TableRow>
        {/* Name */}
        <TableCell className="font-medium">
          {servicePartner?.firstName} {servicePartner?.lastName}
        </TableCell>

        {/* Email */}
        <TableCell>{servicePartner?.email}</TableCell>

        {/* Phone */}
        <TableCell>{servicePartner?.mobile}</TableCell>

        {/* Age */}
        <TableCell>{servicePartner?.age || "—"}</TableCell>

        {/* Specialization (from services array) */}
        <TableCell>
          {servicePartner?.services?.[0]?.specialization || "—"}
        </TableCell>

        {/* Gender */}
        <TableCell className="capitalize">{servicePartner?.gender}</TableCell>

        {/* Verification Status */}
        <TableCell>
          <Badge variant={"secondary"} className="capitalize">
            {servicePartner?.approvalStatus}
          </Badge>
        </TableCell>

        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge
              variant={servicePartner.isActive ? "success" : "destructive"}
            >
              {isPending ? (
                <Spinner />
              ) : servicePartner.isActive ? (
                "Active"
              ) : (
                "Inactive"
              )}
            </Badge>
            <Switch
              checked={isActive}
              onCheckedChange={toggleStatus}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-orange-500"
            />
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <Actions onDelete={onDelete} onEdit={onEdit} onView={onView} />
        </TableCell>
      </TableRow>

      {isAlertModalOpen && (
        <ConfirmModal
          header="Delete Service Partner"
          description="Are you sure you want to delete this service partner? This action cannot be undone."
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={isDeleteLoading}
          onConfirm={handleDeleteServicePartner}
        />
      )}
    </>
  );
};

ServicePartner.Skeleton = function ServicePartnerSkeleton() {
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
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="w-8 h-5" />
      </TableCell>
    </TableRow>
  );
};
