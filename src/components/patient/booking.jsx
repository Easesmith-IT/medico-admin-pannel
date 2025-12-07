"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, MoreVertical, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Actions } from "../shared/actions";
import { useRouter } from "next/navigation";
import { appointmentStatusColors } from "@/constants/status";

export const Booking = ({ booking }) => {
  const router = useRouter();

  const onView = () => {
    router.push(`/admin/appointments/${booking?._id}`);
  };

  const onEdit = () => {
    router.push(`/admin/appointments/${booking?._id}/update`);
  };

  return (
    <TableRow>
      <TableCell>{booking.serviceName || "NA"}</TableCell>

      <TableCell>
        {booking.appointmentDate && new Date(booking.appointmentDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </TableCell>
      <TableCell>
        {booking.createdAt && new Date(booking.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </TableCell>

      <TableCell>
        {booking.slotTime?.startTime} - {booking.slotTime?.endTime}
      </TableCell>

      <TableCell>{booking.duration} min</TableCell>

      <TableCell>
        <Badge
          className={cn(
            "px-2 py-1 rounded-full text-xs",
            appointmentStatusColors[booking.status]
          )}
        >
          {booking.status}
        </Badge>
      </TableCell>
      {/* <TableCell>{booking.category || "NA"}</TableCell> */}

      <TableCell className="text-right">
        <Actions onView={onView} onEdit={onEdit} />
      </TableCell>
    </TableRow>
  );
};

Booking.Skeleton = function BookingSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 9 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 w-full animate-pulse bg-muted rounded" />
        </TableCell>
      ))}
    </TableRow>
  );
};
