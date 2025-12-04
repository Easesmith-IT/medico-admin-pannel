"use client";

import TreatmentHistorySkeleton from "@/components/patient/treatment-history-skeleton";
import { BackLink } from "@/components/shared/back-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApiQuery } from "@/hooks/useApiQuery";
import { buildQuery } from "@/lib/utils";
import { ArchiveIcon, RotateCcwIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

const TreatmentHistory = () => {
  const params = useParams();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("");

  const handleReset = () => {
    setStatus("all");
    setPage(1);
    setLimit("10");
    setDateRange("");
  };

  const query = buildQuery({
    status: status,
    dateFilterType: dateRange,
    page,
    limit,
    patientId: params.patientId,
  });

  const { data, isLoading, error } = useApiQuery({
    url: `/patient/myTreatmentHistory?${query}`,
    queryKeys: ["bookings", page, limit, status, params.patientId, dateRange],
  });

  console.log("data", data);

  const patient = data?.data?.patient;
  const timeline = data?.data?.timeline || [];
  const summary = data?.data?.summary;
  const snapshot = data?.data?.medicalSnapshot;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (isLoading) {
    return <TreatmentHistorySkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <BackLink href={`/admin/patients/${params.patientId}`}></BackLink>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Info */}
        <Card className="col-span-1 lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-sm">Patient Name</p>
                <p className="font-medium text-base">{patient?.name}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Phone</p>
                <p className="font-medium text-base">{patient?.phone}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Email</p>
                <p className="font-medium text-base">{patient?.email}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Address</p>
                <p className="font-medium text-base">
                  {patient?.address?.street}, {patient?.address?.city},{" "}
                  {patient?.address?.state}, {patient?.address?.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader className="flex gap-5 justify-between items-start">
            <CardTitle className="text-2xl font-bold">
              Unified Timeline
            </CardTitle>
            <div className="flex gap-5 items-end">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
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
              <div>
                <label className="text-sm font-medium mb-1 block">Limit</label>
                <Select
                  value={limit}
                  onValueChange={(value) => setLimit(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Date Range
                </label>
                <Select
                  value={dateRange}
                  key={dateRange}
                  onValueChange={(value) => setDateRange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcwIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset Filters</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2">
              {timeline.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col rounded-xl p-4 shadow-sm border bg-background"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800"
                      >
                        Booking
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.appointmentDate)}
                      </p>
                    </div>

                    <Badge
                      className={
                        item.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold">{item.serviceName}</h3>

                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Notes: {item.notes || "No notes"}</p>
                    <p className="font-semibold text-right text-foreground">
                      Total Amount: ₹{item.pricing?.totalAmount}
                    </p>
                  </div>
                </div>
              ))}

              {timeline.length === 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ArchiveIcon />
                    </EmptyMedia>
                    <EmptyTitle>No data</EmptyTitle>
                    <EmptyDescription>No data found</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Summary */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <SummaryItem
                  label="Total Bookings"
                  value={summary?.totalBookings}
                />
                <SummaryItem
                  label="Active Meds"
                  value={summary?.activeMedications}
                />
                <SummaryItem
                  label="Ongoing Conditions"
                  value={summary?.ongoingConditions}
                />
                <SummaryItem
                  label="Treatment Visits"
                  value={summary?.totalTreatmentVisits}
                />
                <SummaryItem label="Blood Group" value={summary?.bloodGroup} />
                <SummaryItem label="Allergies" value={summary?.allergies} />
              </div>
            </CardContent>
          </Card>

          {/* Medical Snapshot */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Medical Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Treatments */}
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Recent Treatments
                </h4>
                {snapshot.recentTreatments.length ? (
                  <ul className="list-disc text-sm text-muted-foreground pl-5">
                    {snapshot.recentTreatments.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">None recorded</p>
                )}
              </div>

              <Separator className="my-3" />

              {/* Medications */}
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Active Medications
                </h4>
                {snapshot.activeMedications.length ? (
                  <ul className="list-disc text-sm text-muted-foreground pl-5">
                    {snapshot.activeMedications.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No active medications
                  </p>
                )}
              </div>

              <Separator className="my-3" />

              {/* Conditions */}
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Ongoing Conditions
                </h4>
                {snapshot.ongoingConditions.length ? (
                  <ul className="list-disc text-sm text-muted-foreground pl-5">
                    {snapshot.ongoingConditions.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No ongoing conditions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-bold text-lg">{value}</span>
  </div>
);

export default TreatmentHistory;

// import { BackLink } from "@/components/shared/back-link";
// import { H1 } from "@/components/typography";
// import { useParams } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useApiQuery } from "@/hooks/useApiQuery";
// import DataNotFound from "@/components/shared/DataNotFound";
// import { PaginationComp } from "@/components/shared/PaginationComp";
// import { Booking } from "@/components/patient/booking";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { buildQuery } from "@/lib/utils";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Button } from "@/components/ui/button";
// import { RotateCcwIcon } from "lucide-react";

// const Bookings = () => {
//   const params = useParams();
//   const [bookings, setBookings] = useState([]);
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState("10");
//   const [pageCount, setPageCount] = useState(0);
//   const [status, setStatus] = useState("all");
//   const [dateRange, setDateRange] = useState("");

//   const handleReset = () => {
//     setStatus("all");
//     setPage(1);
//     setLimit("10");
//     setDateRange("");
//   };

//   const query = buildQuery({
//     status: status,
//     filterBy: dateRange,
//     page,
//     limit,
//     patientId: params.patientId,
//   });

//   const { data, isLoading, error } = useApiQuery({
//     url: `/patient/myTreatmentHistory?${query}`,
//     queryKeys: ["bookings", page, limit, status, params.patientId, dateRange],
//   });

//   console.log("data", data);

//   useEffect(() => {
//     if (data?.data) {
//       setBookings(data?.data?.timeline);
//       setPageCount(data?.pagination?.totalPages || 1);
//     }
//   }, [data]);

//   return (
//     <div className="space-y-6">
//       <div className="flex gap-5 items-center justify-between">
//         <BackLink href={`/admin/patients/${params.patientId}`}>
//           <H1>Treatment History</H1>
//         </BackLink>
//         <div className="flex gap-5 items-end">
//           <div>
//             <label className="text-sm font-medium mb-1 block">Status</label>
//             <Select value={status} onValueChange={setStatus}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All</SelectItem>
//                 <SelectItem value="Pending">Pending</SelectItem>
//                 <SelectItem value="Approved">Approved</SelectItem>
//                 <SelectItem value="Rejected">Rejected</SelectItem>
//                 <SelectItem value="Rescheduled">Rescheduled</SelectItem>
//                 <SelectItem value="Cancelled">Cancelled</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div>
//                     <label className="text-sm font-medium mb-1 block">Limit</label>
//                     <Select value={limit} onValueChange={(value) => setLimit(value)}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select Limit" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="10">10</SelectItem>
//                         <SelectItem value="20">20</SelectItem>
//                         <SelectItem value="30">30</SelectItem>
//                         <SelectItem value="40">40</SelectItem>
//                         <SelectItem value="50">50</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="outline" onClick={handleReset}>
//                 <RotateCcwIcon />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>
//               <p>Reset Filters</p>
//             </TooltipContent>
//           </Tooltip>
//         </div>
//       </div>

//       <div className="table-container">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Service</TableHead>
//               <TableHead>Appointment Date</TableHead>
//               <TableHead>Created Date</TableHead>
//               <TableHead>Slot</TableHead>
//               <TableHead>Duration</TableHead>
//               <TableHead>Status</TableHead>
//               {/* <TableHead>Category</TableHead> */}
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {bookings?.map((booking) => (
//               <Booking key={booking._id} booking={booking} />
//             ))}

//             {isLoading &&
//               Array.from({ length: 5 }).map((_, index) => (
//                 <Booking.Skeleton key={index} />
//               ))}
//           </TableBody>
//         </Table>
//         {bookings?.length === 0 && !isLoading && (
//           <DataNotFound name="Bookings" />
//         )}
//       </div>

//       <PaginationComp
//         page={page}
//         pageCount={pageCount}
//         setPage={setPage}
//         className="mt-8 mb-5"
//       />
//     </div>
//   );
// };

// export default Bookings;
