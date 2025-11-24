"use client";

import { Booking } from "@/components/booking/booking";
import { H1 } from "@/components/typography";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dummyBookings = [
  {
    _id: "bk001",
    patientId: { firstName: "Amit", lastName: "Sharma" },
    serviceId: { name: "General Consultation" },
    appointmentDate: "2025-01-12T00:00:00.000Z",
    slotTime: { startTime: "10:00", endTime: "10:30" },
    duration: 30,
    status: "Pending",
  },
  {
    _id: "bk002",
    patientId: { firstName: "Neha", lastName: "Verma" },
    serviceId: { name: "Nursing Care – Injection" },
    appointmentDate: "2025-01-12T00:00:00.000Z",
    slotTime: { startTime: "14:00", endTime: "15:00" },
    duration: 60,
    status: "Approved",
  },
  {
    _id: "bk003",
    patientId: { firstName: "Rakesh", lastName: "Patel" },
    serviceId: { name: "Wheelchair Rental" },
    appointmentDate: "2025-01-13T00:00:00.000Z",
    slotTime: { startTime: "09:00", endTime: "09:30" },
    duration: 30,
    status: "Cancelled",
  },
  {
    _id: "bk004",
    patientId: { firstName: "Pooja", lastName: "Mehta" },
    serviceId: { name: "Doctor Home Visit" },
    appointmentDate: "2025-01-14T00:00:00.000Z",
    slotTime: { startTime: "17:00", endTime: "17:30" },
    duration: 30,
    status: "Rescheduled",
  },
  {
    _id: "bk005",
    patientId: { firstName: "Rahul", lastName: "Desai" },
    serviceId: { name: "Consultation – Pediatrics" },
    appointmentDate: "2025-01-14T00:00:00.000Z",
    slotTime: { startTime: "11:30", endTime: "12:00" },
    duration: 30,
    status: "Rejected",
  },
];

const Appointments = () => {
  const [bookings, setBookings] = useState([...dummyBookings]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-5">
        <H1>Appointments</H1>
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select onValueChange={(value) => setStatus(value)} value={status}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Rescheduled">Rescheduled</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings?.map((booking) => (
              <Booking key={booking._id} booking={booking} />
            ))}

            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <Booking.Skeleton key={index} />
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Appointments;
