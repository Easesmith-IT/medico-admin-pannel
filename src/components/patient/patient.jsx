import { useRouter } from "next/navigation";
import { Actions } from "../shared/actions";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns/format";
import { Switch } from "../ui/switch";
import { useApiMutation } from "@/hooks/useApiMutation";
import { PATCH } from "@/constants/apiMethods";
import { Spinner } from "../ui/spinner";

export const Patient = ({ patient }) => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(patient?.isActive || false);

  const router = useRouter();

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  const onView = () => {
    router.push(`/admin/patients/${patient?._id}`);
  };

  const onEdit = () => {
    router.push(`/admin/patients/${patient?._id}/update`);
  };

  const { mutateAsync, isPending, data, error } = useApiMutation({
    url: `/admin/patients/${patient._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["patients"],
  });

  const toggleStatus = async () => {
    setIsActive((prev) => !prev);
    await mutateAsync();
  };

  useEffect(() => {
    if (error) {
      setIsActive(patient?.isActive);
    }
  }, [error]);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={patient.profilePhoto || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>{patient.firstName?.[0] ?? "P"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{patient.firstName}</p>
            <p className="text-xs text-muted-foreground">
              {patient?.address?.city}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>{patient.email}</TableCell>
      <TableCell>{patient.phone}</TableCell>
      <TableCell className="capitalize">{patient.gender || "NA"}</TableCell>
      <TableCell>{patient.bloodGroup || "NA"}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant={patient.isActive ? "success" : "destructive"}>
            {isPending ? <Spinner /> : patient.isActive ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={isActive}
            onCheckedChange={toggleStatus}
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-orange-500"
          />
        </div>
      </TableCell>
      <TableCell>
        {patient.createdAt &&
          format(new Date(patient.createdAt), "dd MMM, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <Actions onDelete={onDelete} onEdit={onEdit} onView={onView} />
      </TableCell>
    </TableRow>
  );
};

Patient.Skeleton = function PatientSkeleton() {
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
        <Skeleton className="w-full h-5" />
      </TableCell>
    </TableRow>
  );
};
