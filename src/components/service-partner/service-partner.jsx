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
import { useState } from "react";
import { Actions } from "../shared/actions";
import { DELETE } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useRouter } from "next/navigation";

export const ServicePartner = ({ servicePartner }) => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const router = useRouter();

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  const onView = () => {
    router.push(`/admin/service-partners/${servicePartner?._id}`);
  };

  const onEdit = () => {
    router.push(`/admin/service-partners/${servicePartner?._id}/update`);
  };

  const { mutateAsync: deleteServicePartner, isPending } = useApiMutation({
    url: `/admin//${servicePartner?._id}`,
    method: DELETE,
    invalidateKey: ["service-providers"],
  });

  const handleDeleteServicePartner = async () => {
    await deleteServicePartner();
  };

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
          <Badge
            variant={"secondary"}
            className="capitalize"
          >
            {servicePartner?.approvalStatus}
          </Badge>
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
          disabled={isPending}
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
