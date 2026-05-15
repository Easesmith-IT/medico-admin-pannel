"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { OperationalBadge } from "@/components/ui/OperationalBadge";
import { Actions } from "../shared/actions";
import { useRouter } from "next/navigation";

export const Booking = ({ booking }) => {
  const router = useRouter();
  const patientName =
    `${booking?.patient?.firstName || ""} ${booking?.patient?.lastName || ""}`.trim() || "-";
  const patientEmail = booking?.patient?.email || "-";

  const onView = () => {
    router.push(`/admin/appointments/${booking?._id}`);
  };

  const onEdit = () => {
    router.push(`/admin/appointments/${booking?._id}/update`);
  };

  return (
    <TableRow>
      <TableCell className="cursor-pointer" onClick={onView}>
        <p>{patientName}</p>
        <p>{patientEmail}</p>
      </TableCell>

      <TableCell className="cursor-pointer font-medium text-[#0F172A] hover:text-[#1D4ED8] hover:underline" onClick={onView}>
        {booking.service?.name || "NA"}
      </TableCell>

      <TableCell>
        {booking.appointmentDate &&
          new Date(booking.appointmentDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
      </TableCell>
      <TableCell>
        {booking.createdAt &&
          new Date(booking.createdAt).toLocaleDateString("en-IN", {
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
        <OperationalBadge status={booking.status} />
      </TableCell>
      <TableCell>{booking.category || "NA"}</TableCell>

      <TableCell className="text-right">
        <Actions
          onView={onView}
          onEdit={
            booking?.status === "Cancelled" || booking?.status === "Rejected"
              ? null
              : onEdit
          }
        />
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
