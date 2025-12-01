import { MoreHorizontalIcon } from "lucide-react";
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

export const Doctor = ({ doctor }) => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(doctor?.isActive || false);
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
        <TableCell className="font-medium">{doctor.firstName}</TableCell>
        <TableCell>{doctor.email}</TableCell>
        <TableCell>{doctor.phone}</TableCell>
        <TableCell>{doctor.specialization}</TableCell>
        <TableCell>{doctor.currentWorkplace}</TableCell>
        <TableCell className="capitalize">{doctor.gender}</TableCell>
        <TableCell>
          <Badge
            variant={
              doctor.verificationStatus === "pending"
                ? "secondary"
                : doctor.verificationStatus === "rejected"
                ? "destructive"
                : "success"
            }
            className="capitalize"
          >
            {doctor.verificationStatus}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge variant={doctor.isActive ? "success" : "destructive"}>
              {isPending ? (
                <Spinner />
              ) : doctor.isActive ? (
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
