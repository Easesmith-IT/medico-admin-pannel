import { DELETE, PATCH } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { customId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ConfirmModal } from "../shared/confirm-modal";
import { Actions } from "../shared/actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { OperationalBadge } from "../ui/OperationalBadge";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import { TableCell, TableRow } from "../ui/table";

export const Service = ({ service }) => {
  const router = useRouter();
  const [isActive, setIsActive] = useState(service.isActive || false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const onView = () => {
    router.push(`/admin/services/${service._id}`);
  };

  const onEdit = () => {
    router.push(`/admin/services/${service._id}/update`);
  };

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  const { mutateAsync, isPending, error } = useApiMutation({
    url: `/service/${service._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["service"],
  });

  const toggleStatus = async () => {
    setIsActive((prev) => !prev);
    await mutateAsync();
  };

  useEffect(() => {
    if (error) {
      setIsActive(service?.isActive);
    }
  }, [error, service?.isActive]);

  const { mutateAsync: deleteService, isPending: isDeleteLoading } =
    useApiMutation({
      url: `/service/service/${service?._id}`,
      method: DELETE,
      invalidateKey: ["service"],
    });

  const handleDeleteService = async () => {
    await deleteService();
  };

  return (
    <>
      <TableRow>
        <TableCell
          className="min-w-[8.5rem] cursor-pointer whitespace-nowrap font-medium text-[#1D4ED8] [overflow-wrap:normal] hover:underline"
          onClick={onView}
        >
          {customId(service?._id)}
        </TableCell>

        <TableCell className="min-w-[16rem] cursor-pointer" onClick={onView}>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={service.image} alt={service.name} />
              <AvatarFallback>{service.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <div className="truncate font-medium text-[#0F172A] hover:text-[#1D4ED8]">
                {service.name}
              </div>
            </div>
          </div>
        </TableCell>

        <TableCell className="max-w-xs">
          <p className="line-clamp-2">{service.description}</p>
        </TableCell>

        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">₹{service.basePrice}</span>
            <span className="text-sm text-muted-foreground">
              Equip: ₹{service.equipmentCharges}
            </span>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-wrap gap-2">
            {service.modes.map((mode) => (
              <Badge key={mode}>{mode}</Badge>
            ))}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-wrap gap-2">
            {service.cities.length > 0
              ? service.cities.map((city) => (
                  <Badge className="capitalize" variant="secondary" key={city._id}>
                    {city.name}
                  </Badge>
                ))
              : "NA"}
          </div>
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
          <Actions onEdit={onEdit} onView={onView} onDelete={onDelete} />
        </TableCell>
      </TableRow>

      {isAlertModalOpen ? (
        <ConfirmModal
          header="Delete Service"
          description="Are you sure you want to delete this service? This action cannot be undone."
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={isDeleteLoading}
          onConfirm={handleDeleteService}
        />
      ) : null}
    </>
  );
};

Service.Skeleton = function ServiceSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-5 w-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-5 w-full" />
      </TableCell>
    </TableRow>
  );
};
