"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArchiveIcon, RotateCcwIcon } from "lucide-react";
import { useParams } from "next/navigation";

import TreatmentHistorySkeleton from "@/components/patient/treatment-history-skeleton";
import { BackLink } from "@/components/shared/back-link";
import { FilterBar } from "@/components/shared/filter-bar";
import { StateView } from "@/components/shared/state-view";
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
import { useApiQuery } from "@/hooks/useApiQuery";
import { buildQuery } from "@/lib/utils";

const pageFade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut" },
};

const TreatmentHistory = () => {
  const params = useParams();
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("");

  const handleReset = () => {
    setStatus("all");
    setDateRange("");
  };

  const query = buildQuery({
    status,
    dateFilterType: dateRange,
    page: 1,
    limit: "50",
    patientId: params.patientId,
  });

  const { data, isLoading, isFetching, error, refetch } = useApiQuery({
    url: `/patient/myTreatmentHistory?${query}`,
    queryKeys: ["bookings", params.patientId, status, dateRange],
  });

  const patient = data?.data?.patient || null;
  const patientName =
    `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() || "Not provided";
  const patientEmail = patient?.email || "Not provided";
  const timeline = data?.data?.timeline || [];
  const summary = data?.data?.summary || null;
  const snapshot = data?.data?.medicalSnapshot || null;

  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const timelineSummary = useMemo(
    () =>
      timeline.map((item) => ({
        ...item,
        displayDate: item.appointmentDate ? formatDate(item.appointmentDate) : "N/A",
        totalAmount: item.pricing?.totalAmount ?? 0,
      })),
    [timeline]
  );

  if (isLoading) {
    return <TreatmentHistorySkeleton />;
  }

  if (error) {
    return (
      <StateView
        type="error"
        title="Unable to load treatment history"
        description={error.message}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...pageFade} className="space-y-1">
        <BackLink href={`/admin/patients/${params.patientId}`} />
        <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          Treatment History
        </h1>
        <p className="text-sm text-[#6B7280]">
          Unified longitudinal view of patient consultations, medications, and ongoing conditions.
        </p>
      </motion.div>

      <motion.div {...pageFade} transition={{ ...pageFade.transition, delay: 0.02 }}>
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoTile label="Patient Name" value={patientName} />
            <InfoTile label="Phone" value={patient?.phone} />
            <InfoTile label="Email" value={patientEmail} />
            <InfoTile
              label="Address"
              value={
                [
                  patient?.address?.street,
                  patient?.address?.city,
                  patient?.address?.state,
                  patient?.address?.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "Not provided"
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...pageFade} transition={{ ...pageFade.transition, delay: 0.04 }}>
        <FilterBar>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
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
              <label className="mb-1 block text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={handleReset}>
              <RotateCcwIcon />
              Reset
            </Button>
          </div>
        </FilterBar>
        {isFetching && !isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Refreshing treatment history...</p>
        ) : null}
      </motion.div>

      <motion.div
        {...pageFade}
        transition={{ ...pageFade.transition, delay: 0.06 }}
        className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]"
      >
        <Card>
          <CardHeader className="border-b border-[#EEF2F7] pb-4">
            <CardTitle className="text-xl">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {timelineSummary.length ? (
              timelineSummary.map((item) => (
                <article
                  key={item._id}
                  className="rounded-[14px] border border-[#EAECEF] bg-[#F8FAFC] p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Booking</Badge>
                      <span className="text-sm text-[#6B7280]">{item.displayDate}</span>
                    </div>
                    <Badge
                      className={
                        item.status === "Approved"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : item.status === "Rejected"
                          ? "border border-red-200 bg-red-50 text-red-700"
                          : "border border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    {item.serviceName || "Untitled Service"}
                  </h3>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Notes: {item.notes || "No notes"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#0F172A]">
                    Total Amount: ₹{item.totalAmount}
                  </p>
                </article>
              ))
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ArchiveIcon />
                  </EmptyMedia>
                  <EmptyTitle>No timeline records</EmptyTitle>
                  <EmptyDescription>No matching records found.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-[#EEF2F7] pb-4">
              <CardTitle className="text-xl">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-5">
              <SummaryItem label="Total Bookings" value={summary?.totalBookings} />
              <SummaryItem label="Active Meds" value={summary?.activeMedications} />
              <SummaryItem
                label="Conditions"
                value={summary?.ongoingConditions}
              />
              <SummaryItem
                label="Visits"
                value={summary?.totalTreatmentVisits}
              />
              <SummaryItem label="Blood Group" value={summary?.bloodGroup} />
              <SummaryItem label="Allergies" value={summary?.allergies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[#EEF2F7] pb-4">
              <CardTitle className="text-xl">Medical Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <SnapshotGroup
                label="Recent Treatments"
                items={snapshot?.recentTreatments}
                emptyText="None recorded"
                renderItem={(item) =>
                  item?.diagnosis || item?.recommendations || item?.doctorName || "Treatment"
                }
              />
              <Separator />
              <SnapshotGroup
                label="Active Medications"
                items={snapshot?.activeMedications}
                emptyText="No active medications"
                renderItem={(item) =>
                  item?.medicationName ||
                  [item?.dosage, item?.frequency].filter(Boolean).join(" ") ||
                  "Medication"
                }
              />
              <Separator />
              <SnapshotGroup
                label="Ongoing Conditions"
                items={snapshot?.ongoingConditions}
                emptyText="No ongoing conditions"
                renderItem={(item) =>
                  item?.condition ||
                  [item?.severity, item?.status].filter(Boolean).join(" - ") ||
                  "Condition"
                }
              />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

const InfoTile = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-sm text-[#6B7280]">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-[#0F172A]">
      {value || "Not provided"}
    </p>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div className="min-w-0 space-y-1">
    <span className="text-xs uppercase tracking-[0.08em] text-[#94A3B8]">
      {label}
    </span>
    <p className="break-words text-lg font-semibold text-[#0F172A]">
      {value || "Not specified"}
    </p>
  </div>
);

const SnapshotGroup = ({ label, items, emptyText, renderItem }) => (
  <div>
    <h4 className="text-sm font-semibold text-[#334155]">{label}</h4>
    {items?.length ? (
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#6B7280]">
        {items.map((item, index) => (
          <li key={index}>{renderItem ? renderItem(item) : item}</li>
        ))}
      </ul>
    ) : (
      <p className="mt-1 text-sm text-[#6B7280]">{emptyText}</p>
    )}
  </div>
);

export default TreatmentHistory;
