import { customId } from "@/lib/utils";
import { Actions } from "../shared/actions";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";
import { AddCityModal } from "./add-city-modal";
import { useState } from "react";
import { ConfirmModal } from "../shared/confirm-modal";
import { useApiMutation } from "@/hooks/useApiMutation";
import { DELETE } from "@/constants/apiMethods";

export const City = ({ city }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const onEdit = () => {
    setIsModalOpen(true);
  };

  const onDelete = () => {
    setIsAlertModalOpen(true);
  };

  const { mutateAsync, isPending } = useApiMutation({
    url: `/city/admin/cities/${city?._id}`,
    method: DELETE,
    invalidateKey: ["city"],
  });

  const handleDeleteCity = async () => {
    await mutateAsync();
  };

  return (
    <>
      <TableRow>
        <TableCell>{customId(city?._id)}</TableCell>
        <TableCell className="capitalize">{city.name}</TableCell>
        <TableCell>{city.latitude}</TableCell>
        <TableCell>{city.longitude}</TableCell>
        <TableCell className="text-right">
          <Actions onDelete={onDelete} onEdit={onEdit} />
        </TableCell>
      </TableRow>

      {isModalOpen && (
        <AddCityModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          city={city}
        />
      )}

      {isAlertModalOpen && (
        <ConfirmModal
          header="Delete City"
          description="Are you sure you want to delete this city? This action cannot be undone."
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={isPending}
          onConfirm={handleDeleteCity}
        />
      )}
    </>
  );
};

City.Skeleton = function CitySkeleton() {
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
      <TableCell className="text-right">
        <Skeleton className="w-full h-5" />
      </TableCell>
    </TableRow>
  );
};
