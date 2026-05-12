"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  Clock3,
  Copy,
  Download,
  Eye,
  FileBadge,
  FileCheck,
  FileText,
  Globe,
  HeartPulse,
  IndianRupee,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
  Loader2,
  PauseCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PUT, PATCH, DELETE } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SECTION_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "clinics", label: "Clinics" },
  { id: "services", label: "Services" },
  { id: "availability", label: "Availability" },
  { id: "bookings", label: "Bookings" },
  { id: "documents", label: "Documents" },
  { id: "social", label: "Social" },
  { id: "activity", label: "Activity" },
];

const statusStyles = {
  approved: "bg-emerald-500/20 text-emerald-100 ring-emerald-300/40",
  pending: "bg-amber-500/20 text-amber-100 ring-amber-300/40",
  rejected: "bg-rose-500/20 text-rose-100 ring-rose-300/40",
  under_review: "bg-blue-500/20 text-blue-100 ring-blue-300/40",
  suspended: "bg-orange-500/20 text-orange-100 ring-orange-300/40",
  inactive: "bg-slate-500/20 text-slate-100 ring-slate-300/40",
};

const WORKFLOW_STATE = {
  PENDING: "pending",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

const deriveWorkflowState = (doctorState, reviewMode) => {
  if (!doctorState) return WORKFLOW_STATE.PENDING;
  if (
    doctorState.verificationStatus === "approved" &&
    doctorState.isActive === false
  ) {
    return WORKFLOW_STATE.SUSPENDED;
  }
  if (doctorState.verificationStatus === "approved") {
    return WORKFLOW_STATE.APPROVED;
  }
  if (doctorState.verificationStatus === "rejected") {
    return WORKFLOW_STATE.REJECTED;
  }
  if (
    doctorState.verificationStatus === "pending" &&
    reviewMode === WORKFLOW_STATE.UNDER_REVIEW
  ) {
    return WORKFLOW_STATE.UNDER_REVIEW;
  }
  return WORKFLOW_STATE.PENDING;
};

const workflowStateLabel = (state) => {
  if (state === WORKFLOW_STATE.UNDER_REVIEW) return "Under Review";
  if (state === WORKFLOW_STATE.SUSPENDED) return "Suspended";
  if (state === WORKFLOW_STATE.APPROVED) return "Approved";
  if (state === WORKFLOW_STATE.REJECTED) return "Rejected";
  return "Pending";
};

const getWorkflowActions = (state) => {
  if (state === WORKFLOW_STATE.PENDING) {
    return ["approve", "under_review", "reject"];
  }
  if (state === WORKFLOW_STATE.UNDER_REVIEW) {
    return ["approve", "reject"];
  }
  if (state === WORKFLOW_STATE.APPROVED) {
    return ["suspend"];
  }
  if (state === WORKFLOW_STATE.REJECTED) {
    return ["approve", "under_review"];
  }
  if (state === WORKFLOW_STATE.SUSPENDED) {
    return ["reinstate"];
  }
  return [];
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toSentence = (value = "") => {
  if (!value) return "Not available";
  return value
    .toString()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const mapAvailabilityRows = (doctor) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const availableDays = new Set(
    (doctor?.availability?.days || []).map((d) => d.toLowerCase())
  );
  const slots = doctor?.availability?.timeSlots || [];
  const slotText = slots.length
    ? slots.map((slot) => `${slot.start || "--"} - ${slot.end || "--"}`).join(", ")
    : "No slots configured";

  return days.map((day) => ({
    day,
    value: availableDays.has(day.toLowerCase()) ? slotText : "Off",
    isOff: !availableDays.has(day.toLowerCase()),
  }));
};

const buildTimelineItems = (doctor, bookingFeed = []) => {
  const items = [
    {
      id: "profile-created",
      title: "Profile created",
      subtitle: "Doctor profile was added to the operations workspace",
      date: doctor?.createdAt,
      tone: "primary",
      icon: Sparkles,
    },
  ];

  if (doctor?.verificationStatus === "approved") {
    items.push({
      id: "verification-approved",
      title: "Verification approved",
      subtitle: "Credentials and registration documents validated",
      date: doctor?.verifiedAt || doctor?.updatedAt,
      tone: "success",
      icon: BadgeCheck,
    });
  }

  if (doctor?.verificationStatus === "rejected") {
    items.push({
      id: "verification-rejected",
      title: "Verification rejected",
      subtitle: doctor?.rejectionReason || "Verification needs additional information",
      date: doctor?.updatedAt,
      tone: "danger",
      icon: ShieldAlert,
    });
  }

  if ((doctor?.clinics || []).length > 0) {
    items.push({
      id: "clinic-added",
      title: "Clinic network updated",
      subtitle: `${doctor.clinics.length} clinic location(s) listed`,
      date: doctor?.updatedAt,
      tone: "neutral",
      icon: Building2,
    });
  }

  if ((doctor?.verificationDocuments?.degreesCertificates || []).length > 0) {
    items.push({
      id: "docs-uploaded",
      title: "Documents uploaded",
      subtitle: "Academic and verification files available for review",
      date: doctor?.updatedAt,
      tone: "primary",
      icon: FileCheck,
    });
  }

  if ((doctor?.totalReviews || 0) > 0) {
    items.push({
      id: "review-received",
      title: "Patient feedback received",
      subtitle: `${doctor.totalReviews} review(s) with ${Number(
        doctor.averageRating || 0
      ).toFixed(1)} avg rating`,
      date: doctor?.updatedAt,
      tone: "warning",
      icon: Star,
    });
  }

  if ((doctor?.followersCount || 0) > 0) {
    items.push({
      id: "followers-growth",
      title: "Audience growth",
      subtitle: `${doctor.followersCount} patient followers tracking this doctor`,
      date: doctor?.updatedAt,
      tone: "success",
      icon: UserPlus,
    });
  }

  if (bookingFeed.length > 0) {
    items.push({
      id: "upcoming-session",
      title: "Upcoming appointment scheduled",
      subtitle: `${bookingFeed[0]?.patientName || "Patient"} at ${
        bookingFeed[0]?.slot || "scheduled time"
      }`,
      date: bookingFeed[0]?.timestamp,
      tone: "primary",
      icon: CalendarClock,
    });
  }

  return items
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const parseServiceCoverage = (doctor) => {
  const coverage = doctor?.availability?.serviceCoverage;
  if (!coverage) return [];
  if (Array.isArray(coverage)) return coverage.filter(Boolean).map(String);
  if (typeof coverage === "string") return [coverage];
  if (Array.isArray(coverage?.areas)) return coverage.areas.filter(Boolean).map(String);
  return [];
};

const parseServiceModes = (doctor) => {
  const serviceAvailability = doctor?.availability?.serviceAvailability;
  if (!serviceAvailability) return [];
  if (typeof serviceAvailability === "string") {
    if (serviceAvailability === "both")
      return ["Home Service", "Visit Provider Location"];
    if (serviceAvailability === "home") return ["Home Service"];
    if (serviceAvailability === "clinic") return ["Visit Provider Location"];
    return [toSentence(serviceAvailability)];
  }

  if (Array.isArray(serviceAvailability)) {
    return serviceAvailability
      .flatMap((item) => (Array.isArray(item?.modes) ? item.modes : []))
      .map((mode) => toSentence(mode));
  }

  if (Array.isArray(serviceAvailability?.modes)) {
    return serviceAvailability.modes.map((mode) => toSentence(mode));
  }

  return [];
};

const buildBookingInsights = (doctor) => {
  const slotRecords = doctor?.availability?.dailySlots || [];
  const now = new Date();

  const flattened = slotRecords.flatMap((daySlot) =>
    (daySlot?.slots || []).map((slot, idx) => ({
      id: `${daySlot?.date || "day"}-${slot?.startTime || "slot"}-${idx}`,
      date: daySlot?.date,
      day: daySlot?.dayOfWeek,
      ...slot,
    }))
  );

  const statusCounts = {
    booked: flattened.filter((slot) => slot.status === "booked" || slot.isBooked)
      .length,
    blocked: flattened.filter((slot) => slot.status === "blocked").length,
    available: flattened.filter(
      (slot) => slot.status === "available" || (!slot.status && !slot.isBooked)
    ).length,
  };

  const upcomingFeed = flattened
    .filter((slot) => slot.isBooked || slot.status === "booked")
    .map((slot, index) => {
      const timestamp = slot.date ? new Date(slot.date) : null;
      return {
        id: slot.id,
        patientName: `Patient #${index + 1}`,
        service: doctor?.specialization || "Consultation",
        slot: `${slot.day || "Day"} ${slot.startTime || "--"}`,
        status: "Confirmed",
        payment: "Pending",
        amount: doctor?.consultationFees || 0,
        timestamp,
      };
    })
    .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));

  const futureUpcoming = upcomingFeed.filter(
    (item) => item.timestamp && item.timestamp >= now
  );

  const pieData = [
    { name: "Confirmed", value: statusCounts.booked, color: "#2563eb" },
    { name: "Available", value: statusCounts.available, color: "#10b981" },
    { name: "Blocked", value: statusCounts.blocked, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  const barData = [
    { label: "Mon", value: Math.max(1, Math.floor(statusCounts.booked * 0.18)) },
    { label: "Tue", value: Math.max(1, Math.floor(statusCounts.booked * 0.16)) },
    { label: "Wed", value: Math.max(1, Math.floor(statusCounts.booked * 0.12)) },
    { label: "Thu", value: Math.max(1, Math.floor(statusCounts.booked * 0.14)) },
    { label: "Fri", value: Math.max(1, Math.floor(statusCounts.booked * 0.2)) },
    { label: "Sat", value: Math.max(1, Math.floor(statusCounts.booked * 0.12)) },
    { label: "Sun", value: Math.max(1, Math.floor(statusCounts.booked * 0.08)) },
  ];

  const totalBookings = statusCounts.booked;
  const revenue = totalBookings * Number(doctor?.consultationFees || 0);

  return {
    pieData,
    barData,
    statusCounts,
    totalBookings,
    revenue,
    upcomingFeed: futureUpcoming.length > 0 ? futureUpcoming : upcomingFeed,
  };
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="rounded-[24px] border border-dashed border-slate-300/70 bg-white/70 p-8 text-center shadow-[0_14px_30px_rgb(15_23_42_/_0.06)]">
    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      <Icon className="size-6" />
    </div>
    <p className="text-base font-semibold text-[#0f172a]">{title}</p>
    <p className="mt-1 text-sm text-[#64748b]">{description}</p>
  </div>
);

const SectionShell = ({ id, title, subtitle, children }) => (
  <section
    id={id}
    className="scroll-mt-44 rounded-[28px] bg-white/85 p-6 shadow-[0_18px_46px_rgb(15_23_42_/_0.08)] ring-1 ring-white/60 backdrop-blur-sm sm:p-8"
  >
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight text-[#0f172a]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p> : null}
    </div>
    {children}
  </section>
);

const WorkspaceActionButton = ({ icon: Icon, className, children, ...props }) => (
  <Button
    variant="outline"
    size="sm"
    className={cn(
      "h-9 rounded-xl border-[#dbe4f8] bg-white/90 text-[#0f172a] shadow-[0_10px_22px_rgb(15_23_42_/_0.06)] hover:bg-white",
      className
    )}
    {...props}
  >
    {Icon ? <Icon className="size-4" /> : null}
    {children}
  </Button>
);

const StatBadge = ({ icon: Icon, label, value, tone = "default" }) => (
  <div
    className={cn(
      "rounded-2xl px-4 py-3",
      tone === "success" && "bg-emerald-500/18 text-emerald-50",
      tone === "warning" && "bg-amber-500/18 text-amber-50",
      tone === "default" && "bg-white/14 text-white"
    )}
  >
    <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] text-white/75">
      <Icon className="size-3.5" />
      {label}
    </div>
    <p className="mt-2 text-lg font-semibold">{value}</p>
  </div>
);

export const DoctorHeroSection = ({ doctor, metrics, workflowState }) => {
  const fullName = `Dr. ${[doctor?.firstName, doctor?.lastName]
    .filter(Boolean)
    .join(" ")}`.trim();

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-7 text-white shadow-[0_30px_60px_rgb(15_23_42_/_0.35)] sm:p-9"
    >
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#2563eb]/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-[#10b981]/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start gap-5">
            <div className="rounded-full bg-gradient-to-br from-[#60a5fa] via-[#2563eb] to-[#1d4ed8] p-[3px] shadow-[0_18px_30px_rgb(37_99_235_/_0.4)]">
              <Avatar className="size-[120px] border-2 border-white/40">
                <AvatarImage src={doctor?.profilePhoto} alt={fullName} />
                <AvatarFallback className="bg-[#0f172a] text-3xl font-semibold text-white">
                  {fullName
                    .replace("Dr.", "")
                    .trim()
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("") || "DR"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-white">
                  {fullName || "Dr. Profile"}
                </h1>
                <p className="mt-1 text-base text-slate-300">
                  {doctor?.designation || "Senior Consultant"}{" "}
                  {doctor?.specialization ? `• ${doctor.specialization}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-300 text-amber-300" />
                  {Number(doctor?.averageRating || 0).toFixed(1)}
                </span>
                <span>•</span>
                <span>{doctor?.totalReviews || 0} reviews</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  className={cn(
                    "rounded-full border-0 px-3.5 py-1.5 text-xs ring-1",
                    statusStyles[workflowState || doctor?.verificationStatus] ||
                      statusStyles.pending
                  )}
                >
                  {workflowStateLabel(workflowState || doctor?.verificationStatus || "pending")}
                </Badge>
                <Badge className="rounded-full border-0 bg-emerald-500/20 px-3.5 py-1.5 text-xs text-emerald-100 ring-1 ring-emerald-300/40">
                  {doctor?.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge className="rounded-full border-0 bg-sky-500/20 px-3.5 py-1.5 text-xs text-sky-100 ring-1 ring-sky-300/40">
                  {doctor?.isPhoneVerified ? "Phone Verified" : "Phone Unverified"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <p className="inline-flex items-center gap-2">
              <Phone className="size-4 text-slate-300" />{" "}
              {doctor?.phone || "Not provided"}
            </p>
            <p className="inline-flex items-center gap-2">
              <Mail className="size-4 text-slate-300" />{" "}
              {doctor?.email || "Not provided"}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-slate-300" />{" "}
              {doctor?.address?.city || "Delhi"}, {doctor?.address?.country || "India"}
            </p>
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-slate-300" />{" "}
              {doctor?.medicalRegistrationNumber || "MCI pending"}
            </p>
          </div>
        </div>

        <div className="grid min-w-[240px] gap-3 self-start sm:grid-cols-2 lg:grid-cols-1">
          <StatBadge
            icon={CalendarClock}
            label="Upcoming"
            value={metrics.upcomingAppointments}
          />
          <StatBadge
            icon={IndianRupee}
            label="Revenue"
            value={formatCurrency(metrics.revenue)}
            tone="success"
          />
          <StatBadge
            icon={TrendingUp}
            label="Engagement"
            value={`${metrics.rating.toFixed(1)} rating`}
            tone="warning"
          />
        </div>
      </div>
    </motion.section>
  );
};

export const DoctorAnalyticsStrip = ({ metrics }) => {
  const items = [
    {
      label: "Total Bookings",
      value: metrics.totalBookings,
      icon: CalendarClock,
      trend: "+12%",
    },
    {
      label: "Revenue",
      value: formatCurrency(metrics.revenue),
      icon: IndianRupee,
      trend: "+8%",
    },
    { label: "Followers", value: metrics.followers, icon: Users, trend: "+5%" },
    { label: "Services", value: metrics.servicesCount, icon: Stethoscope },
    { label: "Rating", value: metrics.rating.toFixed(1), icon: Star },
    { label: "Upcoming", value: metrics.upcomingAppointments, icon: Clock3 },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.06 }}
      className="rounded-[24px] bg-white/72 p-3 shadow-[0_16px_38px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70 backdrop-blur-xl"
    >
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-white/90 px-4 py-3 shadow-[0_10px_22px_rgb(15_23_42_/_0.06)]"
          >
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#64748b]">
              <item.icon className="size-3.5" />
              {item.label}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-xl font-semibold text-[#0f172a]">{item.value}</p>
              {item.trend ? (
                <span className="text-xs font-medium text-emerald-600">
                  {item.trend}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export const DoctorStickyNav = ({ activeSection, onNavigate }) => (
  <div className="sticky top-[calc(var(--app-header-height)+98px)] z-20 rounded-[20px] bg-white/86 p-2 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70 backdrop-blur-md">
    <div className="flex gap-2 overflow-x-auto overflow-y-visible pb-1">
      {SECTION_ITEMS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onNavigate(section.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
            activeSection === section.id
              ? "bg-[#2563eb] text-white shadow-[0_10px_24px_rgb(37_99_235_/_0.35)]"
              : "bg-[#eff6ff] text-[#1e3a8a] hover:bg-[#dbeafe]"
          )}
        >
          {section.label}
        </button>
      ))}
    </div>
  </div>
);

export const DoctorTimeline = ({ items }) => {
  if (!items.length) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Operational activity will appear as this doctor receives bookings, reviews, and verification updates."
      />
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const Icon = item.icon || Activity;
        const toneClass =
          item.tone === "success"
            ? "bg-emerald-100 text-emerald-600"
            : item.tone === "warning"
            ? "bg-amber-100 text-amber-600"
            : item.tone === "danger"
            ? "bg-rose-100 text-rose-600"
            : "bg-blue-100 text-blue-600";

        return (
          <div key={item.id} className="relative pl-12">
            <span className="absolute left-[19px] top-10 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-slate-200 to-transparent" />
            <span
              className={cn(
                "absolute left-0 top-0 flex size-10 items-center justify-center rounded-full",
                toneClass
              )}
            >
              <Icon className="size-4.5" />
            </span>
            <div className="rounded-2xl bg-[#f8fafc] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[#0f172a]">{item.title}</p>
                <span className="text-xs font-medium text-[#64748b]">
                  {item.date
                    ? formatDistanceToNow(new Date(item.date), { addSuffix: true })
                    : "recent"}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#64748b]">{item.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const DoctorProfessionalCard = ({ doctor }) => (
  <div className="space-y-6">
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
        {doctor?.specialization || "General Practice"}
      </Badge>
      {(doctor?.subSpecialties || []).map((item) => (
        <Badge
          key={item}
          variant="outline"
          className="rounded-full bg-white px-3 py-1 text-xs text-[#334155]"
        >
          {item}
        </Badge>
      ))}
      <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
        {doctor?.yearsOfExperience || 0}+ years
      </Badge>
      <Badge className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
        {formatCurrency(doctor?.consultationFees || 0)} consultation
      </Badge>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-[#f8fafc] p-4">
        <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">
          Designation
        </p>
        <p className="mt-1 font-semibold text-[#0f172a]">
          {doctor?.designation || "Consultant"}
        </p>
      </div>
      <div className="rounded-2xl bg-[#f8fafc] p-4">
        <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">
          Current Workplace
        </p>
        <p className="mt-1 font-semibold text-[#0f172a]">
          {doctor?.currentWorkplace || "Not provided"}
        </p>
      </div>
      <div className="rounded-2xl bg-[#f8fafc] p-4">
        <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">
          Medical Council
        </p>
        <p className="mt-1 font-semibold text-[#0f172a]">
          {doctor?.issuingMedicalCouncil || "Not provided"}
        </p>
      </div>
      <div className="rounded-2xl bg-[#f8fafc] p-4">
        <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">
          Registration Number
        </p>
        <p className="mt-1 font-semibold text-[#0f172a]">
          {doctor?.medicalRegistrationNumber || "Not provided"}
        </p>
      </div>
    </div>

    <details className="group rounded-2xl bg-[#f8fafc] p-4 open:shadow-[inset_0_0_0_1px_#dbeafe]">
      <summary className="cursor-pointer list-none text-sm font-semibold text-[#1d4ed8]">
        Professional Bio
      </summary>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#334155]">
        {doctor?.professionalBio || "No professional bio has been added yet."}
      </p>
    </details>
  </div>
);

export const DoctorEducationCard = ({ doctor }) => {
  const records = [
    ...(doctor?.degrees || []).map((degree, index) => ({
      id: `degree-${index}`,
      title: degree,
      meta: doctor?.university || "University not added",
      year: doctor?.graduationYear || "-",
      icon: BookOpen,
    })),
    ...(doctor?.certifications || []).map((item, index) => ({
      id: `cert-${index}`,
      title: item,
      meta: "Certification",
      year: "",
      icon: FileBadge,
    })),
    ...(doctor?.residencies || []).map((item, index) => ({
      id: `res-${index}`,
      title: item,
      meta: "Residency",
      year: "",
      icon: Briefcase,
    })),
    ...(doctor?.trainingsWorkshops || []).map((item, index) => ({
      id: `work-${index}`,
      title: item,
      meta: "Workshop",
      year: "",
      icon: Users,
    })),
  ];

  if (!records.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Education details not added"
        description="Degrees, certifications, and workshops will appear once added to this profile."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {records.map((record) => (
        <div
          key={record.id}
          className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]"
        >
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-[#64748b]">
            <record.icon className="size-3.5" />
            {record.meta}
          </p>
          <p className="mt-2 font-semibold text-[#0f172a]">{record.title}</p>
          {record.year ? (
            <p className="mt-1 text-sm text-[#64748b]">{record.year}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export const DoctorClinicsCarousel = ({ clinics = [] }) => {
  if (!clinics.length) {
    return (
      <EmptyState
        icon={Building2}
        title="No clinic locations yet"
        description="Clinic locations, contact channels, and operating windows will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-visible pb-2">
      <div className="flex min-w-max gap-4 pr-1">
        {clinics.map((clinic, index) => {
          const mapCoordinates = clinic?.location?.coordinates;
          const mapLabel =
            Array.isArray(mapCoordinates) && mapCoordinates.length === 2
              ? `${mapCoordinates[1]}, ${mapCoordinates[0]}`
              : null;

          return (
            <div
              key={`${clinic?.clinicName || "clinic"}-${index}`}
              className="w-[320px] shrink-0 rounded-[24px] bg-white p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#0f172a]">
                    {clinic?.clinicName || "Clinic"}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#64748b]">
                    <MapPin className="size-3.5" />
                    {[clinic?.address?.city, clinic?.address?.state]
                      .filter(Boolean)
                      .join(", ") || "Location not added"}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  4.7
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[#334155]">
                <p className="inline-flex items-start gap-2">
                  <Clock3 className="mt-0.5 size-4 text-[#64748b]" />
                  {(clinic?.operatingHours || []).length
                    ? clinic.operatingHours
                        .slice(0, 2)
                        .map(
                          (day) =>
                            `${day.day}: ${
                              (day.slots || [])
                                .map((slot) => `${slot.startTime} - ${slot.endTime}`)
                                .join(", ") || "Off"
                            }`
                        )
                        .join(" | ")
                    : "Operating hours not added"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Phone className="size-4 text-[#64748b]" />{" "}
                  {clinic?.contactInfo?.phone || "No phone"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Mail className="size-4 text-[#64748b]" />{" "}
                  {clinic?.contactInfo?.email || "No email"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <IndianRupee className="size-4 text-[#64748b]" />{" "}
                  {(clinic?.paymentMethods || []).join(", ") || "UPI, Card, Cash"}
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f8fafc] p-3 text-xs text-[#64748b]">
                <p className="font-medium text-[#334155]">Map Preview</p>
                <p className="mt-1">{mapLabel || "Coordinates are not available"}</p>
              </div>

              {(clinic?.images || []).length ? (
                <div className="mt-3 flex gap-2 overflow-x-auto overflow-y-visible pb-1">
                  {clinic.images.slice(0, 3).map((image, imageIdx) => (
                    <img
                      key={`${clinic.clinicName}-image-${imageIdx}`}
                      src={image}
                      alt={`${clinic.clinicName || "Clinic"} ${imageIdx + 1}`}
                      className="h-16 w-20 rounded-lg object-cover"
                    />
                  ))}
                </div>
              ) : null}

              <Button variant="ghost" className="mt-3 px-0 text-[#1d4ed8] hover:bg-transparent">
                <Globe className="size-4" />
                View Map
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DoctorServicesGrid = ({ doctor }) => {
  const services = (doctor?.services || []).map((service, index) => {
    if (typeof service === "string") {
      return {
        id: service,
        name: `Service ${index + 1}`,
        category: "Speciality",
        price: doctor?.consultationFees || 0,
        status: doctor?.isActive ? "Active" : "Inactive",
        duration: `${
          doctor?.availability?.autoSlotGeneration?.defaultDuration || 30
        } min`,
      };
    }

    return {
      id: service?._id || `service-${index}`,
      name: service?.name || service?.serviceName || `Service ${index + 1}`,
      category: service?.category || doctor?.specialization || "Speciality",
      price: service?.basePrice || doctor?.consultationFees || 0,
      status: service?.isActive === false ? "Inactive" : "Active",
      duration: `${
        service?.defaultDuration ||
        doctor?.availability?.autoSlotGeneration?.defaultDuration ||
        30
      } min`,
    };
  });

  if (!services.length) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="No mapped services"
        description="Assigned services and care packages will appear once connected to this doctor profile."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-[#0f172a]">{service.name}</h3>
            <Badge variant={service.status === "Active" ? "success" : "destructive"}>
              {service.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[#64748b]">{toSentence(service.category)}</p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="font-semibold text-[#0f172a]">{formatCurrency(service.price)}</p>
            <p className="text-[#64748b]">{service.duration}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DoctorAvailabilityCalendar = ({ doctor }) => {
  const rows = mapAvailabilityRows(doctor);
  const serviceModes = parseServiceModes(doctor);
  const coverageAreas = parseServiceCoverage(doctor);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <div key={row.day} className="rounded-2xl bg-[#f8fafc] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">
              {row.day}
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                row.isOff ? "text-[#94a3b8]" : "text-[#0f172a]"
              )}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]">
          <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">
            Coverage Areas
          </p>
          <p className="mt-2 text-sm text-[#334155]">
            {coverageAreas.length
              ? coverageAreas.join(", ")
              : "No coverage zones configured"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]">
          <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">
            Service Modes
          </p>
          <p className="mt-2 text-sm text-[#334155]">
            {serviceModes.length
              ? serviceModes.join(", ")
              : "Mode configuration pending"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]">
          <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">
            Slot Generation
          </p>
          <p className="mt-2 text-sm text-[#334155]">
            {doctor?.availability?.autoSlotGeneration?.enabled ? "Enabled" : "Disabled"}{" "}
            • Duration {doctor?.availability?.autoSlotGeneration?.defaultDuration || 30}m
          </p>
        </div>
      </div>
    </div>
  );
};

export const DoctorBookingsAnalytics = ({ insights }) => {
  const hasData = insights.pieData.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl bg-white p-5 shadow-[0_12px_26px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]">
        <p className="text-sm font-semibold text-[#0f172a]">
          Booking Status Distribution
        </p>
        {hasData ? (
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insights.pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={4}
                >
                  {insights.pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={CalendarClock}
              title="No bookings yet"
              description="Upcoming bookings will appear here once slot bookings start."
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_12px_26px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]">
        <p className="text-sm font-semibold text-[#0f172a]">Weekly Booking Momentum</p>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insights.barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const DoctorBookingTable = ({ rows = [] }) => {
  if (!rows.length) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No appointment feed available"
        description="Upcoming appointments and recent booking operations will show up here."
      />
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-visible rounded-2xl bg-white shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]">
      <table className="w-full min-w-[820px] border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-[#f8fafc] text-left text-xs uppercase tracking-[0.08em] text-[#64748b]">
          <tr>
            <th className="px-4 py-3 font-medium">Patient</th>
            <th className="px-4 py-3 font-medium">Service</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row) => (
            <tr key={row.id} className="border-t border-[#edf2f7]">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-[#dbeafe] text-[#1d4ed8]">
                      {row.patientName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-[#0f172a]">{row.patientName}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[#334155]">{row.service}</td>
              <td className="px-4 py-3 text-sm text-[#334155]">{row.slot}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary">{row.status}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline">{row.payment}</Badge>
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-[#0f172a]">
                {formatCurrency(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const DoctorDocumentsGallery = ({ doctor }) => {
  const docs = [
    doctor?.verificationDocuments?.identityProof
      ? {
          id: "identity",
          title: "Identity Proof",
          type: "Identity",
          url: doctor.verificationDocuments.identityProof,
          uploadedAt: doctor?.updatedAt,
        }
      : null,
    ...(doctor?.verificationDocuments?.degreesCertificates || []).map((url, index) => ({
      id: `degree-${index}`,
      title: `Degree Certificate ${index + 1}`,
      type: "Academic",
      url,
      uploadedAt: doctor?.updatedAt,
    })),
    doctor?.verificationDocuments?.medicalCouncilRegistration
      ? {
          id: "medical-council",
          title: "Medical Council Registration",
          type: "Regulatory",
          url: doctor.verificationDocuments.medicalCouncilRegistration,
          uploadedAt: doctor?.verifiedAt || doctor?.updatedAt,
        }
      : null,
  ].filter(Boolean);

  if (!docs.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents uploaded"
        description="Identity proof, degree certificates, and registration files will appear in this workspace once uploaded."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="rounded-2xl bg-white p-4 shadow-[0_12px_26px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-[#64748b]">
                <FileText className="size-3.5" />
                {doc.type}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-[#0f172a]">{doc.title}</h3>
            </div>
            <Badge variant="outline">PDF</Badge>
          </div>

          <p className="mt-3 text-xs text-[#64748b]">Uploaded {formatDate(doc.uploadedAt)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-xl bg-[#eff6ff] text-[#1d4ed8]"
            >
              <a href={doc.url} target="_blank" rel="noreferrer">
                <Eye className="size-4" />
                Preview
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <a href={doc.url} target="_blank" rel="noreferrer">
                <Download className="size-4" />
                Download
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DoctorSocialFeed = ({ doctor }) => {
  const socialCards = [
    {
      label: "Followers",
      value: doctor?.followersCount || 0,
      icon: Users,
    },
    {
      label: "Posts",
      value: doctor?.socialPostsCount || 0,
      icon: MessageSquare,
    },
    {
      label: "Engagement",
      value: `${Math.max(doctor?.averageRating || 0, 0).toFixed(1)} rating`,
      icon: HeartPulse,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {socialCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-4 shadow-[0_12px_26px_rgb(15_23_42_/_0.08)] ring-1 ring-[#e2e8f0]"
          >
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-[#64748b]">
              <card.icon className="size-3.5" /> {card.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-[#0f172a]">{card.value}</p>
          </div>
        ))}
      </div>

      <EmptyState
        icon={MessageSquare}
        title="No social posts yet"
        description="Latest social post previews will appear after the doctor publishes updates from the social module."
      />
    </div>
  );
};

export const DoctorIntelligenceRail = ({
  doctor,
  metrics,
  insights,
  workflowState,
  workflowActions,
  onWorkflowAction,
  onEdit,
  onToggleActive,
  isTogglingActive,
  isWorkflowBusy,
}) => {
  const assignedCities = Array.isArray(doctor?.cities) ? doctor.cities.length : 0;
  const upcomingRows = insights.upcomingFeed.slice(0, 4);

  return (
    <aside className="space-y-4 lg:sticky lg:top-[calc(var(--app-header-height)+155px)] lg:self-start">
      <div className="rounded-[24px] bg-white/90 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70">
        <p className="text-sm font-semibold text-[#0f172a]">Quick Actions</p>
        <div className="mt-3 space-y-2">
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              workflowState === WORKFLOW_STATE.APPROVED
                ? "bg-emerald-100 text-emerald-700"
                : workflowState === WORKFLOW_STATE.REJECTED
                ? "bg-rose-100 text-rose-700"
                : workflowState === WORKFLOW_STATE.SUSPENDED
                ? "bg-orange-100 text-orange-700"
                : workflowState === WORKFLOW_STATE.UNDER_REVIEW
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            )}
          >
            {workflowStateLabel(workflowState)}
          </Badge>

          <div className="grid grid-cols-2 gap-2">
            {workflowActions.includes("approve") ? (
              <WorkspaceActionButton
                icon={CheckCircle}
                onClick={() => onWorkflowAction("approve")}
                disabled={isWorkflowBusy}
              >
                Approve
              </WorkspaceActionButton>
            ) : null}
            {workflowActions.includes("under_review") ? (
              <WorkspaceActionButton
                icon={Loader2}
                onClick={() => onWorkflowAction("under_review")}
                className="text-blue-700"
                disabled={isWorkflowBusy}
              >
                Under Review
              </WorkspaceActionButton>
            ) : null}
            {workflowActions.includes("reject") ? (
              <WorkspaceActionButton
                icon={XCircle}
                onClick={() => onWorkflowAction("reject")}
                className="text-rose-600 hover:text-rose-700"
                disabled={isWorkflowBusy}
              >
                Reject
              </WorkspaceActionButton>
            ) : null}
            {workflowActions.includes("suspend") ? (
              <WorkspaceActionButton
                icon={PauseCircle}
                onClick={() => onWorkflowAction("suspend")}
                className="text-orange-700"
                disabled={isWorkflowBusy}
              >
                Suspend
              </WorkspaceActionButton>
            ) : null}
            {workflowActions.includes("reinstate") ? (
              <WorkspaceActionButton
                icon={CheckCircle}
                onClick={() => onWorkflowAction("reinstate")}
                disabled={isWorkflowBusy}
              >
                Reinstate
              </WorkspaceActionButton>
            ) : null}
            <WorkspaceActionButton icon={Copy} onClick={onEdit}>
              Edit
            </WorkspaceActionButton>
            <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dbe4f8] bg-white px-3 py-1.5">
              <Switch
                checked={Boolean(doctor?.isActive)}
                onCheckedChange={onToggleActive}
                disabled={isTogglingActive}
                className="h-6 w-11 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] bg-white/90 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70">
        <p className="text-sm font-semibold text-[#0f172a]">Verification Status</p>
        <div className="mt-3 space-y-2">
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-xs ring-1",
              statusStyles[workflowState] || statusStyles.pending
            )}
          >
            {workflowStateLabel(workflowState)}
          </Badge>
          <p className="text-xs text-[#64748b]">
            Last updated {formatDateTime(doctor?.updatedAt)}
          </p>
        </div>
      </div>

      <div className="rounded-[24px] bg-white/90 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70">
        <p className="text-sm font-semibold text-[#0f172a]">Revenue Snapshot</p>
        <p className="mt-2 text-2xl font-bold text-[#0f172a]">
          {formatCurrency(metrics.revenue)}
        </p>
        <p className="mt-1 text-xs text-emerald-600">
          {metrics.totalBookings} booking-driven estimations
        </p>
      </div>

      <div className="rounded-[24px] bg-white/90 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70">
        <p className="text-sm font-semibold text-[#0f172a]">Upcoming Appointments</p>
        {upcomingRows.length ? (
          <div className="mt-3 space-y-2">
            {upcomingRows.map((row) => (
              <div key={row.id} className="rounded-xl bg-[#f8fafc] px-3 py-2 text-sm text-[#334155]">
                <p className="font-medium text-[#0f172a]">{row.patientName}</p>
                <p className="text-xs">{row.slot}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-[#64748b]">
            No appointment slots are booked yet.
          </p>
        )}
      </div>

      <div className="rounded-[24px] bg-white/90 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70">
        <p className="text-sm font-semibold text-[#0f172a]">Social Stats</p>
        <div className="mt-3 grid gap-2 text-sm text-[#334155]">
          <p className="flex items-center justify-between">
            <span>Followers</span>
            <span className="font-semibold text-[#0f172a]">
              {doctor?.followersCount || 0}
            </span>
          </p>
          <p className="flex items-center justify-between">
            <span>Reviews</span>
            <span className="font-semibold text-[#0f172a]">
              {doctor?.totalReviews || 0}
            </span>
          </p>
          <p className="flex items-center justify-between">
            <span>Rating</span>
            <span className="font-semibold text-[#0f172a]">
              {Number(doctor?.averageRating || 0).toFixed(1)}
            </span>
          </p>
        </div>
      </div>

      <div className="rounded-[24px] bg-white/90 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70">
        <p className="text-sm font-semibold text-[#0f172a]">Operational Scope</p>
        <div className="mt-3 grid gap-2 text-sm text-[#334155]">
          <p className="flex items-center justify-between">
            <span>Assigned Cities</span>
            <span className="font-semibold text-[#0f172a]">{assignedCities}</span>
          </p>
          <p className="flex items-center justify-between">
            <span>Active Services</span>
            <span className="font-semibold text-[#0f172a]">{metrics.servicesCount}</span>
          </p>
          <p className="flex items-center justify-between">
            <span>Verification Docs</span>
            <span className="font-semibold text-[#0f172a]">
              {(doctor?.verificationDocuments?.degreesCertificates || []).length +
                (doctor?.verificationDocuments?.identityProof ? 1 : 0) +
                (doctor?.verificationDocuments?.medicalCouncilRegistration ? 1 : 0)}
            </span>
          </p>
        </div>
      </div>
    </aside>
  );
};

const RejectDoctorDialog = ({ open, onOpenChange, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px]">
        <DialogHeader>
          <DialogTitle>Reject Doctor Profile</DialogTitle>
          <DialogDescription>
            Add a clear rejection reason for audit trail and follow-up.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason for rejection"
          className="min-h-28 rounded-xl"
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onSubmit(reason)}
            disabled={isSubmitting || !reason.trim()}
          >
            Reject Doctor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SuspendDoctorDialog = ({ open, onOpenChange, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px]">
        <DialogHeader>
          <DialogTitle>Suspend Doctor Access</DialogTitle>
          <DialogDescription>
            Provide a suspension reason before disabling operational access.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason for suspension"
          className="min-h-28 rounded-xl"
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onSubmit(reason)}
            disabled={isSubmitting || !reason.trim()}
          >
            Suspend Doctor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteDoctorDialog = ({ open, onOpenChange, onConfirm, isSubmitting }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="rounded-[24px]">
      <DialogHeader>
        <DialogTitle className="inline-flex items-center gap-2 text-rose-700">
          <AlertTriangle className="size-5" />
          Delete Doctor Profile
        </DialogTitle>
        <DialogDescription>
          This permanently removes the doctor profile and cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
          Delete Permanently
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const StickyWorkspaceHeader = ({
  doctor,
  workflowState,
  workflowActions,
  onWorkflowAction,
  onToggleActive,
  isTogglingActive,
  isWorkflowBusy,
  onDelete,
  onEdit,
  onSocial,
}) => {
  const fullName = `Dr. ${[doctor?.firstName, doctor?.lastName]
    .filter(Boolean)
    .join(" ")}`.trim();

  const renderWorkflowButton = (action) => {
    if (action === "approve") {
      return (
        <WorkspaceActionButton
          icon={CheckCircle}
          onClick={() => onWorkflowAction("approve")}
          disabled={isWorkflowBusy}
        >
          Approve
        </WorkspaceActionButton>
      );
    }
    if (action === "under_review") {
      return (
        <WorkspaceActionButton
          icon={Loader2}
          onClick={() => onWorkflowAction("under_review")}
          className="text-blue-700"
          disabled={isWorkflowBusy}
        >
          Under Review
        </WorkspaceActionButton>
      );
    }
    if (action === "reject") {
      return (
        <WorkspaceActionButton
          icon={XCircle}
          onClick={() => onWorkflowAction("reject")}
          className="text-rose-600 hover:text-rose-700"
          disabled={isWorkflowBusy}
        >
          Reject
        </WorkspaceActionButton>
      );
    }
    if (action === "suspend") {
      return (
        <WorkspaceActionButton
          icon={PauseCircle}
          onClick={() => onWorkflowAction("suspend")}
          className="text-orange-700"
          disabled={isWorkflowBusy}
        >
          Suspend
        </WorkspaceActionButton>
      );
    }
    if (action === "reinstate") {
      return (
        <WorkspaceActionButton
          icon={CheckCircle}
          onClick={() => onWorkflowAction("reinstate")}
          disabled={isWorkflowBusy}
        >
          Reinstate
        </WorkspaceActionButton>
      );
    }
    return null;
  };

  const statusColorClass =
    workflowState === WORKFLOW_STATE.APPROVED
      ? "bg-emerald-100 text-emerald-700"
      : workflowState === WORKFLOW_STATE.REJECTED
      ? "bg-rose-100 text-rose-700"
      : workflowState === WORKFLOW_STATE.SUSPENDED
      ? "bg-orange-100 text-orange-700"
      : workflowState === WORKFLOW_STATE.UNDER_REVIEW
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="sticky top-[calc(var(--app-header-height)+12px)] z-30 rounded-[24px] border border-white/50 bg-white/74 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Link
              href="/admin/doctors"
              className="inline-flex items-center gap-1 text-[#1d4ed8] hover:text-[#1e40af]"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <span>/</span>
            <span>Doctors</span>
            <span>/</span>
            <span className="text-[#0f172a]">{fullName || "Doctor Profile"}</span>
          </div>
          <h2 className="text-lg font-semibold text-[#0f172a]">
            {fullName || "Doctor Profile"}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-full px-3 py-1 text-xs", statusColorClass)}>
              {workflowStateLabel(workflowState)}
            </Badge>
            <Badge
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                doctor?.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
              )}
            >
              {doctor?.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
              {doctor?.isPhoneVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl bg-white/80 p-2">
            <span className="text-xs font-medium text-[#64748b]">Workflow</span>
            {workflowState === WORKFLOW_STATE.APPROVED ? (
              <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                <CheckCircle className="size-3.5" />
                Approved
              </Badge>
            ) : null}
            {workflowState === WORKFLOW_STATE.REJECTED ? (
              <Badge className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700">
                <XCircle className="size-3.5" />
                Rejected
              </Badge>
            ) : null}
            {workflowState === WORKFLOW_STATE.SUSPENDED ? (
              <Badge className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">
                <PauseCircle className="size-3.5" />
                Suspended
              </Badge>
            ) : null}
            {workflowActions.map((action) => (
              <div key={action}>{renderWorkflowButton(action)}</div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl bg-white/80 p-2">
            <span className="text-xs font-medium text-[#64748b]">Management</span>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4f8] bg-white px-3 py-1.5">
              <Switch
                checked={Boolean(doctor?.isActive)}
                onCheckedChange={onToggleActive}
                disabled={isTogglingActive}
                className={cn(
                  "h-6 w-11 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300",
                  isTogglingActive && "opacity-60"
                )}
              />
              <span className="text-xs font-semibold text-[#0f172a]">
                {isTogglingActive ? "Updating..." : doctor?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <WorkspaceActionButton icon={Copy} onClick={onEdit}>
              Edit Doctor
            </WorkspaceActionButton>
            <WorkspaceActionButton icon={Users} onClick={onSocial}>
              Social Media
            </WorkspaceActionButton>
            <Button
              variant="destructive"
              size="sm"
              className="h-9 rounded-xl"
              onClick={onDelete}
              disabled={isWorkflowBusy}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DoctorDetails = ({ doctor, onRefetch }) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState(WORKFLOW_STATE.PENDING);
  const [workflowEvents, setWorkflowEvents] = useState([]);
  const [doctorState, setDoctorState] = useState(doctor);

  useEffect(() => {
    setDoctorState(doctor);
    setReviewMode(WORKFLOW_STATE.PENDING);
    setWorkflowEvents([
      {
        id: `wf-created-${doctor?._id || "x"}`,
        title: "Created",
        subtitle: "Doctor profile entered operational queue",
        date: doctor?.createdAt || new Date().toISOString(),
        tone: "primary",
        icon: Sparkles,
      },
      {
        id: `wf-status-${doctor?._id || "x"}`,
        title: `${toSentence(doctor?.verificationStatus || "pending")} state`,
        subtitle: "Current verification state loaded",
        date: doctor?.updatedAt || doctor?.createdAt || new Date().toISOString(),
        tone: "neutral",
        icon: Activity,
      },
    ]);
  }, [doctor]);

  const workflowState = useMemo(
    () => deriveWorkflowState(doctorState, reviewMode),
    [doctorState, reviewMode]
  );
  const workflowActions = useMemo(
    () => getWorkflowActions(workflowState),
    [workflowState]
  );

  const insights = useMemo(() => buildBookingInsights(doctorState), [doctorState]);

  const metrics = useMemo(
    () => ({
      totalBookings: insights.totalBookings,
      revenue: insights.revenue,
      followers: doctorState?.followersCount || 0,
      servicesCount: Array.isArray(doctorState?.services)
        ? doctorState.services.length
        : 0,
      rating: Number(doctorState?.averageRating || 0),
      upcomingAppointments: insights.upcomingFeed.length,
    }),
    [doctorState, insights]
  );

  const timelineItems = useMemo(() => {
    const baseTimeline = buildTimelineItems(doctorState, insights.upcomingFeed);
    return [...workflowEvents, ...baseTimeline].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [doctorState, insights.upcomingFeed, workflowEvents]);

  const { mutateAsync: approveDoctor, isPending: isApproving } = useApiMutation({
    url: `/admin/doctors/${doctorState?._id}/approve`,
    method: PUT,
    invalidateKey: ["doctors"],
  });

  const { mutateAsync: rejectDoctor, isPending: isRejecting } = useApiMutation({
    url: `/admin/doctors/${doctorState?._id}/reject`,
    method: PUT,
    invalidateKey: ["doctors"],
  });

  const { mutateAsync: toggleDoctor, isPending: isToggling } = useApiMutation({
    url: `/admin/doctors/${doctorState?._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["doctors"],
  });

  const { mutateAsync: deleteDoctor, isPending: isDeleting } = useApiMutation({
    url: `/admin/doctors/${doctorState?._id}`,
    method: DELETE,
    invalidateKey: ["doctors"],
  });

  const runAndRefetch = async (action) => {
    await action();
    if (typeof onRefetch === "function") {
      onRefetch();
    }
  };

  const appendWorkflowEvent = (title, subtitle, tone = "primary", icon = Activity) => {
    setWorkflowEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        subtitle,
        date: new Date().toISOString(),
        tone,
        icon,
      },
      ...prev,
    ]);
  };

  const handleApprove = async () => {
    const previous = doctorState;
    setDoctorState((prev) => ({
      ...prev,
      verificationStatus: "approved",
      isActive: true,
      verifiedAt: new Date().toISOString(),
    }));
    setReviewMode(WORKFLOW_STATE.PENDING);
    appendWorkflowEvent("Approved by Admin", "Doctor moved to approved state", "success", CheckCircle);
    try {
      await runAndRefetch(() => approveDoctor());
    } catch (error) {
      setDoctorState(previous);
      throw error;
    }
  };

  const handleUnderReview = () => {
    setDoctorState((prev) => ({
      ...prev,
      verificationStatus: "pending",
      updatedAt: new Date().toISOString(),
    }));
    setReviewMode(WORKFLOW_STATE.UNDER_REVIEW);
    appendWorkflowEvent(
      "Moved to Under Review",
      "Doctor is under verification review workflow",
      "primary",
      Loader2
    );
    toast.success("Doctor moved to under review");
  };

  const handleReject = async (reason) => {
    const previous = doctorState;
    setDoctorState((prev) => ({
      ...prev,
      verificationStatus: "rejected",
      rejectionReason: reason,
      isActive: false,
      updatedAt: new Date().toISOString(),
    }));
    setReviewMode(WORKFLOW_STATE.PENDING);
    appendWorkflowEvent("Rejected by Admin", reason, "danger", XCircle);
    try {
      await runAndRefetch(() => rejectDoctor({ reason }));
      setIsRejectDialogOpen(false);
    } catch (error) {
      setDoctorState(previous);
      throw error;
    }
  };

  const handleToggleActive = async (checked) => {
    const previous = doctorState;
    setDoctorState((prev) => ({ ...prev, isActive: checked }));
    try {
      await runAndRefetch(() => toggleDoctor({ isActive: checked }));
      appendWorkflowEvent(
        checked ? "Doctor Activated" : "Doctor Deactivated",
        checked
          ? "Operational access enabled through active switch"
          : "Operational access disabled through active switch",
        checked ? "success" : "warning",
        checked ? CheckCircle : PauseCircle
      );
    } catch (error) {
      setDoctorState(previous);
      throw error;
    }
  };

  const handleSuspend = async (reason) => {
    if (!doctorState?.isActive) {
      setIsSuspendDialogOpen(false);
      return;
    }
    const previous = doctorState;
    setDoctorState((prev) => ({ ...prev, isActive: false }));
    appendWorkflowEvent("Suspended", reason, "warning", PauseCircle);
    try {
      await runAndRefetch(() => toggleDoctor({ isActive: false, reason }));
      setIsSuspendDialogOpen(false);
    } catch (error) {
      setDoctorState(previous);
      throw error;
    }
  };

  const handleDelete = async () => {
    await deleteDoctor();
    router.push("/admin/doctors");
  };

  const onWorkflowAction = async (action) => {
    if (action === "approve" || action === "reinstate") {
      await handleApprove();
      return;
    }
    if (action === "under_review") {
      handleUnderReview();
      return;
    }
    if (action === "reject") {
      setIsRejectDialogOpen(true);
      return;
    }
    if (action === "suspend") {
      setIsSuspendDialogOpen(true);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.1, 0.3, 0.6],
      }
    );

    SECTION_ITEMS.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  const onNavigate = (id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!doctorState) {
    return (
      <StateFallback
        title="Doctor not found"
        description="The requested doctor record is not available in the current workspace."
      />
    );
  }

  const isActionBusy = isApproving || isRejecting || isToggling || isDeleting;

  return (
    <div className="space-y-5 pb-8">
      <StickyWorkspaceHeader
        doctor={doctorState}
        workflowState={workflowState}
        workflowActions={workflowActions}
        onWorkflowAction={onWorkflowAction}
        onToggleActive={handleToggleActive}
        isTogglingActive={isToggling}
        isWorkflowBusy={isActionBusy}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onEdit={() => router.push(`/admin/doctors/${doctorState?._id}/update`)}
        onSocial={() => router.push(`/admin/doctors/${doctorState?._id}/social`)}
      />

      <DoctorHeroSection
        doctor={doctorState}
        metrics={metrics}
        workflowState={workflowState}
      />

      <DoctorAnalyticsStrip metrics={metrics} />

      <DoctorStickyNav activeSection={activeSection} onNavigate={onNavigate} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <SectionShell
            id="overview"
            title="Doctor Activity Timeline"
            subtitle="Operational milestones, verification events, and engagement signals"
          >
            <DoctorTimeline items={timelineItems} />
          </SectionShell>

          <SectionShell
            id="activity"
            title="Professional Details"
            subtitle="Clinical specialization, credentials, and role intelligence"
          >
            <DoctorProfessionalCard doctor={doctorState} />
          </SectionShell>

          <SectionShell
            title="Academic Profile"
            subtitle="Degrees, certifications, residencies, and workshops"
          >
            <DoctorEducationCard doctor={doctorState} />
          </SectionShell>

          <SectionShell
            id="clinics"
            title="Clinic Operations"
            subtitle="Practice locations, timings, communication channels, and support services"
          >
            <DoctorClinicsCarousel clinics={doctorState?.clinics || []} />
          </SectionShell>

          <SectionShell
            id="services"
            title="Service Portfolio"
            subtitle="Treatment services linked to this doctor profile"
          >
            <DoctorServicesGrid doctor={doctorState} />
          </SectionShell>

          <SectionShell
            id="availability"
            title="Availability Workspace"
            subtitle="Weekly schedule, slot strategy, coverage, and appointment readiness"
          >
            <DoctorAvailabilityCalendar doctor={doctorState} />
          </SectionShell>

          <SectionShell
            id="bookings"
            title="Bookings Intelligence"
            subtitle="Status distribution, momentum tracking, and appointment feed"
          >
            <DoctorBookingsAnalytics insights={insights} />
            <div className="mt-5">
              <DoctorBookingTable rows={insights.upcomingFeed} />
            </div>
          </SectionShell>

          <SectionShell
            id="documents"
            title="Verification Documents"
            subtitle="Identity proof, degree artifacts, and medical council records"
          >
            <DoctorDocumentsGallery doctor={doctorState} />
          </SectionShell>

          <SectionShell
            id="social"
            title="Social Signals"
            subtitle="Audience footprint, engagement posture, and post readiness"
          >
            <DoctorSocialFeed doctor={doctorState} />
          </SectionShell>
        </div>

        <DoctorIntelligenceRail
          doctor={doctorState}
          metrics={metrics}
          insights={insights}
          workflowState={workflowState}
          workflowActions={workflowActions}
          onWorkflowAction={onWorkflowAction}
          onEdit={() => router.push(`/admin/doctors/${doctorState?._id}/update`)}
          onToggleActive={handleToggleActive}
          isTogglingActive={isToggling}
          isWorkflowBusy={isActionBusy}
        />
      </div>

      <RejectDoctorDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onSubmit={handleReject}
        isSubmitting={isRejecting}
      />
      <SuspendDoctorDialog
        open={isSuspendDialogOpen}
        onOpenChange={setIsSuspendDialogOpen}
        onSubmit={handleSuspend}
        isSubmitting={isToggling}
      />
      <DeleteDoctorDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />

      {isActionBusy ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-full bg-[#0f172a] px-4 py-2 text-xs font-medium text-white shadow-[0_18px_32px_rgb(15_23_42_/_0.35)]">
          Updating doctor workspace...
        </div>
      ) : null}
    </div>
  );
};

const StateFallback = ({ title, description }) => (
  <div className="rounded-[24px] bg-white/80 p-8 text-center shadow-[0_16px_34px_rgb(15_23_42_/_0.08)]">
    <p className="text-lg font-semibold text-[#0f172a]">{title}</p>
    <p className="mt-2 text-sm text-[#64748b]">{description}</p>
  </div>
);
