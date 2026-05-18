"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, FileClock, ShieldAlert } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customId } from "@/lib/utils";

const getInitials = (value = "Patient") =>
  String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PT";

export function PatientWorkspaceCard({ patient, patientInsights = {} }) {
  if (!patient?._id) return null;

  const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(" ") || "Unknown Patient";
  const age = patient?.dateOfBirth
    ? Math.max(new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(), 0)
    : "-";

  const riskTone = patientInsights.riskLevel === "high" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <CardHeader>
        <CardTitle className="text-base text-[#0F172A]">Patient Operational Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar className="h-14 w-14 border border-[#BFDBFE]">
            <AvatarImage src={patient.profilePhoto || ""} />
            <AvatarFallback className="bg-[#DBEAFE] text-[#1D4ED8]">{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0F172A]">{fullName}</p>
            <p className="text-xs text-[#64748B]">{customId(String(patient._id), "PAT")}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge className="rounded-full bg-[#EFF6FF] text-[#1D4ED8]">Age {age}</Badge>
              <Badge className="rounded-full bg-[#F8FAFC] text-[#334155]">{patient.gender || "Unknown"}</Badge>
              <Badge className={`rounded-full border ${riskTone}`}>Risk {patientInsights.riskLevel || "low"}</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <InfoTile label="Contact" value={patient.phone || "Phone not available"} />
          <InfoTile label="Address" value={patientInsights.city || "Address pending"} />
          <InfoTile label="Medical Summary" value={`${patientInsights.allergyCount || 0} allergies`} />
          <InfoTile label="Appointment History" value={`${patientInsights.pastAppointments || 0} previous`} />
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#334155]">
            <Badge className="rounded-full border border-amber-200 bg-amber-50 text-amber-700">
              <ShieldAlert className="mr-1 h-3 w-3" />
              Allergies: {patientInsights.allergyCount || 0}
            </Badge>
            <Badge className="rounded-full border border-blue-200 bg-blue-50 text-blue-700">
              <CalendarClock className="mr-1 h-3 w-3" />
              Active Treatments: {patientInsights.activeTreatments || 0}
            </Badge>
            <Badge className="rounded-full border border-rose-200 bg-rose-50 text-rose-700">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Overdue Dues: {patientInsights.overdueInvoices || 0}
            </Badge>
            <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">
              <FileClock className="mr-1 h-3 w-3" />
              Last Booking: {patientInsights.lastBookingLabel || "-"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/patients/${patient._id}`}>View Profile</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/patients/${patient._id}/bookings`}>View History</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/patients/${patient._id}/bookings`}>View Treatments</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#64748B]">{label}</p>
      <p className="text-sm font-semibold text-[#0F172A]">{value}</p>
    </div>
  );
}
