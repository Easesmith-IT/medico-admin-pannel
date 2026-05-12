import { useRouter } from "next/navigation";
import { Actions } from "../shared/actions";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";
import { useEffect, useState } from "react";
import { getDisplayName } from "@/lib/display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns/format";
import { Switch } from "../ui/switch";
import { useApiMutation } from "@/hooks/useApiMutation";
import { PATCH } from "@/constants/apiMethods";
import { Spinner } from "../ui/spinner";
import { customId } from "@/lib/utils";

export const Patient = ({ patient }) => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(patient?.isActive || false);
  const fullName = getDisplayName(patient, { fallback: "N/A" });

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
      <TableCell
        className="min-w-[8.5rem] cursor-pointer whitespace-nowrap font-medium text-[#1D4ED8] [overflow-wrap:normal] hover:underline"
        onClick={onView}
      >
        <span title={patient?._id}>{customId(patient?._id)}</span>
      </TableCell>
      <TableCell className="cursor-pointer" onClick={onView}>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={patient.profilePhoto || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>{fullName?.[0] ?? "P"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-[#0F172A] hover:text-[#1D4ED8]">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {patient?.address?.city}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>{patient.phone}</TableCell>
      <TableCell className="capitalize">{patient.gender || "NA"}</TableCell>
      <TableCell>{patient.bloodGroup || "NA"}</TableCell>
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
