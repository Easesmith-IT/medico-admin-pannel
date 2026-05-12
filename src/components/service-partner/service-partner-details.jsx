"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  User,
  UserCircle2,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

import { PATCH, DELETE } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { getDisplayName } from "@/lib/display";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const SECTION_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "addresses", label: "Addresses" },
  { id: "services", label: "Services" },
  { id: "cities", label: "Cities" },
  { id: "documents", label: "Documents" },
  { id: "availability", label: "Availability" },
  { id: "appointments", label: "Appointments" },
  { id: "banking", label: "Banking" },
  { id: "approval", label: "Approval" },
  { id: "activity", label: "Activity" },
];

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STATUS_BADGE_DARK = {
  Approved: "bg-emerald-500/20 text-emerald-100 ring-emerald-300/40",
  Pending: "bg-amber-500/20 text-amber-100 ring-amber-300/40",
  "Under Review": "bg-blue-500/20 text-blue-100 ring-blue-300/40",
  Rejected: "bg-rose-500/20 text-rose-100 ring-rose-300/40",
  Suspended: "bg-orange-500/20 text-orange-100 ring-orange-300/40",
};

const STATUS_BADGE_LIGHT = {
  Approved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-100 text-amber-700 ring-amber-200",
  "Under Review": "bg-blue-100 text-blue-700 ring-blue-200",
  Rejected: "bg-rose-100 text-rose-700 ring-rose-200",
  Suspended: "bg-orange-100 text-orange-700 ring-orange-200",
};

const WORKFLOW_STATE = {
  PENDING: "pending",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

const normalizeStatus = (status = "") => String(status || "").trim().toLowerCase();

const getWorkflowState = (provider) => {
  const status = normalizeStatus(provider?.approvalStatus);
  if (status === "approved") return WORKFLOW_STATE.APPROVED;
  if (status === "rejected") return WORKFLOW_STATE.REJECTED;
  if (status === "suspended") return WORKFLOW_STATE.SUSPENDED;
  if (status === "under review" || status === "under_review") return WORKFLOW_STATE.UNDER_REVIEW;
  return WORKFLOW_STATE.PENDING;
};

const getWorkflowActions = (state) => {
  if (state === WORKFLOW_STATE.PENDING) return ["approve", "under_review", "reject"];
  if (state === WORKFLOW_STATE.UNDER_REVIEW) return ["approve", "reject"];
  if (state === WORKFLOW_STATE.APPROVED) return ["suspend"];
  if (state === WORKFLOW_STATE.REJECTED) return ["approve"];
  if (state === WORKFLOW_STATE.SUSPENDED) return ["reinstate"];
  return [];
};

const getWorkflowStateLabel = (state) => {
  if (state === WORKFLOW_STATE.APPROVED) return "Approved";
  if (state === WORKFLOW_STATE.REJECTED) return "Rejected";
  if (state === WORKFLOW_STATE.SUSPENDED) return "Suspended";
  if (state === WORKFLOW_STATE.UNDER_REVIEW) return "Under Review";
  return "Pending";
};

const APPOINTMENT_COLORS = {
  Pending: "#f59e0b",
  Approved: "#2563eb",
  "In Progress": "#0ea5e9",
  Completed: "#10b981",
  Cancelled: "#ef4444",
};

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const toSentence = (value = "") => {
  if (!value) return "Not available";
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const initialsFromName = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "SP";

const maskedText = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "Not available";
  if (text.length <= 4) return text;
  return `${"*".repeat(Math.max(0, text.length - 4))}${text.slice(-4)}`;
};

const maskBankAccount = (value = "") => {
  const digits = String(value || "").replace(/\s+/g, "");
  if (!digits) return "Not available";
  if (digits.length <= 4) return digits;
  return `**** **** ${digits.slice(-4)}`;
};

const slotToText = (slot = {}) => {
  const start = slot?.startTime || "--";
  const end = slot?.endTime || "--";
  return `${start} - ${end}`;
};

const getBookingStats = (provider) => {
  const stats = provider?.bookingStats || {};
  const raw = stats.statusBreakdown || {};

  const normalizedStatus = {
    Pending: Number(raw.Pending || 0),
    Approved: Number((raw.Approved || 0) + (raw.Confirmed || 0)),
    "In Progress": Number((raw["In-Progress"] || 0) + (raw.Started || 0)),
    Completed: Number((raw.Completed || 0) + (raw.TreatmentCompleted || 0)),
    Cancelled: Number(
      (raw.Cancelled || 0) + (raw.Rejected || 0) + (raw["Cancellation Requested"] || 0)
    ),
  };

  const totalBookings =
    Number(stats.totalBookings) ||
    Object.values(normalizedStatus).reduce((sum, value) => sum + value, 0);

  const cancellationRate =
    typeof stats.cancellationRate === "number"
      ? stats.cancellationRate
      : totalBookings > 0
      ? Number(((normalizedStatus.Cancelled / totalBookings) * 100).toFixed(2))
      : 0;

  return {
    totalBookings,
    thisMonthBookings: Number(stats.thisMonthBookings || 0),
    todayBookings: Number(stats.todayBookings || 0),
    totalRevenue: Number(stats.totalRevenue || 0),
    collectedRevenue: Number(stats.collectedRevenue || 0),
    pendingPayments: Number(stats.pendingPayments || 0),
    cancellationRate,
    activeServices: Array.isArray(provider?.services) ? provider.services.length : 0,
    rating: Number(provider?.rating?.average || 0),
    completedJobs: normalizedStatus.Completed,
    statusBreakdown: normalizedStatus,
    upcomingBookingsCount: Number(stats.upcomingBookings || 0),
  };
};

const buildWeeklySchedule = (provider) => {
  const availableDays = new Set((provider?.availability?.days || []).map((item) => item.toLowerCase()));
  const slots = provider?.availability?.timeSlots || [];
  const slotLines = slots.length ? slots.map(slotToText) : [];

  return DAY_ORDER.map((day) => ({
    day,
    off: !availableDays.has(day.toLowerCase()),
    slots: slotLines,
  }));
};

const buildTimelineItems = (provider) => {
  const items = [];
  const fullName = getDisplayName(provider);
  const completed = Number(provider?.bookingStats?.statusBreakdown?.Completed || 0);
  const revenue = Number(provider?.bookingStats?.totalRevenue || 0);

  items.push({
    id: "profile-created",
    title: "Profile onboarded",
    description: `${fullName || "Provider"} profile entered operations workspace`,
    actor: "System",
    timestamp: provider?.createdAt,
    icon: UserRoundCheck,
    tone: "info",
  });

  if (provider?.approvalStatus === "Approved") {
    items.push({
      id: "approval",
      title: "Verification approved",
      description:
        provider?.approvedBy?.adminName
          ? `Approved by ${provider.approvedBy.adminName}`
          : "Provider credentials approved",
      actor: provider?.approvedBy?.adminName || "Admin",
      timestamp: provider?.approvedBy?.approvedAt || provider?.updatedAt,
      icon: CheckCircle2,
      tone: "success",
    });
  }

  if (provider?.rejectionReason) {
    items.push({
      id: "rejected",
      title: "Verification rejected",
      description: provider.rejectionReason,
      actor: "Admin",
      timestamp: provider?.updatedAt,
      icon: XCircle,
      tone: "danger",
    });
  }

  if (provider?.suspensionReason) {
    items.push({
      id: "suspended",
      title: "Provider suspended",
      description: provider.suspensionReason,
      actor: "Admin",
      timestamp: provider?.updatedAt,
      icon: ShieldAlert,
      tone: "warning",
    });
  }

  if ((provider?.services || []).length > 0) {
    items.push({
      id: "service-added",
      title: "Service capability updated",
      description: `${provider.services.length} active service capability records`,
      actor: "Operations",
      timestamp: provider?.updatedAt,
      icon: Activity,
      tone: "info",
    });
  }

  if ((provider?.serviceCities || []).length > 0) {
    items.push({
      id: "cities-updated",
      title: "City coverage updated",
      description: `${provider.serviceCities.length} assigned service cities`,
      actor: "Operations",
      timestamp: provider?.updatedAt,
      icon: MapPin,
      tone: "info",
    });
  }

  items.push({
    id: "availability",
    title: "Availability configured",
    description: provider?.availability?.available24x7
      ? "Provider marked as available 24x7"
      : "Weekly slot schedule configured",
    actor: "Provider",
    timestamp: provider?.updatedAt,
    icon: Clock3,
    tone: "success",
  });

  if (provider?.bankDetails?.accountNumber) {
    items.push({
      id: "bank",
      title: "Bank details linked",
      description: `Account ending ${String(provider.bankDetails.accountNumber).slice(-4)}`,
      actor: "Finance Desk",
      timestamp: provider?.updatedAt,
      icon: Banknote,
      tone: "success",
    });
  }

  const docs = provider?.documents || {};
  if (docs?.identityProof?.documentUrl || docs?.addressProof?.documentUrl) {
    items.push({
      id: "doc-upload",
      title: "Document upload completed",
      description: "Identity and address proofs available for verification",
      actor: "Provider",
      timestamp: provider?.updatedAt,
      icon: FileCheck2,
      tone: "info",
    });
  }

  if (completed > 0) {
    items.push({
      id: "booking-completed",
      title: "Booking completed",
      description: `${completed} completed appointment(s)`,
      actor: "Ops Automation",
      meta: `Amount ${formatCurrency(revenue)}`,
      timestamp: provider?.updatedAt,
      icon: CheckCircle2,
      tone: "success",
    });
  }

  return items
    .filter((item) => item.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const getDocumentGroups = (provider) => {
  const docs = provider?.documents || {};

  return [
    {
      id: "identity",
      title: "Identity Proof",
      required: true,
      rows: docs?.identityProof?.documentUrl
        ? [
            {
              name: docs.identityProof.type || "Identity proof",
              number: maskedText(docs.identityProof.documentNumber),
              verified: Boolean(docs.identityProof.verified),
              uploaded: true,
              url: docs.identityProof.documentUrl,
            },
          ]
        : [],
    },
    {
      id: "address",
      title: "Address Proof",
      required: true,
      rows: docs?.addressProof?.documentUrl
        ? [
            {
              name: docs.addressProof.type || "Address proof",
              number: "Document uploaded",
              verified: Boolean(docs.addressProof.verified),
              uploaded: true,
              url: docs.addressProof.documentUrl,
            },
          ]
        : [],
    },
    {
      id: "education",
      title: "Educational Certificates",
      required: true,
      rows: (docs.educationalCertificates || [])
        .filter((item) => item?.certificateUrl)
        .map((item) => ({
          name: item.degree || "Educational certificate",
          number: item.institution || "Institution not provided",
          verified: Boolean(item.verified),
          uploaded: true,
          url: item.certificateUrl,
        })),
    },
    {
      id: "professional",
      title: "Professional Certificates",
      required: true,
      rows: (docs.professionalCertificates || [])
        .filter((item) => item?.certificateUrl)
        .map((item) => ({
          name: item.certificateName || "Professional certificate",
          number: item.issuingAuthority || "Issuing authority not provided",
          verified: Boolean(item.verified),
          uploaded: true,
          url: item.certificateUrl,
        })),
    },
    {
      id: "registration",
      title: "Registration Certificate",
      required: true,
      rows: docs?.registrationCertificate?.certificateUrl
        ? [
            {
              name: "Registration certificate",
              number: provider?.registrationNumber || "Registration number unavailable",
              verified: Boolean(docs.registrationCertificate.verified),
              uploaded: true,
              url: docs.registrationCertificate.certificateUrl,
            },
          ]
        : [],
    },
    {
      id: "experience",
      title: "Experience Certificates",
      required: true,
      rows: (docs.experienceCertificates || [])
        .filter((item) => item?.certificateUrl)
        .map((item) => ({
          name: item.organization || "Experience certificate",
          number: item.role || "Role not provided",
          verified: Boolean(item.verified),
          uploaded: true,
          url: item.certificateUrl,
        })),
    },
    {
      id: "police",
      title: "Police Verification",
      required: true,
      rows: docs?.policeVerification?.certificateUrl
        ? [
            {
              name: "Police verification",
              number: docs.policeVerification.issueDate
                ? `Issued ${formatDate(docs.policeVerification.issueDate)}`
                : "Issue date unavailable",
              verified: Boolean(docs.policeVerification.verified),
              uploaded: true,
              url: docs.policeVerification.certificateUrl,
            },
          ]
        : [],
    },
  ];
};

const getAppointments = (provider) =>
  Array.isArray(provider?.upcomingBookings) ? provider.upcomingBookings : [];

const getPatientName = (patient) =>
  [patient?.firstName, patient?.lastName].filter(Boolean).join(" ") || "Patient";

const getServiceName = (service) => service?.name || "Service";

const toneClasses = {
  info: "bg-blue-500/15 text-blue-700 border-blue-200/80",
  success: "bg-emerald-500/15 text-emerald-700 border-emerald-200/80",
  warning: "bg-amber-500/15 text-amber-700 border-amber-200/80",
  danger: "bg-rose-500/15 text-rose-700 border-rose-200/80",
};

const AnimatedCount = ({ value, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 600;
    const start = performance.now();
    let rafId = null;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const current = target * progress;
      setDisplayValue(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value]);

  const rounded = Number.isInteger(value) ? Math.round(displayValue) : displayValue.toFixed(1);
  return (
    <span>
      {prefix}
      {rounded}
      {suffix}
    </span>
  );
};

const DetailChip = ({ icon: Icon, label, value }) => (
  <div className="min-w-0 rounded-2xl bg-[rgba(255,255,255,0.85)] p-4 shadow-[0_10px_26px_rgb(15_23_42_/_0.04)]">
    <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#94a3b8]">
      <Icon className="size-3.5" />
      {label}
    </p>
    <p className="mt-2 text-base font-semibold text-[#0f172a] [overflow-wrap:anywhere] break-words">{value || "Not available"}</p>
  </div>
);

const SectionShell = ({ id, title, subtitle, children }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.18 }}
    transition={{ duration: 0.32, ease: "easeOut" }}
    className="min-w-0 scroll-mt-44 rounded-[28px] bg-[rgba(255,255,255,0.85)] p-6 shadow-[0_18px_44px_rgb(15_23_42_/_0.08)] backdrop-blur-sm sm:p-8"
  >
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight text-[#0f172a]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p> : null}
    </div>
    {children}
  </motion.section>
);

const EmptyState = ({ title, description }) => (
  <div className="min-w-0 rounded-[22px] bg-[#f8fbff] p-8 text-center shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]">
    <p className="text-base font-semibold text-[#0f172a]">{title}</p>
    <p className="mt-1 text-sm text-[#64748b]">{description}</p>
  </div>
);

export const ServicePartnerHeader = ({
  provider,
  workflowState,
  workflowActions,
  onWorkflowAction,
  onEdit,
  onViewAppointments,
  onDelete,
  onToggleActive,
  isMutating,
}) => {
  const fullName = getDisplayName(provider);
  const roleLabel =
    provider?.services?.[0]?.specialization ||
    provider?.services?.[0]?.serviceName ||
    "Healthcare Service Specialist";

  const renderWorkflowButton = (action) => {
    if (action === "approve") {
      return (
        <Button onClick={() => onWorkflowAction("approve")} className="h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={isMutating}>
          Approve
        </Button>
      );
    }
    if (action === "under_review") {
      return (
        <Button onClick={() => onWorkflowAction("under_review")} variant="outline" className="h-9 rounded-xl border-[#bfdbfe] bg-blue-50 text-blue-700" disabled={isMutating}>
          Under Review
        </Button>
      );
    }
    if (action === "suspend") {
      return (
        <Button onClick={() => onWorkflowAction("suspend")} variant="outline" className="h-9 rounded-xl border-[#fed7aa] bg-orange-50 text-orange-700" disabled={isMutating}>
          Suspend
        </Button>
      );
    }
    if (action === "reject") {
      return (
        <Button onClick={() => onWorkflowAction("reject")} className="h-9 rounded-xl bg-rose-600 hover:bg-rose-700" disabled={isMutating}>
          Reject
        </Button>
      );
    }
    if (action === "reinstate") {
      return (
        <Button onClick={() => onWorkflowAction("reinstate")} className="h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={isMutating}>
          Reinstate
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="sticky top-[calc(var(--app-header-height)_+_6px)] z-[70] min-w-0 rounded-[24px] bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_16px_34px_rgb(15_23_42_/_0.1)] backdrop-blur-xl sm:p-5">
      <div className="min-w-0 space-y-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-[#64748b]">
          <Link href="/admin/service-partners" className="inline-flex items-center gap-1 text-[#1d4ed8] hover:text-[#1e40af]">
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <span>/</span>
          <span>Service Providers</span>
          <span>/</span>
          <span className="max-w-full font-medium text-[#0f172a] [overflow-wrap:anywhere] break-words">{fullName || "Provider"}</span>
        </div>

        <div className="flex min-w-0 flex-wrap items-start justify-between gap-4 rounded-2xl bg-white/75 p-3 sm:p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar className="size-14 border-2 border-white shadow-[0_10px_20px_rgb(15_23_42_/_0.12)]">
              <AvatarImage src={provider?.documents?.profilePhoto} alt={fullName} />
              <AvatarFallback className="bg-[#e2e8f0] text-sm font-semibold text-[#0f172a]">
                {initialsFromName(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-[#0f172a] [overflow-wrap:anywhere] break-words">{fullName || "Service Provider"}</h1>
              <p className="text-sm text-[#64748b] [overflow-wrap:anywhere] break-words">{roleLabel}</p>
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                <Badge className={cn("rounded-full border-0 px-3 py-1 text-xs ring-1", STATUS_BADGE_LIGHT[getWorkflowStateLabel(workflowState)] || STATUS_BADGE_LIGHT.Pending)}>
                  {getWorkflowStateLabel(workflowState)}
                </Badge>
                <Badge className={cn("rounded-full border-0 px-3 py-1 text-xs", provider?.isVerified ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-700")}>
                  {provider?.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1">
                  <Switch
                    checked={Boolean(provider?.isActive)}
                    onCheckedChange={onToggleActive}
                    disabled={isMutating}
                    className="h-5 w-9 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300"
                  />
                  <span className="text-xs font-semibold text-emerald-700">{provider?.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Workflow</p>
              <div className="flex min-w-0 flex-wrap gap-2">
                {workflowActions.map((action) => (
                  <div key={action}>{renderWorkflowButton(action)}</div>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Management</p>
              <div className="flex min-w-0 flex-wrap gap-2">
                <Button onClick={onEdit} variant="outline" size="sm" className="h-9 rounded-xl border-[#bfdbfe] bg-white text-[#1d4ed8]">
                  Edit
                </Button>
                <Button onClick={onViewAppointments} variant="outline" size="sm" className="h-9 rounded-xl border-[#dbe4f8] bg-white text-[#334155]">
                  View
                </Button>
                <Button onClick={onDelete} variant="destructive" size="sm" className="h-9 rounded-xl" disabled={isMutating}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ServicePartnerHero = ({ provider, stats, onEdit, onViewAppointments, onSuspend }) => {
  const fullName = getDisplayName(provider);
  const title = provider?.services?.[0]?.specialization || provider?.services?.[0]?.serviceName || "Senior Nursing Care Specialist";
  const rating = Number(provider?.rating?.average || 0).toFixed(1);
  const jobs = stats?.completedJobs || 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative min-h-[240px] min-w-0 overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_30%),linear-gradient(135deg,#0f172a,#172554)] p-8 text-white shadow-[0_30px_60px_rgb(15_23_42_/_0.28)] sm:p-10"
    >
      <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[#2563eb]/16 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-[#38bdf8]/8 blur-3xl" />

      <div className="relative grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-start gap-5">
            <div className="rounded-full bg-gradient-to-br from-[#93c5fd] via-[#2563eb] to-[#1d4ed8] p-[3px] shadow-[0_16px_36px_rgb(37_99_235_/_0.48)]">
              <Avatar className="size-[132px] border-2 border-white/40">
                <AvatarImage src={provider?.documents?.profilePhoto} alt={fullName} />
                <AvatarFallback className="bg-[#0f172a] text-3xl font-semibold text-white">
                  {initialsFromName(fullName)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 space-y-4">
              <div className="min-w-0">
                <h2 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-white [overflow-wrap:anywhere] break-words">{fullName || "Service Partner"}</h2>
                <p className="mt-1 text-base text-slate-300 [overflow-wrap:anywhere] break-words">{title}</p>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-200">
                <Star className="size-4 fill-amber-300 text-amber-300" />
                <span>{rating}</span>
                <span>|</span>
                <span>{jobs} completed jobs</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={cn("rounded-full border-0 px-3 py-1.5 text-xs ring-1", STATUS_BADGE_DARK[provider?.approvalStatus] || STATUS_BADGE_DARK.Pending)}>
                  {provider?.approvalStatus || "Pending"}
                </Badge>
                <Badge className="rounded-full border-0 bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-100 ring-1 ring-emerald-300/40">
                  {provider?.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge className="rounded-full border-0 bg-sky-500/20 px-3 py-1.5 text-xs text-sky-100 ring-1 ring-sky-300/40">
                  {provider?.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge className="rounded-full border-0 bg-cyan-500/20 px-3 py-1.5 text-xs text-cyan-100 ring-1 ring-cyan-300/40">
                  {provider?.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 text-sm text-slate-200 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <p className="flex min-w-0 items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-slate-300" />
              <span className="min-w-0 [overflow-wrap:anywhere] break-words">{provider?.mobile || "Not provided"}</span>
            </p>
            <p className="flex min-w-0 items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-slate-300" />
              <span className="min-w-0 [overflow-wrap:anywhere] break-words">{provider?.email || "Not provided"}</span>
            </p>
            <p className="flex min-w-0 items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-slate-300" />
              <span className="min-w-0 [overflow-wrap:anywhere] break-words">
                {provider?.currentAddress?.city || "City"}, {provider?.currentAddress?.state || "State"}
              </span>
            </p>
            <p className="flex min-w-0 items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-300" />
              <span className="min-w-0 [overflow-wrap:anywhere] break-words">{provider?.registrationNumber || "MSP ID pending"}</span>
            </p>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 self-start">
          <Button className="h-10 rounded-xl bg-white text-[#0f172a] hover:bg-slate-100" onClick={onEdit}>
            Edit
          </Button>
          <Button className="h-10 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20" onClick={onViewAppointments}>
            View Appointments
          </Button>
          <Button className="h-10 rounded-xl border border-rose-300/50 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20" onClick={onSuspend}>
            Suspend
          </Button>
        </div>
      </div>
    </motion.section>
  );
};

export const AnalyticsStrip = ({ stats }) => {
  const cards = [
    { label: "Total Appointments", value: stats.totalBookings, icon: CalendarClock, trend: "+8%" },
    { label: "This Month", value: stats.thisMonthBookings, icon: Activity, trend: "+4%" },
    { label: "Revenue", value: formatCurrency(stats.totalRevenue), icon: IndianRupee, trend: "+12%" },
    { label: "Pending Payments", value: formatCurrency(stats.pendingPayments), icon: Banknote, trend: "-3%" },
    { label: "Active Services", value: stats.activeServices, icon: FileCheck2, trend: "+2%" },
    { label: "Rating", value: stats.rating.toFixed(1), icon: Star, trend: "+0.2" },
  ];

  return (
    <div className="grid min-w-0 gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04, duration: 0.26 }}
          className="min-w-0 rounded-[24px] bg-[rgba(255,255,255,0.85)] p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.07)] backdrop-blur-xl"
        >
          <p className="flex min-w-0 items-center gap-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#94a3b8]">
            <card.icon className="size-4 text-[#2563eb]" />
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#0f172a] [overflow-wrap:anywhere] break-words">
            {typeof card.value === "number" ? <AnimatedCount value={card.value} /> : card.value}
          </p>
          <p className="mt-1 text-xs text-[#64748b]">{card.trend} vs last period</p>
        </motion.div>
      ))}
    </div>
  );
};

export const StickySectionNav = ({ activeSection, onNavigate }) => (
  <div className="sticky top-[calc(var(--app-header-height)_+_112px)] z-30 min-w-0 rounded-[20px] bg-[rgba(255,255,255,0.88)] p-2 shadow-[0_10px_26px_rgb(15_23_42_/_0.08)] backdrop-blur-md">
    <div className="flex min-w-0 gap-2 overflow-x-auto overflow-y-visible">
      {SECTION_ITEMS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onNavigate(section.id)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
            activeSection === section.id
              ? "bg-[#2563eb] text-white shadow-[0_10px_24px_rgb(37_99_235_/_0.35)]"
              : "bg-[#eef3ff] text-[#334155] hover:bg-[#dbe7ff]"
          )}
        >
          {section.label}
        </button>
      ))}
    </div>
  </div>
);

export const ProviderTimeline = ({ items }) => {
  if (!items.length) {
    return <EmptyState title="No activity yet" description="Workflow actions and operational updates will appear here." />;
  }

  return (
    <div className="relative min-w-0 space-y-4 pl-4">
      <div className="absolute left-1 top-2 h-[calc(100%-10px)] w-px bg-gradient-to-b from-[#bfdbfe] to-[#e2e8f0]" />
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.24 }}
          className="relative min-w-0 rounded-2xl bg-[rgba(255,255,255,0.85)] p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.05)]"
        >
          <span className={cn("absolute -left-[21px] top-5 flex size-8 items-center justify-center rounded-full border", toneClasses[item.tone] || toneClasses.info)}>
            <item.icon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#0f172a] [overflow-wrap:anywhere] break-words">{item.title}</p>
            <span className="text-xs text-[#64748b]">{formatDateTime(item.timestamp)}</span>
          </div>
          <p className="mt-1 text-sm text-[#64748b] [overflow-wrap:anywhere] break-words">{item.description}</p>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-xs text-[#64748b]">
            <Badge className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">By {item.actor || "System"}</Badge>
            {item.meta ? <span className="[overflow-wrap:anywhere] break-words">{item.meta}</span> : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const ServicesGrid = ({ services }) => {
  if (!services?.length) {
    return <EmptyState title="No active services" description="Add a service capability to start receiving appointments." />;
  }

  const colors = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#7c3aed"];

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service, index) => (
        <motion.div
          key={`${service?.serviceId?._id || service?.serviceName || "service"}-${index}`}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
          className="min-w-0 rounded-[22px] bg-[rgba(255,255,255,0.85)] p-5 shadow-[0_12px_28px_rgb(15_23_42_/_0.06)]"
          style={{ borderTop: `3px solid ${colors[index % colors.length]}` }}
        >
          <p className="text-base font-semibold text-[#0f172a] [overflow-wrap:anywhere] break-words">{service?.serviceName || service?.serviceId?.name || "Service"}</p>
          <p className="mt-1 text-sm text-[#64748b] [overflow-wrap:anywhere] break-words">{service?.specialization || "General specialization"}</p>

          <div className="mt-4 space-y-2 text-sm text-[#334155]">
            <p>{Number(service?.experienceYears || 0)} Years Experience</p>
            <p>{toSentence(service?.serviceId?.category || service?.category || "Category not set")}</p>
            <p className="font-semibold text-[#0f172a]">{formatCurrency(service?.serviceId?.basePrice || 0)} / visit</p>
          </div>

          <Badge className="mt-4 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">Active</Badge>
        </motion.div>
      ))}
    </div>
  );
};

export const ServiceCitiesCard = ({ cities }) => {
  if (!cities?.length) {
    return <EmptyState title="No city assignments" description="Assign cities to enable coverage expansion for this provider." />;
  }

  return (
    <div className="rounded-[24px] bg-[#f8fbff] p-5">
      <div className="flex flex-wrap gap-2">
        {cities.map((city, index) => (
          <Badge
            key={`${city?._id || city?.name || "city"}-${index}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs",
              city?.isActive === false ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-700"
            )}
          >
            {city?.name || "City"} {city?.isActive === false ? "(Inactive)" : "(Active)"}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export const AvailabilitySchedule = ({ provider }) => {
  const rows = buildWeeklySchedule(provider);

  return (
    <div className="min-w-0 space-y-4">
      <div className="min-w-0 rounded-[24px] bg-[#f8fbff] p-5">
        <div className="grid min-w-0 gap-3">
          {rows.map((row) => (
            <div key={row.day} className="grid min-w-0 grid-cols-[70px_minmax(0,1fr)] items-center gap-4 rounded-xl bg-white p-3">
              <p className="text-sm font-semibold text-[#0f172a]">{row.day.slice(0, 3)}</p>
              {row.off ? (
                <p className="text-sm font-medium text-[#94a3b8]">OFF</p>
              ) : (
                <p className="min-w-0 text-sm text-[#334155] [overflow-wrap:anywhere] break-words">{row.slots.join(" | ") || "Slots not configured"}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailChip icon={Clock3} label="Available 24x7" value={provider?.availability?.available24x7 ? "Yes" : "No"} />
        <DetailChip icon={CheckCircle2} label="Coverage Status" value={provider?.isAvailable ? "Active Coverage" : "Coverage Paused"} />
      </div>
    </div>
  );
};

export const BankingCard = ({ bankDetails }) => {
  const [showFull, setShowFull] = useState(false);
  const accountNumber = showFull ? bankDetails?.accountNumber : maskBankAccount(bankDetails?.accountNumber);

  return (
    <div className="min-w-0 rounded-[24px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 text-white shadow-[0_20px_40px_rgb(15_23_42_/_0.28)]">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.08em] text-slate-300">Secure Banking</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowFull((prev) => !prev)}
          className="h-8 rounded-lg border-white/40 bg-white/10 text-white hover:bg-white/20"
        >
          {showFull ? "Hide Full" : "Show Full"}
        </Button>
      </div>

      <p className="mt-6 min-w-0 text-2xl font-semibold tracking-[0.08em] [overflow-wrap:anywhere] break-words">{accountNumber || "Not available"}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <DetailChip icon={User} label="Account Holder" value={bankDetails?.accountHolderName} />
        <DetailChip icon={Banknote} label="IFSC" value={bankDetails?.ifscCode} />
        <DetailChip icon={ShieldCheck} label="Bank" value={bankDetails?.bankName || "Not provided"} />
        <DetailChip icon={MapPin} label="Branch" value={bankDetails?.branchName || "Not provided"} />
      </div>
    </div>
  );
};

export const DocumentsDashboard = ({ provider }) => {
  const groups = useMemo(() => getDocumentGroups(provider), [provider]);
  const required = groups.filter((group) => group.required).length;
  const uploaded = groups.filter((group) => group.rows.length > 0).length;
  const verified = groups.filter((group) => group.rows.length > 0 && group.rows.every((row) => row.verified)).length;
  const uploadCompletion = required ? Math.round((uploaded / required) * 100) : 0;
  const verificationCompletion = required ? Math.round((verified / required) * 100) : 0;

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailChip icon={FileText} label="Total Required" value={required} />
        <DetailChip icon={FileCheck2} label="Uploaded" value={uploaded} />
        <DetailChip icon={BadgeCheck} label="Verified" value={verified} />
        <DetailChip icon={Activity} label="Completion" value={`${uploadCompletion}%`} />
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-2xl bg-[#f8fbff] p-4">
          <p className="text-sm font-semibold text-[#0f172a]">Upload Completion</p>
          <Progress value={uploadCompletion} className="mt-3 bg-[#dbeafe]" />
          <p className="mt-2 text-xs text-[#64748b]">{uploadCompletion}% documents uploaded</p>
        </div>
        <div className="min-w-0 rounded-2xl bg-[#f8fbff] p-4">
          <p className="text-sm font-semibold text-[#0f172a]">Verification Completion</p>
          <Progress value={verificationCompletion} className="mt-3 bg-[#d1fae5]" />
          <p className="mt-2 text-xs text-[#64748b]">{verificationCompletion}% documents verified</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.id} className="min-w-0 rounded-[22px] bg-[rgba(255,255,255,0.85)] p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.05)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0f172a]">{group.title}</p>
              <Badge className={cn("rounded-full px-2.5 py-1 text-xs", group.rows.length ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>
                {group.rows.length ? "Uploaded" : "Pending"}
              </Badge>
            </div>

            {!group.rows.length ? (
              <p className="text-sm text-[#94a3b8]">No document uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {group.rows.map((row, idx) => (
                  <div key={`${group.id}-${idx}`} className="min-w-0 rounded-xl bg-[#f8fbff] p-3">
                    <p className="text-sm font-semibold text-[#0f172a] [overflow-wrap:anywhere] break-words">{row.name}</p>
                    <p className="mt-1 text-xs text-[#64748b] [overflow-wrap:anywhere] break-words">{row.number}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge className={cn("rounded-full px-2.5 py-1 text-xs", row.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                        {row.verified ? "Verified" : "Under Review"}
                      </Badge>
                      <a href={row.url} target="_blank" rel="noreferrer">
                        <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg border-[#dbe4f8] bg-white text-xs">
                          Preview
                        </Button>
                      </a>
                      <a href={row.url} target="_blank" rel="noreferrer">
                        <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg border-[#dbe4f8] bg-white text-xs">
                          <Download className="size-3.5" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AppointmentsDashboard = ({ provider, stats }) => {
  const rows = getAppointments(provider);
  const chartData = Object.entries(stats.statusBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <DetailChip icon={CalendarClock} label="Total Appointments" value={stats.totalBookings} />
        <DetailChip icon={Activity} label="This Month" value={stats.thisMonthBookings} />
        <DetailChip icon={Clock3} label="Today" value={stats.todayBookings} />
        <DetailChip icon={IndianRupee} label="Revenue" value={formatCurrency(stats.totalRevenue)} />
        <DetailChip icon={BadgeCheck} label="Collected Revenue" value={formatCurrency(stats.collectedRevenue)} />
        <DetailChip icon={Banknote} label="Pending Payments" value={formatCurrency(stats.pendingPayments)} />
        <DetailChip icon={XCircle} label="Cancellation Rate" value={`${stats.cancellationRate}%`} />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-[24px] bg-[#f8fbff] p-5">
          <p className="text-sm font-semibold text-[#0f172a]">Status Distribution</p>
          <div className="mt-4 h-56">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={APPOINTMENT_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No appointment history" description="Appointment chart will appear once bookings are available." />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {chartData.map((entry) => (
              <span key={entry.name} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-[#334155]">
                <span className="size-2 rounded-full" style={{ backgroundColor: APPOINTMENT_COLORS[entry.name] || "#94a3b8" }} />
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="min-w-0 rounded-[24px] bg-[#f8fbff] p-5">
            <p className="text-sm font-semibold text-[#0f172a]">Recent Appointment Feed</p>
            {!rows.length ? (
              <div className="mt-3">
                <EmptyState title="No upcoming appointments" description="Upcoming provider bookings will appear here." />
              </div>
            ) : (
              <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-2">
                {rows.slice(0, 4).map((row) => (
                  <div key={row._id} className="min-w-0 rounded-xl bg-white p-3 shadow-[0_8px_20px_rgb(15_23_42_/_0.05)]">
                    <p className="text-sm font-semibold text-[#0f172a]">{getPatientName(row.patientId)}</p>
                    <p className="mt-0.5 text-xs text-[#64748b]">{getServiceName(row.serviceId)}</p>
                    <p className="mt-2 text-xs text-[#334155]">{formatDate(row.appointmentDate)} | {row?.slotTime?.startTime || "--"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700">{row.status || "Pending"}</Badge>
                      <Badge className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{row.paymentStatus || "Unpaid"}</Badge>
                      <Badge className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">
                        {formatCurrency(row?.pricing?.totalAmount || 0)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-[24px] bg-[rgba(255,255,255,0.85)] p-4 shadow-[0_12px_26px_rgb(15_23_42_/_0.05)]">
            <p className="mb-3 text-sm font-semibold text-[#0f172a]">Appointments Table</p>
            {!rows.length ? (
              <EmptyState title="No records to display" description="Appointment rows will load once bookings are assigned." />
            ) : (
              <div className="table-wrapper min-w-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-2">
                            <Avatar className="size-8">
                              <AvatarImage src={row?.patientId?.profilePhoto} />
                              <AvatarFallback className="text-xs">{initialsFromName(getPatientName(row.patientId))}</AvatarFallback>
                            </Avatar>
                            <span className="[overflow-wrap:anywhere] break-words">{getPatientName(row.patientId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getServiceName(row.serviceId)}</TableCell>
                        <TableCell>
                          {formatDate(row.appointmentDate)}
                          <br />
                          <span className="text-xs text-[#64748b]">{row?.slotTime?.startTime || "--"}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700">{row.status || "Pending"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{row.paymentStatus || "Unpaid"}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(row?.pricing?.totalAmount || 0)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="h-8 rounded-lg border-[#dbe4f8] bg-white text-xs">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ApprovalWorkflowCard = ({ provider }) => {
  const events = [
    {
      id: "approval-status",
      title: `Status: ${provider?.approvalStatus || "Pending"}`,
      description: "Current approval lifecycle state",
      date: provider?.updatedAt || provider?.createdAt,
      icon: ShieldCheck,
    },
    provider?.approvedBy?.approvedAt
      ? {
          id: "approved-by",
          title: `Approved by ${provider?.approvedBy?.adminName || "Admin"}`,
          description: "Approval timestamp recorded in audit trail",
          date: provider?.approvedBy?.approvedAt,
          icon: CheckCircle2,
        }
      : null,
    provider?.rejectionReason
      ? {
          id: "rejection",
          title: "Rejection reason",
          description: provider.rejectionReason,
          date: provider?.updatedAt,
          icon: XCircle,
        }
      : null,
    provider?.suspensionReason
      ? {
          id: "suspension",
          title: "Suspension reason",
          description: provider.suspensionReason,
          date: provider?.updatedAt,
          icon: ShieldAlert,
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-2xl bg-[#f8fbff] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
              <event.icon className="size-4 text-[#2563eb]" />
              {event.title}
            </p>
            <span className="text-xs text-[#64748b]">{formatDateTime(event.date)}</span>
          </div>
          <p className="mt-1 text-sm text-[#64748b]">{event.description}</p>
        </div>
      ))}
    </div>
  );
};

export const IntelligenceSidebar = ({
  provider,
  workflowState,
  workflowActions,
  onWorkflowAction,
  stats,
  upcoming,
  onEdit,
  isMutating,
}) => (
  <div className="sticky top-[calc(var(--app-header-height)_+_12px)] min-w-0 space-y-4 rounded-[24px] bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_16px_34px_rgb(15_23_42_/_0.08)] backdrop-blur-xl xl:w-[320px] xl:min-w-[320px] xl:shrink-0">
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748b]">Quick Actions</p>
      <div className="mt-3 grid min-w-0 gap-2">
        {workflowActions.map((action) => {
          if (action === "approve" || action === "reinstate") {
            return (
              <Button key={action} className="h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={() => onWorkflowAction(action)} disabled={isMutating}>
                {action === "reinstate" ? "Reinstate" : "Approve"}
              </Button>
            );
          }
          if (action === "under_review") {
            return (
              <Button key={action} variant="outline" className="h-9 rounded-xl border-[#bfdbfe] bg-blue-50 text-blue-700" onClick={() => onWorkflowAction(action)} disabled={isMutating}>
                Under Review
              </Button>
            );
          }
          if (action === "suspend") {
            return (
              <Button key={action} variant="outline" className="h-9 rounded-xl border-[#fed7aa] bg-orange-50 text-orange-700" onClick={() => onWorkflowAction(action)} disabled={isMutating}>
                Suspend
              </Button>
            );
          }
          if (action === "reject") {
            return (
              <Button key={action} className="h-9 rounded-xl bg-rose-600 hover:bg-rose-700" onClick={() => onWorkflowAction(action)} disabled={isMutating}>
                Reject
              </Button>
            );
          }
          return null;
        })}
        <Button variant="outline" className="h-9 rounded-xl border-[#dbe4f8] bg-white" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>

    <div className="min-w-0 rounded-2xl bg-[#f8fbff] p-3">
      <p className="text-sm font-semibold text-[#0f172a]">Verification Status</p>
      <p className="mt-1 text-sm text-[#64748b]">{getWorkflowStateLabel(workflowState)}</p>
      <p className="mt-1 text-xs text-[#94a3b8]">Updated {formatDateTime(provider?.updatedAt)}</p>
    </div>

    <div className="min-w-0 rounded-2xl bg-[#f8fbff] p-3">
      <p className="text-sm font-semibold text-[#0f172a]">Revenue Snapshot</p>
      <p className="mt-1 text-lg font-semibold text-[#0f172a]">{formatCurrency(stats.totalRevenue)}</p>
      <p className="text-xs text-[#64748b]">Collected {formatCurrency(stats.collectedRevenue)}</p>
      <p className="text-xs text-[#64748b]">Pending {formatCurrency(stats.pendingPayments)}</p>
    </div>

    <div className="min-w-0 rounded-2xl bg-[#f8fbff] p-3">
      <p className="text-sm font-semibold text-[#0f172a]">Upcoming Appointments</p>
      {!upcoming.length ? (
        <p className="mt-2 text-xs text-[#94a3b8]">No upcoming bookings.</p>
      ) : (
        <div className="mt-2 min-w-0 space-y-2">
          {upcoming.slice(0, 3).map((item) => (
            <div key={item._id} className="min-w-0 rounded-xl bg-white p-2">
              <p className="text-xs font-semibold text-[#0f172a] [overflow-wrap:anywhere] break-words">{getPatientName(item.patientId)}</p>
              <p className="text-xs text-[#64748b]">{formatDate(item.appointmentDate)}</p>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="min-w-0 rounded-2xl bg-[#f8fbff] p-3">
      <p className="text-sm font-semibold text-[#0f172a]">Assigned Cities</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(provider?.serviceCities || []).slice(0, 5).map((city, index) => (
          <Badge key={`${city?._id || city?.name || "city"}-${index}`} className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
            {city?.name || "City"}
          </Badge>
        ))}
      </div>
    </div>

    <div className="min-w-0 rounded-2xl bg-[#f8fbff] p-3">
      <p className="text-sm font-semibold text-[#0f172a]">Ratings</p>
      <p className="mt-1 text-lg font-semibold text-[#0f172a]">{stats.rating.toFixed(1)}</p>
      <p className="text-xs text-[#64748b]">{provider?.rating?.totalReviews || 0} reviews</p>
    </div>

    <div className="min-w-0 rounded-2xl bg-[#f8fbff] p-3">
      <p className="text-sm font-semibold text-[#0f172a]">Active Services</p>
      <p className="mt-1 text-lg font-semibold text-[#0f172a]">{stats.activeServices}</p>
    </div>
  </div>
);

const MetadataSection = ({ provider }) => (
  <div className="grid gap-4 md:grid-cols-2">
    <DetailChip icon={UserCircle2} label="Emergency Contact" value={provider?.emergencyContact?.name || "Not provided"} />
    <DetailChip icon={Phone} label="Emergency Mobile" value={provider?.emergencyContact?.mobile || "Not provided"} />
    <DetailChip icon={User} label="Relation" value={provider?.emergencyContact?.relationship || provider?.emergencyContact?.relation || "Not provided"} />
    <DetailChip icon={FileText} label="Languages" value={(provider?.languages || []).join(", ") || "Not provided"} />
    <DetailChip icon={Activity} label="About" value={provider?.about || "Not provided"} />
    <DetailChip icon={CalendarClock} label="Created At" value={formatDateTime(provider?.createdAt)} />
    <DetailChip icon={Clock3} label="Updated At" value={formatDateTime(provider?.updatedAt)} />
  </div>
);

const AddressCard = ({ title, address, isSameAsCurrent }) => (
  <div className="rounded-[22px] bg-white p-5 shadow-[0_10px_24px_rgb(15_23_42_/_0.05)] ring-1 ring-[#e8eefb]">
    <p className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
      <MapPin className="size-4 text-[#2563eb]" />
      {title}
    </p>
    {isSameAsCurrent ? (
      <p className="mt-3 text-sm text-[#64748b]">Same as current address</p>
    ) : (
      <div className="mt-3 grid gap-2 text-sm text-[#334155]">
        <p>{address?.street || "Street not provided"}</p>
        <p>{address?.locality || "Locality not provided"}</p>
        <p>
          {address?.city || "City"}, {address?.state || "State"} {address?.pincode || ""}
        </p>
        <p>{address?.country || "India"}</p>
        <p className="text-[#64748b]">{address?.landmark ? `Landmark: ${address.landmark}` : "Landmark not provided"}</p>
      </div>
    )}
  </div>
);

const RejectSuspendDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  mode,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  const onSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }
    await onConfirm(reason.trim());
  };

  const isReject = mode === "reject";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isReject ? "Reject Provider" : "Suspend Provider"}</DialogTitle>
          <DialogDescription>
            {isReject
              ? "Provide a rejection reason for audit and provider follow-up."
              : "Provide a suspension reason for audit trail."}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={isReject ? "Reason for rejection" : "Reason for suspension"}
          className="min-h-28 rounded-xl"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={isReject ? "bg-rose-600 hover:bg-rose-700" : "bg-orange-600 hover:bg-orange-700"}
          >
            {isReject ? "Confirm Rejection" : "Confirm Suspension"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteDialog = ({ open, onOpenChange, onConfirm, isSubmitting }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="rounded-2xl">
      <DialogHeader>
        <DialogTitle>Delete Service Provider</DialogTitle>
        <DialogDescription>This action permanently removes the provider record from the admin workspace.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const ServicePartnerDetails = ({ provider, onRefetch }) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const [showTabletSidebar, setShowTabletSidebar] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const stats = useMemo(() => getBookingStats(provider), [provider]);
  const timelineItems = useMemo(() => buildTimelineItems(provider), [provider]);
  const upcomingAppointments = useMemo(() => getAppointments(provider), [provider]);
  const workflowState = useMemo(() => getWorkflowState(provider), [provider]);
  const workflowActions = useMemo(() => getWorkflowActions(workflowState), [workflowState]);

  const { mutateAsync: updateWorkflow, isPending: isWorkflowUpdating } = useApiMutation({
    url: `/serviceProvider/service-provider/${provider?._id}/workflow`,
    method: PATCH,
    invalidateKey: ["service-provider"],
  });

  const { mutateAsync: toggleStatus, isPending: isStatusUpdating } = useApiMutation({
    url: `/serviceProvider/${provider?._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["service-provider"],
  });

  const { mutateAsync: deleteProvider, isPending: isDeleting } = useApiMutation({
    url: `/serviceProvider/service-provider/${provider?._id}`,
    method: DELETE,
    invalidateKey: ["service-provider"],
  });

  const isMutating = isWorkflowUpdating || isStatusUpdating || isDeleting;

  const refetchIfNeeded = () => {
    if (typeof onRefetch === "function") onRefetch();
  };

  const handleWorkflowAction = async (action, reason) => {
    const normalizedAction = action === "reinstate" ? "approve" : action;
    await updateWorkflow({ action: normalizedAction, reason });
    refetchIfNeeded();
  };

  const handleWorkflowIntent = async (action) => {
    if (action === "reject") {
      setIsRejectDialogOpen(true);
      return;
    }
    if (action === "suspend") {
      setIsSuspendDialogOpen(true);
      return;
    }
    await handleWorkflowAction(action);
  };

  const handleToggleActive = async (checked) => {
    await toggleStatus({ status: checked ? "active" : "inactive" });
    refetchIfNeeded();
  };

  const handleDelete = async () => {
    await deleteProvider();
    router.push("/admin/service-partners");
  };

  const onNavigate = (id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
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
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.2, 0.35, 0.65],
      }
    );

    SECTION_ITEMS.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [provider?._id]);

  const sections = [
    {
      id: "overview",
      title: "Provider Activity Timeline",
      subtitle: "Operational actions, verification events, and onboarding milestones",
      content: <ProviderTimeline items={timelineItems} />,
    },
    {
      id: "addresses",
      title: "Identity and Contact Workspace",
      subtitle: "Personal profile, contacts, and structured location intelligence",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            <DetailChip icon={User} label="Full Name" value={getDisplayName(provider)} />
            <DetailChip icon={UserCircle2} label="Owner Name" value={provider?.ownerName || "Not provided"} />
            <DetailChip icon={Activity} label="Age" value={provider?.age || "Not provided"} />
            <DetailChip icon={UserRoundCheck} label="Gender" value={provider?.gender || "Not provided"} />
            <div className="md:col-span-2">
              <DetailChip icon={CalendarClock} label="DOB" value={formatDate(provider?.dateOfBirth)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailChip icon={Phone} label="Mobile" value={provider?.mobile || "Not provided"} />
            <DetailChip icon={Phone} label="Alternate Number" value={provider?.alternateNumber || "Not provided"} />
            <DetailChip icon={Phone} label="Landline" value={provider?.landline || "Not provided"} />
            <DetailChip icon={Mail} label="Email" value={provider?.email || "Not provided"} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AddressCard title="Current Address" address={provider?.currentAddress} />
            <AddressCard
              title="Permanent Address"
              address={provider?.permanentAddress}
              isSameAsCurrent={provider?.permanentAddress?.sameAsCurrent}
            />
            {provider?.workAddress?.street ||
            provider?.workAddress?.locality ||
            provider?.workAddress?.city ? (
              <div className="lg:col-span-2">
                <AddressCard title="Work Address" address={provider?.workAddress} />
              </div>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "services",
      title: "Service Capabilities",
      subtitle: "Specializations, operational pricing, and experience depth",
      content: <ServicesGrid services={provider?.services || []} />,
    },
    {
      id: "cities",
      title: "Service Cities",
      subtitle: "Assigned city network and coverage readiness",
      content: <ServiceCitiesCard cities={provider?.serviceCities || []} />,
    },
    {
      id: "documents",
      title: "Document Intelligence Dashboard",
      subtitle: "Upload progress, verification state, preview, and download controls",
      content: <DocumentsDashboard provider={provider} />,
    },
    {
      id: "availability",
      title: "Availability Schedule",
      subtitle: "Weekly timetable and operational coverage flags",
      content: <AvailabilitySchedule provider={provider} />,
    },
    {
      id: "appointments",
      title: "Appointments Intelligence",
      subtitle: "Status analytics, revenue indicators, and upcoming booking feed",
      content: <AppointmentsDashboard provider={provider} stats={stats} />,
    },
    {
      id: "banking",
      title: "Secure Banking Details",
      subtitle: "Masked account visibility with controlled full-account reveal",
      content: <BankingCard bankDetails={provider?.bankDetails || {}} />,
    },
    {
      id: "approval",
      title: "Approval Workflow",
      subtitle: "Audit history for approval, rejection, and suspension lifecycle",
      content: <ApprovalWorkflowCard provider={provider} />,
    },
    {
      id: "activity",
      title: "Additional Metadata",
      subtitle: "Emergency contact, languages, bio, and profile timestamps",
      content: <MetadataSection provider={provider} />,
    },
  ];

  return (
    <div className="min-w-0 overflow-visible space-y-5 px-1 pb-8 sm:px-3 lg:px-8">
      <ServicePartnerHeader
        provider={provider}
        workflowState={workflowState}
        workflowActions={workflowActions}
        onWorkflowAction={handleWorkflowIntent}
        onEdit={() => router.push(`/admin/service-partners/${provider?._id}/update`)}
        onViewAppointments={() => onNavigate("appointments")}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onToggleActive={handleToggleActive}
        isMutating={isMutating}
      />

      <ServicePartnerHero
        provider={provider}
        stats={stats}
        onEdit={() => router.push(`/admin/service-partners/${provider?._id}/update`)}
        onViewAppointments={() => onNavigate("appointments")}
        onSuspend={() => setIsSuspendDialogOpen(true)}
      />

      <AnalyticsStrip stats={stats} />

      <StickySectionNav activeSection={activeSection} onNavigate={onNavigate} />

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="hidden min-w-0 space-y-5 lg:block">
          {sections.map((section) => (
            <SectionShell key={section.id} id={section.id} title={section.title} subtitle={section.subtitle}>
              {section.content}
            </SectionShell>
          ))}
        </div>

        <div className="min-w-0 space-y-4 lg:hidden">
          <Accordion type="single" collapsible className="min-w-0 rounded-[24px] bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_16px_34px_rgb(15_23_42_/_0.08)]">
            {sections.map((section) => (
              <AccordionItem key={`mobile-${section.id}`} value={section.id} className="border-b border-[#e5edf9] last:border-b-0">
                <AccordionTrigger className="text-left text-[#0f172a] hover:no-underline">
                  <span className="text-sm font-semibold">{section.title}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    {section.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="min-w-0 xl:hidden">
          <Collapsible open={showTabletSidebar} onOpenChange={setShowTabletSidebar}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="h-10 w-full rounded-2xl border-[#dbe4f8] bg-white text-[#0f172a]">
                {showTabletSidebar ? "Hide Intelligence Sidebar" : "Show Intelligence Sidebar"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <IntelligenceSidebar
                provider={provider}
                workflowState={workflowState}
                workflowActions={workflowActions}
                onWorkflowAction={handleWorkflowIntent}
                stats={stats}
                upcoming={upcomingAppointments}
                onEdit={() => router.push(`/admin/service-partners/${provider?._id}/update`)}
                isMutating={isMutating}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="hidden min-w-0 xl:block">
          <IntelligenceSidebar
            provider={provider}
            workflowState={workflowState}
            workflowActions={workflowActions}
            onWorkflowAction={handleWorkflowIntent}
            stats={stats}
            upcoming={upcomingAppointments}
            onEdit={() => router.push(`/admin/service-partners/${provider?._id}/update`)}
            isMutating={isMutating}
          />
        </div>
      </div>

      <RejectSuspendDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onConfirm={(reason) => handleWorkflowAction("reject", reason).then(() => setIsRejectDialogOpen(false))}
        isSubmitting={isMutating}
        mode="reject"
      />
      <RejectSuspendDialog
        open={isSuspendDialogOpen}
        onOpenChange={setIsSuspendDialogOpen}
        onConfirm={(reason) => handleWorkflowAction("suspend", reason).then(() => setIsSuspendDialogOpen(false))}
        isSubmitting={isMutating}
        mode="suspend"
      />
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isSubmitting={isMutating}
      />
    </div>
  );
};

ServicePartnerDetails.Skeleton = function ServicePartnerDetailsSkeleton() {
  return (
    <div className="min-w-0 space-y-5">
      <Skeleton className="h-28 rounded-[24px]" />
      <Skeleton className="h-72 rounded-[32px]" />
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
      </div>
      <Skeleton className="h-12 rounded-[20px]" />
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Skeleton className="h-72 rounded-[28px]" />
          <Skeleton className="h-64 rounded-[28px]" />
          <Skeleton className="h-80 rounded-[28px]" />
        </div>
        <Skeleton className="h-[520px] rounded-[24px]" />
      </div>
    </div>
  );
};
