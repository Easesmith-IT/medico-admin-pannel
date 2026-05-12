import {
  Building2Icon,
  LandmarkIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
} from "lucide-react";

import { Actions } from "../shared/actions";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";

export const Hospital = ({ hospital }) => {
  const onDelete = () => {};
  const onView = () => {};
  const onEdit = () => {};

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{hospital.clinicName}</span>
          {hospital.defaultClinic ? (
            <Badge variant="outline" className="mt-1 text-xs">
              Default
            </Badge>
          ) : null}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <PhoneIcon size={14} />
          {hospital.clinicReceptionNumber}
        </div>
      </TableCell>

      <TableCell>₹{hospital.clinicConsultationFees}</TableCell>

      <TableCell>
        <div className="flex items-center gap-1">
          <Building2Icon size={14} />
          {hospital.clinicOwnership}
        </div>
      </TableCell>

      <TableCell>{hospital.propertyOwnership}</TableCell>

      <TableCell>
        <div className="flex flex-col text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPinIcon size={14} />
            {hospital.area}, {hospital.city}
          </div>
          <div className="flex items-center gap-1">
            <LandmarkIcon size={14} />
            {hospital.nearbyLandmark}
          </div>
          <div className="flex items-center gap-1">
            <NavigationIcon size={14} />
            {hospital.latitude}, {hospital.longitude}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant={hospital.status === "active" ? "success" : "secondary"}>
          {hospital.status}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <Actions onDelete={onDelete} onEdit={onEdit} onView={onView} />
      </TableCell>
    </TableRow>
  );
};

Hospital.Skeleton = function HospitalSkeleton() {
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
      <TableCell className="text-right">
        <Skeleton className="h-5 w-full" />
      </TableCell>
    </TableRow>
  );
};
