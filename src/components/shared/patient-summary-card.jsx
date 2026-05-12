"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  UserRound,
  VenusAndMars,
} from "lucide-react";
import { format } from "date-fns/format";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, customId } from "@/lib/utils";

const objectIdRegex = /^[a-f\d]{24}$/i;

const asString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const isObjectId = (value) => objectIdRegex.test(asString(value));

const getLabelValue = (value, lookup = {}) => {
  if (!value) return "Not provided";

  if (typeof value === "object") {
    return (
      value.name ||
      value.label ||
      value.title ||
      value.city ||
      value.state ||
      value.country ||
      "Not provided"
    );
  }

  const text = asString(value);
  if (!text) return "Not provided";
  if (lookup[text]) return lookup[text];
  if (isObjectId(text)) return "Not provided";
  return text;
};

const getDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getAge = (patient) => {
  const dob = getDateValue(patient?.dateOfBirth || patient?.dob);
  if (!dob) return "NA";

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  const dayDiff = now.getDate() - dob.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age >= 0 ? `${age} yrs` : "NA";
};

const getInitials = (name) => {
  const parts = asString(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "PT";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
};

const formatLastAppointment = (patient) => {
  const lastAppointmentRaw =
    patient?.lastAppointment?.appointmentDate ||
    patient?.lastAppointmentDate ||
    patient?.lastBooking?.appointmentDate ||
    patient?.lastVisitAt;

  const date = getDateValue(lastAppointmentRaw);
  if (!date) return "No appointment history";
  return format(date, "dd MMM yyyy");
};

const valueOrFallback = (value, fallback = "Not provided") => {
  const text = asString(value);
  return text || fallback;
};

const formatAddress = (address, cityLookup = {}) => {
  if (!address) {
    return {
      street: "Not provided",
      city: "Not provided",
      state: "Not provided",
      country: "Not provided",
      pincode: "Not provided",
    };
  }

  return {
    street: valueOrFallback(address.street),
    city: getLabelValue(address.city, cityLookup),
    state: getLabelValue(address.state, cityLookup),
    country: getLabelValue(address.country, cityLookup),
    pincode: valueOrFallback(address.pincode),
  };
};

export function PatientSummaryCard({
  patient,
  cityLookup,
  onChangePatient,
  changeLabel = "Change Patient",
  className,
}) {
  if (!patient) return null;

  const fullName =
    [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() ||
    patient.name ||
    "Unknown Patient";
  const patientId = customId(patient._id || patient.id || "", "ID");
  const gender = valueOrFallback(patient.gender, "NA");
  const age = getAge(patient);
  const phone = valueOrFallback(patient.phone, "Not provided");
  const email = asString(patient.email);
  const bloodGroup = valueOrFallback(patient.bloodGroup, "NA");
  const allergies = Array.isArray(patient.allergies)
    ? patient.allergies.join(", ")
    : valueOrFallback(patient.allergies, "None recorded");
  const lastAppointment = formatLastAppointment(patient);
  const address = formatAddress(patient.address, cityLookup);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={cn(
        "overflow-hidden rounded-[20px] border border-[#E4EBF6] bg-gradient-to-br from-[#F9FBFF] via-white to-[#F3F8FF] shadow-[0_10px_32px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      <div className="border-b border-[#EAF0F9] bg-white/70 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12 border border-white shadow-sm">
              <AvatarImage src={patient.profilePhoto || patient.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0EA5E9] font-semibold text-white">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[#0F172A] sm:text-lg">
                {fullName}
              </p>
              <p className="mt-0.5 text-xs font-medium tracking-wide text-[#64748B]">
                {patientId || "Patient ID unavailable"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-[#E9F1FF] text-[#1E40AF]">
              <VenusAndMars className="mr-1 h-3 w-3" />
              {gender}
            </Badge>
            <Badge variant="outline" className="border-[#D6E3FF] text-[#334155]">
              {age}
            </Badge>
            {onChangePatient ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-[#C9D8F3] bg-white/90 text-[#1E3A8A] hover:bg-[#EEF4FF]"
                onClick={onChangePatient}
              >
                {changeLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
        <div className="rounded-2xl border border-[#E8EEF8] bg-white px-4 py-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">
            <UserRound className="h-3.5 w-3.5 text-[#2563EB]" />
            Contact Info
          </p>
          <div className="space-y-1.5 text-sm text-[#0F172A]">
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#64748B]" />
              <span>{phone}</span>
            </p>
            {email ? (
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#64748B]" />
                <span className="truncate">{email}</span>
              </p>
            ) : (
              <p className="text-[#64748B]">Email not available</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8EEF8] bg-white px-4 py-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">
            <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
            Address
          </p>
          <div className="space-y-1 text-sm text-[#0F172A]">
            <p>{address.street}</p>
            <p className="text-[#334155]">
              {address.city}, {address.state}
            </p>
            <p className="text-[#334155]">
              {address.country} {address.pincode !== "Not provided" ? ` - ${address.pincode}` : ""}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8EEF8] bg-white px-4 py-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">
            <HeartPulse className="h-3.5 w-3.5 text-[#2563EB]" />
            Medical Info
          </p>
          <div className="space-y-1 text-sm text-[#0F172A]">
            <p>
              Blood Group: <span className="text-[#334155]">{bloodGroup}</span>
            </p>
            <p>
              Allergies: <span className="text-[#334155]">{allergies}</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8EEF8] bg-white px-4 py-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">
            <CalendarClock className="h-3.5 w-3.5 text-[#2563EB]" />
            Last Appointment
          </p>
          <p className="text-sm text-[#0F172A]">{lastAppointment}</p>
          <p className="mt-1 text-xs text-[#64748B]">
            {valueOrFallback(patient.lastAppointment?.status, "Status unavailable")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
