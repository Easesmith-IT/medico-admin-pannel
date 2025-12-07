"use client";

import { BookingDetailsSkeleton } from "@/components/booking/booking-details-skeleton";
import { UpdateBookingModal } from "@/components/booking/update-booking-modal";
import { BackLink } from "@/components/shared/back-link";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Info } from "@/components/shared/info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PUT } from "@/constants/apiMethods";
import { appointmentStatusColors } from "@/constants/status";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BookingDetails = () => {
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookingStatus = async () => {
    setIsModalOpen(true);
  };

  const { data, isLoading, error } = useApiQuery({
    url: `/booking/bookings/${params.appointmentId}`,
    queryKeys: ["bookings", params.appointmentId],
  });

  const booking = data?.data;
  console.log("booking", booking);

  if (isLoading) return <BookingDetailsSkeleton />;

  if (!booking) return <div>No booking found.</div>;

  const {
    patientId,
    serviceId,
    category,
    modes,
    servicePartnerId,
    appointmentDate,
    slotTime,
    duration,
    status,
    notes,
    pricing,
    createdBy,
    createdAt,
    updatedAt,
    statusReason,
  } = booking;

  return (
    <div>
      {isModalOpen && (
        <UpdateBookingModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      <div className="space-y-6">
        {/* Back Button */}
        {/* <Link href="/dashboard/bookings">
          <Button variant="ghost" className="flex items-center gap-2 mb-4">
            <ArrowLeftIcon size={16} /> Back to Bookings
          </Button>
        </Link> */}

        <div className="flex justify-between gap-4">
          <BackLink href="/admin/appointments" />
          {status !== "Cancelled" && status !== "Rejected" && (
            <Button onClick={handleBookingStatus} variant="medico">
              Update Booking Status
            </Button>
          )}
        </div>

        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Booking Details</span>
              <Badge
                className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  appointmentStatusColors[status]
                )}
              >
                {status}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Patient Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Info label="Name" value={patientId?.firstName} />
            <Info label="Email" value={patientId?.email} />
            <Info label="Phone" value={patientId?.phone} />
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Info label="Service" value={serviceId?.name} />
            <Info label="Category" value={category || "—"} />
            <Info
              label="Modes Available"
              value={modes?.length ? modes.join(", ") : "—"}
            />
            {/* <Info
              label="Assigned Partner"
              value={
                servicePartnerId
                  ? `${servicePartnerId.firstName} ${servicePartnerId.lastName}`
                  : "Not Assigned"
              }
            /> */}
          </CardContent>
        </Card>

        {/* Scheduling Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Info
              label="Date"
              value={ appointmentDate && new Date(appointmentDate).toLocaleDateString()}
            />
            <Info
              label="Slot"
              value={`${slotTime.startTime} - ${slotTime.endTime}`}
            />
            <Info label="Duration" value={`${duration} mins`} />
            <Info label="Notes" value={notes || "—"} />
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Info
              label="Base Price"
              value={String(pricing?.basePrice) ?? "—"}
            />
            <Info
              label="Equipment Charges"
              value={String(pricing?.equipmentCharges) ?? "—"}
            />
            <Info label="Subtotal" value={String(pricing?.subtotal) ?? "—"} />
            <Info
              label="Tax (%)"
              value={String(pricing?.taxPercentage) ?? "—"}
            />
            <Info
              label="Tax Amount"
              value={String(pricing?.taxAmount) ?? "—"}
            />
            <Info
              label="Total Amount"
              value={String(pricing?.totalAmount) ?? "—"}
            />
          </CardContent>
        </Card>

        {/* Meta Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meta Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Info label="Created By" value={createdBy?.userModel} />
            <Info
              label="Created At"
              value={createdAt && new Date(createdAt).toLocaleString()}
            />
            <Info
              label="Updated At"
              value={updatedAt && new Date(updatedAt).toLocaleString()}
            />
            <div className="col-span-2">
              <Info label="Reason" value={statusReason} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingDetails;
