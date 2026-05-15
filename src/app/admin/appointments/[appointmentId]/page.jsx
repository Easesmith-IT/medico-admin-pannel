"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Download,
  FileSpreadsheet,
  Landmark,
  MapPin,
  MoreHorizontal,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppointmentInsightsSidebar } from "@/components/booking/appointment-insights-sidebar";
import { AppointmentRecommendations } from "@/components/booking/appointment-recommendations";
import { AppointmentTimeline } from "@/components/booking/appointment-timeline";
import { BookingDetailsSkeleton } from "@/components/booking/booking-details-skeleton";
import { UpdateBookingModal } from "@/components/booking/update-booking-modal";
import { BackLink } from "@/components/shared/back-link";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { appointmentStatusColors } from "@/constants/status";
import { useApiQuery } from "@/hooks/useApiQuery";
import { cn, customId } from "@/lib/utils";

const statusTone = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Rescheduled: "bg-blue-50 text-blue-700 border-blue-200",
  Cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  "Cancellation Requested": "bg-orange-50 text-orange-700 border-orange-200",
  "In-Progress": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  TreatmentCompleted: "bg-green-50 text-green-700 border-green-200",
};

const paymentTone = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Partially Paid": "bg-amber-50 text-amber-700 border-amber-200",
  Unpaid: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-violet-50 text-violet-700 border-violet-200",
  PartialRefund: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const formatCurrency = (value, currency = "INR") => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const initials = (name = "") => {
  const parts = String(name).split(" ").filter(Boolean);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
};

const buildSmartInsights = (booking, recommendations) => {
  const analytics = recommendations?.analytics || {};
  const list = [];
  if (recommendations?.patientHistory?.pastAppointments > 0) {
    list.push(
      `Patient is returning with ${recommendations.patientHistory.pastAppointments} previous appointments.`
    );
  }
  if (!analytics.isOverdue) {
    list.push("No slot conflict or overdue signal detected.");
  }
  if (booking?.provider?.name) {
    list.push("Provider assignment confirmed for this session.");
  }
  if (analytics.treatmentNearExpiry) {
    list.push("Treatment validity is nearing expiry.");
  }
  if ((analytics.totalAmount || 0) >= 5000) {
    list.push("This is a high-value appointment.");
  }
  return list;
};

const BookingDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openAlternatives, setOpenAlternatives] = useState(false);
  const [openSimilarServices, setOpenSimilarServices] = useState(false);

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/booking/bookings/${params.appointmentId}`,
    queryKeys: ["bookings", params.appointmentId],
  });

  const booking = data?.data;

  const recommendations = booking?.recommendations || {};
  const analytics = recommendations?.analytics || {};
  const treatmentFlow = recommendations?.treatmentFlow || {};
  const paymentLedger = booking?.paymentLedger || null;

  const patientName = `${booking?.patient?.firstName || ""} ${booking?.patient?.lastName || ""}`.trim() || "Patient";
  const providerName = booking?.provider?.name || "Provider Unassigned";
  const paymentStatus = paymentLedger?.paymentStatus || booking?.paymentStatus || "Unpaid";
  const completionPercent = Number(analytics?.completionPercentage || 0);

  const lifecycleSteps = useMemo(() => {
    const status = String(booking?.status || "");
    const isPaid = ["Paid", "Partially Paid", "PartialRefund", "Refunded"].includes(paymentStatus);

    const steps = [
      { key: "created", label: "Booking Created", done: true },
      { key: "approved", label: "Approved", done: ["Approved", "In-Progress", "Completed", "TreatmentCompleted"].includes(status) },
      { key: "assigned", label: "Provider Assigned", done: Boolean(booking?.provider?.id) },
      { key: "payment", label: "Payment Completed", done: isPaid },
      { key: "started", label: "Visit Started", done: status === "In-Progress" || Boolean(booking?.serviceStartedAt) || ["Completed", "TreatmentCompleted"].includes(status) },
      { key: "completed", label: "Visit Completed", done: ["Completed", "TreatmentCompleted"].includes(status) || Boolean(booking?.serviceEndedAt) },
    ];

    return steps;
  }, [booking, paymentStatus]);

  const kpis = [
    { label: "Total Amount", value: formatCurrency(analytics?.totalAmount || booking?.pricing?.totalAmount || 0) },
    { label: "Paid Amount", value: formatCurrency(analytics?.paidAmount || booking?.paidAmount || 0) },
    { label: "Pending Amount", value: formatCurrency(analytics?.pendingAmount || booking?.dueAmount || 0) },
    {
      label: "Session Progress",
      value: `${treatmentFlow?.sessionProgress || 0}/${treatmentFlow?.totalSessions || booking?.sessionNumber || 1}`,
    },
    {
      label: "Treatment Validity",
      value:
        analytics?.treatmentValidityDays === null || analytics?.treatmentValidityDays === undefined
          ? "-"
          : `${analytics.treatmentValidityDays}d`,
    },
    { label: "Completion", value: `${completionPercent}%` },
  ];

  const quickActions = recommendations?.actionRecommendations || [];
  const smartInsights = buildSmartInsights(booking, recommendations);

  const triggerRecommendedAction = (recommendation) => {
    if (!recommendation) return;
    if (
      [
        "Approve Booking",
        "Mark In Progress",
        "Complete Appointment",
        "Review Cancellation",
      ].includes(recommendation.cta)
    ) {
      setIsModalOpen(true);
      return;
    }

    if (recommendation.cta === "Generate Invoice" || recommendation.cta === "View Invoice") {
      if (booking?.invoiceGenerated && booking?.invoiceId) {
        router.push(`/admin/payments/${paymentLedger?._id || ""}`);
      }
      return;
    }
  };

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

  const showEdit = !["Completed", "Cancelled", "Rejected", "TreatmentCompleted"].includes(booking.status);
  const showUpdateStatus = !["Cancelled", "Rejected"].includes(booking.status);

  return (
    <div className="space-y-4 min-w-0">
      {isModalOpen ? (
        <UpdateBookingModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      ) : null}

      <div className="sticky top-[var(--sticky-offset-workspace)] z-30 rounded-2xl border border-white/40 bg-white/75 p-3 backdrop-blur-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[#64748b]">Appointments / {customId(booking?.bookingId)}</p>
            <div className="mt-1 flex items-center gap-2">
              <BackLink href="/admin/appointments">
                <H1 className="text-xl">Appointment Workspace</H1>
              </BackLink>
              <Badge className={cn("h-8 rounded-full px-3 text-xs", statusTone[booking.status] || appointmentStatusColors[booking.status])}>
                {booking.status}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showUpdateStatus ? (
              <Button variant="medico" onClick={() => setIsModalOpen(true)}>
                Update Status
              </Button>
            ) : null}
            {showEdit ? (
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/appointments/${params.appointmentId}/update`)}
              >
                Edit Booking
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Cancel Appointment
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => refetch()}>Refresh</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    paymentLedger?._id ? router.push(`/admin/payments/${paymentLedger._id}`) : null
                  }
                >
                  View Ledger
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <section className="rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#1e3a8a] p-7 shadow-[0_24px_72px_rgba(15,23,42,0.45)]">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border border-white/25">
                <AvatarImage src={booking?.patient?.profilePhoto || ""} />
                <AvatarFallback className="bg-white/20 text-white">
                  {initials(patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-white">{patientName}</p>
                <p className="text-xs text-blue-100">{booking?.service?.name || "-"}</p>
                <p className="text-xs text-blue-100">{providerName}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className={cn("h-8 rounded-full border px-3 text-xs", statusTone[booking.status] || "bg-white/10 text-white border-white/20")}>
                {booking.status}
              </Badge>
              <Badge className={cn("h-8 rounded-full border px-3 text-xs", paymentTone[paymentStatus] || "bg-white/10 text-white border-white/20")}>
                {paymentStatus}
              </Badge>
              <Badge className="h-8 rounded-full border border-white/20 bg-white/10 px-3 text-xs text-white">
                {booking?.service?.modes?.[0] || "Home Service"}
              </Badge>
              <Badge className="h-8 rounded-full border border-white/20 bg-white/10 px-3 text-xs text-white">
                Treatment {booking?.treatment?.status || "Active"}
              </Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur text-white">
            <p className="mb-2 text-xs uppercase tracking-[0.08em] text-blue-100">Scheduling</p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-blue-200" />{formatDate(booking?.appointmentDate)}</p>
              <p className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-blue-200" />{booking?.slotTime?.startTime || "-"} - {booking?.slotTime?.endTime || "-"}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-200" />{booking?.bookingCity || "-"}</p>
              <p className="flex items-center gap-2"><Landmark className="h-4 w-4 text-blue-200" />Session {booking?.sessionNumber || 1}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur text-white">
            <p className="mb-2 text-xs uppercase tracking-[0.08em] text-blue-100">Operational Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" className="h-9 bg-white/20 text-white hover:bg-white/30" onClick={() => setIsModalOpen(true)}>
                Start/Update
              </Button>
              <Button variant="secondary" className="h-9 bg-white/20 text-white hover:bg-white/30" onClick={() => paymentLedger?._id && router.push(`/admin/payments/${paymentLedger._id}`)}>
                Ledger
              </Button>
              <Button variant="secondary" className="h-9 bg-white/20 text-white hover:bg-white/30" onClick={() => router.push(`/admin/patients/${booking?.patient?._id}`)}>
                Patient
              </Button>
              <Button variant="secondary" className="h-9 bg-white/20 text-white hover:bg-white/30" onClick={() => booking?.provider?.id && router.push(`/admin/service-partners/${booking.provider.id}`)}>
                Provider
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur"
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-[#64748b]">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0f172a]">{kpi.value}</p>
          </motion.div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/40 bg-white/80 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#0f172a]">Workflow Lifecycle Tracker</p>
          <p className="text-xs text-[#64748b]">Operational state progression</p>
        </div>
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          {lifecycleSteps.map((step, index) => (
            <div key={step.key} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className={cn("text-xs font-semibold", step.done ? "text-emerald-700" : "text-slate-500")}>
                {step.done ? "✓" : "○"} {step.label}
              </p>
              {index < lifecycleSteps.length - 1 ? (
                <div className="mt-2">
                  <Progress value={step.done ? 100 : 20} className={step.done ? "bg-emerald-100" : "bg-slate-100"} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/40 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">Patient Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={booking?.patient?.profilePhoto || ""} />
                    <AvatarFallback>{initials(patientName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{patientName}</p>
                    <p className="text-xs text-[#64748b]">{booking?.patient?.email || "-"}</p>
                  </div>
                </div>
                <InfoGrid
                  items={[
                    { label: "Patient ID", value: customId(booking?.patient?._id) },
                    { label: "Phone", value: booking?.patient?.phone || "-" },
                    { label: "City", value: booking?.bookingCity || "-" },
                    { label: "Last Visit", value: formatDate(recommendations?.patientHistory?.lastVisitDate) },
                    { label: "Past Appointments", value: recommendations?.patientHistory?.pastAppointments || 0 },
                  ]}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/patients/${booking?.patient?._id}`}>View Patient</Link>
                  </Button>
                  <Button size="sm" variant="outline">Message</Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/patients/${booking?.patient?._id}/bookings`}>Booking History</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/40 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">Provider Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={booking?.provider?.profilePhoto || ""} />
                    <AvatarFallback>{initials(providerName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{providerName}</p>
                    <p className="text-xs text-[#64748b]">{booking?.provider?.email || "-"}</p>
                  </div>
                </div>
                <InfoGrid
                  items={[
                    { label: "Experience", value: booking?.provider?.yearsOfExperience ? `${booking.provider.yearsOfExperience} yrs` : "-" },
                    { label: "City", value: booking?.provider?.city?.join(", ") || "-" },
                    { label: "Specialization", value: booking?.service?.category || "-" },
                    { label: "Availability", value: booking?.provider?.isAvailable ? "Available" : "Unavailable" },
                    { label: "Rating", value: booking?.provider?.rating || 0 },
                  ]}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={booking?.provider?.id ? `/admin/service-partners/${booking.provider.id}` : "#"}>View Provider</Link>
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="mr-1 h-3.5 w-3.5" /> Call
                  </Button>
                  <Button size="sm" variant="outline">View Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/40 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Scheduling Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700">
                  {formatDate(booking?.appointmentDate)}
                </Badge>
                <Badge className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700">
                  {booking?.slotTime?.startTime || "-"} - {booking?.slotTime?.endTime || "-"}
                </Badge>
                <Badge className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700">
                  {booking?.service?.modes?.[0] || "Home Service"}
                </Badge>
                <Badge className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700">
                  Timezone: Asia/Kolkata
                </Badge>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-[#334155]">
                <p>Scheduling conflicts: {analytics?.isOverdue ? "Conflict / overdue detected" : "No conflict detected"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Pricing & Billing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <PriceTile label="Base Price" value={formatCurrency(booking?.pricing?.basePrice)} />
              <PriceTile label="Equipment" value={formatCurrency(booking?.pricing?.equipmentCharges)} />
              <PriceTile label="Tax" value={formatCurrency(booking?.pricing?.taxAmount)} />
              <PriceTile label="Total Amount" value={formatCurrency(booking?.pricing?.totalAmount)} emphasis />
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Treatment Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoGrid
                items={[
                  { label: "Treatment ID", value: customId(booking?.treatment?._id) },
                  { label: "Status", value: booking?.treatment?.status || "-" },
                  { label: "Validity", value: formatDate(booking?.treatment?.validTill) },
                  { label: "Session Number", value: booking?.sessionNumber || "-" },
                  {
                    label: "Assigned Provider",
                    value: providerName,
                  },
                ]}
              />
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="mb-1 text-sm font-medium text-[#0f172a]">
                  Session Progress: {treatmentFlow?.sessionProgress || 0} / {treatmentFlow?.totalSessions || 1}
                </p>
                <Progress value={completionPercent} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <MiniLinkedBooking
                  title="Previous Session"
                  bookingRef={treatmentFlow?.previousBooking}
                />
                <MiniLinkedBooking
                  title="Next Session"
                  bookingRef={treatmentFlow?.nextBooking}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Patient History & Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoGrid
                items={[
                  { label: "Past Appointments", value: recommendations?.patientHistory?.pastAppointments || 0 },
                  { label: "Last Visit", value: formatDate(recommendations?.patientHistory?.lastVisitDate) },
                  { label: "Active Conditions", value: recommendations?.patientHistory?.medicalConditions?.length || 0 },
                  { label: "Allergies", value: recommendations?.patientHistory?.allergies?.length || 0 },
                  { label: "Medications", value: recommendations?.patientHistory?.medicationsCount || 0 },
                ]}
              />
              <div className="flex flex-wrap gap-2">
                {(recommendations?.patientHistory?.allergies || []).slice(0, 5).map((item, idx) => (
                  <Badge key={`${item}-${idx}`} className="border border-amber-200 bg-amber-50 text-amber-700">
                    {item}
                  </Badge>
                ))}
                {(recommendations?.patientHistory?.medicalConditions || []).slice(0, 5).map((item, idx) => (
                  <Badge key={`${item}-${idx}`} className="border border-blue-200 bg-blue-50 text-blue-700">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <AppointmentRecommendations
            items={quickActions}
            onTriggerAction={triggerRecommendedAction}
          />

          <Card className="border-white/40 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Alternative Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <Collapsible open={openAlternatives} onOpenChange={setOpenAlternatives}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Provider replacement suggestions</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openAlternatives ? "rotate-180" : "")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {(recommendations?.alternativeProviders || []).length === 0 ? (
                    <p className="text-sm text-[#64748b]">No alternatives found in same city/service.</p>
                  ) : (
                    recommendations.alternativeProviders.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-[#0f172a]">
                          {`${item.firstName || ""} ${item.lastName || ""}`.trim() || "Provider"}
                        </p>
                        <p className="text-xs text-[#64748b]">
                          Rating {item.rating || 0} • {item.yearsOfExperience || 0} yrs
                        </p>
                        <p className="text-xs text-[#64748b]">{item.city?.join(", ") || "-"}</p>
                      </div>
                    ))
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Similar Services</CardTitle>
            </CardHeader>
            <CardContent>
              <Collapsible open={openSimilarServices} onOpenChange={setOpenSimilarServices}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Cross-sell and upgrade opportunities</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openSimilarServices ? "rotate-180" : "")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {(recommendations?.similarServices || []).length === 0 ? (
                    <p className="text-sm text-[#64748b]">No similar services available.</p>
                  ) : (
                    recommendations.similarServices.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-[#0f172a]">{item.name || "-"}</p>
                        <p className="text-xs text-[#64748b]">{item.category || "-"}</p>
                        <p className="text-xs text-[#64748b] line-clamp-2">{item.description || "-"}</p>
                        <p className="mt-1 text-xs font-medium text-[#0f172a]">
                          {formatCurrency(item.basePrice || 0)}
                        </p>
                      </div>
                    ))
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Payment Ledger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoGrid
                items={[
                  { label: "Payment Status", value: paymentStatus },
                  { label: "Invoice State", value: booking?.invoiceGenerated ? "Generated" : "Pending" },
                  { label: "Ledger ID", value: paymentLedger?._id ? customId(paymentLedger._id) : "-" },
                  { label: "Refund State", value: paymentLedger?.totalRefunded ? "Refund initiated" : "No refund" },
                  { label: "Collection Progress", value: `${completionPercent}%` },
                ]}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paymentLedger?._id && router.push(`/admin/payments/${paymentLedger._id}`)}
                  disabled={!paymentLedger?._id}
                >
                  <CreditCard className="mr-1 h-3.5 w-3.5" />
                  View Ledger
                </Button>
                <Button variant="outline" size="sm" disabled={!booking?.invoiceGenerated}>
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Download Invoice
                </Button>
                <Button variant="outline" size="sm">
                  Refund
                </Button>
              </div>
            </CardContent>
          </Card>

          <AppointmentTimeline events={recommendations?.timeline || []} />
        </div>

        <div className="min-w-0">
          <AppointmentInsightsSidebar
            bookingStatus={booking?.status}
            analytics={analytics}
            treatmentFlow={treatmentFlow}
            paymentLedger={paymentLedger}
            quickActions={quickActions}
            smartInsights={smartInsights}
            onQuickAction={triggerRecommendedAction}
          />
        </div>
      </div>
    </div>
  );
};

const InfoGrid = ({ items = [] }) => {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#64748b]">{item.label}</p>
          <p className="text-sm font-semibold text-[#0f172a]">{item.value ?? "-"}</p>
        </div>
      ))}
    </div>
  );
};

const PriceTile = ({ label, value, emphasis = false }) => (
  <div className={cn("rounded-2xl border border-slate-200 bg-white p-3", emphasis ? "shadow-md" : "")}>
    <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">{label}</p>
    <p className={cn("mt-1 text-lg font-semibold text-[#0f172a]", emphasis ? "text-2xl" : "")}>{value}</p>
  </div>
);

const MiniLinkedBooking = ({ title, bookingRef }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-[0.08em] text-[#64748b]">{title}</p>
      {bookingRef?._id ? (
        <>
          <p className="mt-1 text-sm font-semibold text-[#0f172a]">{customId(bookingRef._id)}</p>
          <p className="text-xs text-[#64748b]">{formatDate(bookingRef.appointmentDate)}</p>
          <Badge className={cn("mt-2 border", statusTone[bookingRef.status] || "bg-slate-100 text-slate-700 border-slate-200")}>
            {bookingRef.status || "-"}
          </Badge>
        </>
      ) : (
        <p className="mt-1 text-sm text-[#64748b]">Not available</p>
      )}
    </div>
  );
};

export default BookingDetails;
