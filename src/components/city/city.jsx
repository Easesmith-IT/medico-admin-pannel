"use client";

import dynamic from "next/dynamic";

const CityPolygonModal = dynamic(
  () => import("./city-polygon-modal").then((mod) => mod.CityPolygonModal),
  { ssr: false },
);


import { customId } from "@/lib/utils";
import { Actions } from "../shared/actions";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";
import { ConfirmModal } from "../shared/confirm-modal";
import { useApiMutation } from "@/hooks/useApiMutation";
import { DELETE, PATCH } from "@/constants/apiMethods";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export const City = ({ city }) => {
  const router = useRouter();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isPolygonOpen, setIsPolygonOpen] = useState(false);
  const [isActive, setIsActive] = useState(city?.isActive || false);

  const hasPolygon = city?.area?.coordinates?.[0]?.length > 2;

  const onEdit = () => {
    router.push(`/admin/cities/${city?._id}/update`);
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

  const {
    mutateAsync: toggleCityStatus,
    isPending: isTogglePending,
    error,
  } = useApiMutation({
    url: `/city/admin/cities/toggle/${city?._id}`,
    method: PATCH,
    invalidateKey: ["city"],
  });

  const toggleStatus = async () => {
    setIsActive((prev) => !prev);
    await toggleCityStatus();
  };

  useEffect(() => {
    if (error) setIsActive(city?.isActive);
  }, [error, city?.isActive]);

  return (
    <>
      <TableRow>
        <TableCell>{customId(city?._id)}</TableCell>

        <TableCell className="capitalize">{city?.name}</TableCell>

        {/* <TableCell>{city?.latitude}</TableCell>
        <TableCell>{city?.longitude}</TableCell> */}

        <TableCell>
          <div className="flex items-center gap-2">
            <Badge variant={hasPolygon ? "success" : "secondary"}>
              {hasPolygon ? "Added" : "Not Added"}
            </Badge>

            {hasPolygon && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPolygonOpen(true)}
              >
                View
              </Button>
            )}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge variant={city.isActive ? "success" : "destructive"}>
              {isTogglePending ? (
                <Spinner />
              ) : city.isActive ? (
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
          <Actions onDelete={onDelete} onEdit={onEdit} />
        </TableCell>
      </TableRow>

      {isPolygonOpen && (
        <CityPolygonModal
          city={city}
          isOpen={isPolygonOpen}
          onClose={() => setIsPolygonOpen(false)}
        />
      )}

      {isAlertModalOpen && (
        <ConfirmModal
          header="Delete City"
          description="Are you sure you want to delete this city?"
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
      {/* <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-full h-5" />
      </TableCell> */}
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
