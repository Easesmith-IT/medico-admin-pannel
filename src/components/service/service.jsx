import { customId } from "@/lib/utils";
import { Actions } from "../shared/actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { DELETE, PATCH } from "@/constants/apiMethods";
import { Spinner } from "../ui/spinner";
import { ConfirmModal } from "../shared/confirm-modal";

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

  const { mutateAsync, isPending, data, error } = useApiMutation({
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
  }, [error]);

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
        <TableCell>{customId(service?._id)}</TableCell>
        <TableCell className="flex items-center gap-3">
          <Avatar>
            {/* replace with real asset path or remote url */}
            <AvatarImage src={service.icon} alt={service.name} />
            <AvatarFallback>{service.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium">{service.name}</div>
            {/* <div className="text-sm text-muted-foreground">{service._id}</div> */}
          </div>
        </TableCell>
        <TableCell className="max-w-xs truncate">
          {service.description}
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
          <div className="flex gap-2 flex-wrap">
            {service.modes.map((m) => (
              <Badge key={m}>{m}</Badge>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex gap-2 flex-wrap">
            {service.cities.length > 0
              ? service.cities.map((c) => (
                  <Badge className="capitalize" variant="secondary" key={c._id}>
                    {c.name}
                  </Badge>
                ))
              : "NA"}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge variant={service.isActive ? "success" : "destructive"}>
              {isPending ? (
                <Spinner />
              ) : service.isActive ? (
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
          <Actions onEdit={onEdit} onView={onView} onDelete={onDelete} />
        </TableCell>
      </TableRow>

      {isAlertModalOpen && (
        <ConfirmModal
          header="Delete Service"
          description="Are you sure you want to delete this service? This action cannot be undone."
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={isDeleteLoading}
          onConfirm={handleDeleteService}
        />
      )}
    </>
  );
};

Service.Skeleton = function ServiceSkeleton() {
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
