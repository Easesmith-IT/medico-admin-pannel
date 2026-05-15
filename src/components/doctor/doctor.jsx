import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TableCell, TableRow } from "../ui/table";
import { OperationalBadge } from "../ui/OperationalBadge";
import { Skeleton } from "../ui/skeleton";
import { ConfirmModal } from "../shared/confirm-modal";
import { useEffect, useState } from "react";
import { getDisplayName } from "@/lib/display";
import { Actions } from "../shared/actions";
import { DELETE, PATCH } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useRouter } from "next/navigation";
import { Switch } from "../ui/switch";
import { Spinner } from "../ui/spinner";
import { customId } from "@/lib/utils";

export const Doctor = ({ doctor }) => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(doctor?.isActive || false);
  const fullName = getDisplayName(doctor);
  const router = useRouter();

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  const onView = () => {
    router.push(`/admin/doctors/${doctor?._id}`);
  };

  const onEdit = () => {
    router.push(`/admin/doctors/${doctor?._id}/update`);
  };

  const { mutateAsync: deleteDoctor, isPending: isDeleteLoading } =
    useApiMutation({
      url: `/admin/doctors/${doctor?._id}`,
      method: DELETE,
      invalidateKey: ["doctors"],
    });

  const handleDeleteDoctor = async () => {
    await deleteDoctor();
  };

  const { mutateAsync, isPending, data, error } = useApiMutation({
    url: `/admin/doctors/${doctor._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["doctors"],
  });

  const toggleStatus = async () => {
    setIsActive((prev) => !prev);
    await mutateAsync();
  };

  useEffect(() => {
    if (error) {
      setIsActive(doctor?.isActive);
    }
  }, [error]);

  return (
    <>
      <TableRow>
        <TableCell
          className="min-w-[8.5rem] cursor-pointer whitespace-nowrap font-medium text-[#1D4ED8] [overflow-wrap:normal] hover:underline"
          onClick={onView}
        >
          {customId(doctor?._id)}
        </TableCell>
        <TableCell className="cursor-pointer font-medium text-[#0F172A] hover:text-[#1D4ED8] hover:underline" onClick={onView}>
          {fullName}
        </TableCell>
        <TableCell>{doctor.phone}</TableCell>
        <TableCell>{doctor.specialization}</TableCell>
        <TableCell>
          <OperationalBadge status={doctor.verificationStatus} />
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            {isPending ? <Spinner /> : <OperationalBadge status={isActive ? "Active" : "Inactive"} />}
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

      {isAlertModalOpen && (
        <ConfirmModal
          header="Delete Doctor"
          description="Are you sure you want to delete this doctor? This action cannot be undone."
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={isDeleteLoading}
          onConfirm={handleDeleteDoctor}
        />
      )}
    </>
  );
};

Doctor.Skeleton = function DoctorSkeleton() {
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
        <Skeleton className="w-full h-5" />
      </TableCell>
    </TableRow>
  );
};
