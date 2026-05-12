import { DELETE, PATCH } from "@/constants/apiMethods";
import { STATUS_STYLES } from "@/constants/status";
import { useApiMutation } from "@/hooks/useApiMutation";
import { cn, customId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDisplayName } from "@/lib/display";

import { Actions } from "../shared/actions";
import { ConfirmModal } from "../shared/confirm-modal";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import { TableCell, TableRow } from "../ui/table";

export const ServicePartner = ({ servicePartner }) => {
  const router = useRouter();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(servicePartner.isActive || false);
  const fullName = getDisplayName(servicePartner);
  const specialization =
    servicePartner?.services?.[0]?.specialization ||
    servicePartner?.services?.[0]?.serviceName ||
    "-";

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

  const { mutateAsync, isPending, error } = useApiMutation({
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
  }, [error, servicePartner.isActive]);

  return (
    <>
      <TableRow>
        <TableCell
          className="min-w-[8.5rem] cursor-pointer whitespace-nowrap font-medium text-[#1D4ED8] [overflow-wrap:normal] hover:underline"
          onClick={onView}
        >
          {customId(servicePartner?._id)}
        </TableCell>
        <TableCell className="cursor-pointer font-medium text-[#0F172A] hover:text-[#1D4ED8] hover:underline" onClick={onView}>
          {fullName}
        </TableCell>

        <TableCell>
          {servicePartner?.mobile || servicePartner?.phone || "-"}
        </TableCell>

        <TableCell>{servicePartner?.age || "-"}</TableCell>

        <TableCell>{specialization}</TableCell>

        <TableCell className="capitalize">{servicePartner?.gender}</TableCell>

        <TableCell>
          <Badge
            variant="success"
            className={cn(
              "capitalize",
              STATUS_STYLES[servicePartner?.approvalStatus],
            )}
          >
            {servicePartner?.approvalStatus}
          </Badge>
        </TableCell>

        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge variant={isActive ? "success" : "destructive"}>
              {isPending ? <Spinner /> : isActive ? "Active" : "Inactive"}
            </Badge>
            <Switch
              checked={isActive}
              onCheckedChange={toggleStatus}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300"
            />
          </div>
        </TableCell>

        <TableCell className="text-right">
          <Actions onDelete={onDelete} onEdit={onEdit} onView={onView} />
        </TableCell>
      </TableRow>

      {isAlertModalOpen ? (
        <ConfirmModal
          header="Delete Service Partner"
          description="Are you sure you want to delete this service partner? This action cannot be undone."
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={isDeleteLoading}
          onConfirm={handleDeleteServicePartner}
        />
      ) : null}
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
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="w-8 h-5 text-right" />
      </TableCell>
    </TableRow>
  );
};
