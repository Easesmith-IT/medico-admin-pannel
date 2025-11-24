"use client";

import { BookingDetailsSkeleton } from "@/components/booking/booking-details-skeleton";
import { BackLink } from "@/components/shared/back-link";
import { Info } from "@/components/shared/info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appointmentStatusColors } from "@/constants/status";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BookingDetails = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const booking = {
    _id: "bk1001",

    patientId: {
      _id: "pt001",
      firstName: "Amit",
      lastName: "Sharma",
      phone: "9876543210",
      age: 32,
    },

    serviceId: {
      _id: "sv001",
      name: "General Physician Consultation",
      description: "Basic health consultation at home",
    },

    category: "consultation",

    modes: ["Home Service", "Visit Provider Location"],

    servicePartnerId: {
      _id: "dp001",
      firstName: "Dr. Rohan",
      lastName: "Kapoor",
      specialization: "General Physician",
    },

    appointmentDate: "2025-01-14T00:00:00.000Z",

    slotTime: {
      startTime: "10:00",
      endTime: "10:30",
    },

    duration: 30,

    status: "Approved",

    notes: "Please bring previous prescriptions.",

    pricing: {
      basePrice: 500,
      equipmentCharges: 0,
      subtotal: 500,
      taxPercentage: 18,
      taxAmount: 90,
      totalAmount: 590,
    },

    createdBy: {
      userId: "pt001",
      userModel: "Patient",
    },

    createdAt: "2025-01-10T09:15:00.000Z",
    updatedAt: "2025-01-12T14:30:00.000Z",
  };

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
  } = booking;

  return (
    <div>
      <div className="space-y-6">
        {/* Back Button */}
        {/* <Link href="/dashboard/bookings">
          <Button variant="ghost" className="flex items-center gap-2 mb-4">
            <ArrowLeftIcon size={16} /> Back to Bookings
          </Button>
        </Link> */}

        <BackLink href="/admin/appointments" />

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
            <Info
              label="Name"
              value={`${patientId.firstName} ${patientId.lastName}`}
            />
            <Info label="Patient ID" value={patientId._id} />
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Info label="Service" value={serviceId.name} />
            <Info label="Category" value={category || "—"} />
            <Info
              label="Modes Available"
              value={modes?.length ? modes.join(", ") : "—"}
            />
            <Info
              label="Assigned Partner"
              value={
                servicePartnerId
                  ? `${servicePartnerId.firstName} ${servicePartnerId.lastName}`
                  : "Not Assigned"
              }
            />
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
              value={new Date(appointmentDate).toLocaleDateString()}
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

        {/* Meta Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meta Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Info label="Created By" value={createdBy?.userModel} />
            <Info
              label="Created At"
              value={new Date(createdAt).toLocaleString()}
            />
            <Info
              label="Updated At"
              value={new Date(updatedAt).toLocaleString()}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel Booking</Button>
          <Button>Approve Booking</Button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
