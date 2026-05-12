"use client";

import { BookingDetailsSkeleton } from "@/components/booking/booking-details-skeleton";
import { UpdateBookingModal } from "@/components/booking/update-booking-modal";
import { BackLink } from "@/components/shared/back-link";
import { Info } from "@/components/shared/info";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appointmentStatusColors } from "@/constants/status";
import { useApiQuery } from "@/hooks/useApiQuery";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const BookingDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/booking/bookings/${params.appointmentId}`,
    queryKeys: ["bookings", params.appointmentId],
  });

  const booking = data?.data;

  if (isLoading) return <BookingDetailsSkeleton />;

  if (error) {
    return (
      <StateView
        type="error"
        title="Unable to load appointment details"
        description={error.message}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  if (!booking) {
    return (
      <StateView
        type="empty"
        title="Appointment not found"
        description="The requested appointment record is not available."
        actionLabel="Back to appointments"
        actionHref="/admin/appointments"
      />
    );
  }

  // ✅ New API structure
  const {
    bookingId,
    patient,
    service,
    provider,
    bookingCity,
    appointmentDate,
    slotTime,
    status,
    pricing,
    treatment,
  } = booking;
  const patientName =
    `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() || "-";
  const patientEmail = patient?.email || "-";
  const providerName =
    `${provider?.firstName || ""} ${provider?.lastName || ""}`.trim() || "-";
  const providerEmail = provider?.email || "-";

  return (
    <div className="space-y-6">
      {/* Modal */}
      {isModalOpen && (
        <UpdateBookingModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      {/* Header Actions */}
      <div className="flex justify-between gap-4">
        <BackLink href="/admin/appointments">
          <H1>Appointment Details</H1>
        </BackLink>

        <div className="flex gap-5 items-center">
          {status !== "Cancelled" && status !== "Rejected" && (
            <>
              <Button onClick={() => setIsModalOpen(true)} variant="medico">
                Update Booking Status
              </Button>

              <Button
                onClick={() =>
                  router.push(
                    `/admin/appointments/${params.appointmentId}/update`,
                  )
                }
                variant="outline"
              >
                Update Booking
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Booking Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Booking Details</span>
            <Badge
              className={cn(
                "px-2 py-1 rounded-full text-xs",
                appointmentStatusColors[status],
              )}
            >
              {status}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Name" value={patientName} />
          <Info label="Email" value={patientEmail} />
          <Info label="Phone" value={patient?.phone || "-"} />
        </CardContent>
      </Card>

      {/* Service Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Service" value={service?.name || "—"} />
          <Info label="Category" value={service?.category || "—"} />
          <Info
            label="Modes"
            value={service?.modes?.length ? service.modes.join(", ") : "—"}
          />
        </CardContent>
      </Card>

      {/* Provider Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Provider Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Name" value={providerName} />
          <Info label="Email" value={providerEmail} />
          <Info label="Phone" value={provider?.phone || "-"} />
          <Info
            label="City"
            value={provider?.city?.length ? provider.city.join(", ") : "-"}
          />
        </CardContent>
      </Card>

      {/* Appointment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info
            label="Date"
            value={
              appointmentDate
                ? new Date(appointmentDate).toLocaleDateString()
                : "—"
            }
          />
          <Info
            label="Slot"
            value={
              slotTime ? `${slotTime.startTime} - ${slotTime.endTime}` : "—"
            }
          />
          <Info label="Booking City" value={bookingCity || "—"} />
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Base Price" value={pricing?.basePrice ?? "—"} />
          <Info
            label="Equipment Charges"
            value={pricing?.equipmentCharges ?? "—"}
          />
          <Info label="Subtotal" value={pricing?.subtotal ?? "—"} />
          <Info label="Tax (%)" value={pricing?.taxPercentage ?? "—"} />
          <Info label="Tax Amount" value={pricing?.taxAmount ?? "—"} />
          <Info label="Total Amount" value={pricing?.totalAmount ?? "—"} />
        </CardContent>
      </Card>

      {/* Treatment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Treatment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Status" value={treatment?.status || "—"} />
          <Info
            label="Valid Till"
            value={
              treatment?.validTill
                ? new Date(treatment.validTill).toLocaleDateString()
                : "—"
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetails;

