"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  Gauge,
  Landmark,
  PauseCircle,
  Play,
  ShieldAlert,
  Sparkles,
  Timer,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useParams } from "next/navigation";

import { BackLink } from "@/components/shared/back-link";
import { StateView } from "@/components/shared/state-view";
import { TreatmentInsightsSidebar } from "@/components/treatment/treatment-insights-sidebar";
import { TreatmentRecommendations } from "@/components/treatment/treatment-recommendations";
import { H1 } from "@/components/typography";
import { OperationalBadge } from "@/components/ui/OperationalBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { normalizeRole } from "@/lib/rbac";
import { readCookie } from "@/lib/readCookie";
import { cn, customId } from "@/lib/utils";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const initials = (value = "") =>
  String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase() || "TR";

const daysUntil = (value) => {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const getRiskScore = (risks = []) => {
  if (!Array.isArray(risks) || risks.length === 0) return 14;
  const total = risks.reduce((sum, risk) => {
    const sev = String(risk?.severity || "medium").toLowerCase();
    if (sev === "high") return sum + 28;
    if (sev === "medium") return sum + 16;
    return sum + 8;
  }, 0);
  return Math.min(100, total);
};

const getAdherenceScore = (sessionIntel = {}, progress = 0) => {
  const adherence = String(sessionIntel?.adherence || "").toLowerCase();
  if (adherence === "on_track") return 90;
  if (adherence === "moderate") return 68;
  if (adherence === "behind") return 38;
  if (adherence === "insufficient_data") return 30;
  return Math.min(100, Math.max(0, progress));
};

const getSeverityClass = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "high") return "border-red-200 bg-red-50/80 text-red-700";
  if (normalized === "medium")
    return "border-amber-200 bg-amber-50/80 text-amber-700";
  return "border-blue-200 bg-blue-50/80 text-blue-700";
};

const getSessionStateTone = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (["completed", "treatmentcompleted"].includes(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["cancelled", "rejected", "expired"].includes(normalized)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (["in-progress", "inprogress", "approved"].includes(normalized)) {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const KPICard = ({ label, value, hint, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24, delay }}
    className="rounded-2xl border border-white/55 bg-white/82 p-4 shadow-[0_14px_32px_rgb(15_23_42_/_0.08)] backdrop-blur"
  >
    <div className="flex items-start justify-between gap-2">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#64748b]">
        {label}
      </p>
      {trend ? (
        <span className="text-[11px] font-semibold text-[#2563eb]">
          {trend}
        </span>
      ) : null}
    </div>
    <p className="mt-1 text-2xl font-bold text-[#0f172a]">{value}</p>
    {hint ? <p className="mt-1 text-xs text-[#64748b]">{hint}</p> : null}
  </motion.div>
);

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}) => (
  <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-5 text-center">
    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#e2e8f0]">
      <Icon className="h-4 w-4 text-[#2563eb]" />
    </div>
    <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
    <p className="mt-1 text-xs text-[#64748b]">{description}</p>
    {actionLabel && actionHref ? (
      <Button asChild size="sm" variant="outline" className="mt-3">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    ) : null}
  </div>
);

const ProgressRing = ({ value = 0, label = "Progress" }) => {
  const safeValue = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div className="relative inline-flex h-32 w-32 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#38bdf8 ${safeValue * 3.6}deg, rgba(148,163,184,0.26) 0deg)`,
        }}
      />
      <div className="absolute inset-[7px] rounded-full bg-[#0f172a]/92 ring-1 ring-white/20" />
      <div className="relative text-center">
        <p className="text-2xl font-semibold text-white">{safeValue}%</p>
        <p className="text-[11px] uppercase tracking-[0.08em] text-blue-100">
          {label}
        </p>
      </div>
    </div>
  );
};

const TreatmentDetailPage = () => {
  const params = useParams();
  const treatmentId = params.treatmentId;

  const [dialog, setDialog] = useState({ type: null });
  const [form, setForm] = useState({ reason: "", validTill: "" });

  const userInfo = readCookie("userInfo");
  const role = normalizeRole(userInfo?.role);
  const canMutate = role === "superadmin" || role === "subadmin";

  const detailQuery = useApiQuery({
    url: `/admin/treatments/${treatmentId}`,
    queryKeys: ["admin-treatment-detail", treatmentId],
  });

  const statusMutation = useApiMutation({
    url: `/admin/treatments/${treatmentId}/status`,
    method: "PATCH",
    invalidateKey: ["admin-treatment-detail", "admin-treatments"],
  });

  const completeMutation = useApiMutation({
    url: `/admin/treatments/${treatmentId}/complete`,
    method: "POST",
    invalidateKey: ["admin-treatment-detail", "admin-treatments"],
  });

  const isMutating = statusMutation.isPending || completeMutation.isPending;
  const detail = detailQuery.data?.data;

  const treatment = detail || {};
  const recommendations = detail?.recommendations || {};
  const analytics = recommendations?.analytics || {};
  const sessionIntel = recommendations?.sessionIntelligence || {};
  const riskAssessment = recommendations?.riskAssessment || [];

  const sessions = detail?.chain?.sessions || [];
  const allowedActions = detail?.allowedActions || [];

  const patientName = `${treatment?.patientId?.firstName || ""} ${
    treatment?.patientId?.lastName || ""
  }`.trim();

  const providerName = `${treatment?.servicePartnerId?.firstName || ""} ${
    treatment?.servicePartnerId?.lastName || ""
  }`.trim();

  const paymentStatus =
    detail?.payment?.paymentStatus || analytics?.paymentStatus || "Unpaid";
  const progressValue = useMemo(
    () =>
      Number(
        detail?.progressPercentage || sessionIntel?.completionPercentage || 0,
      ),
    [detail?.progressPercentage, sessionIntel?.completionPercentage],
  );

  const totalSessions =
    toNumber(detail?.sessions?.total) ||
    toNumber(sessionIntel?.totalSessions) ||
    toNumber(sessions.length, 0);
  const completedSessions =
    toNumber(detail?.sessions?.completed) ||
    toNumber(sessionIntel?.completedSessions);
  const pendingSessions = Math.max(0, totalSessions - completedSessions);

  const billedAmount = toNumber(
    analytics?.totalAmount || detail?.payment?.totalAmount || 0,
  );
  const paidAmount = toNumber(
    analytics?.paidAmount || detail?.payment?.totalPaid || 0,
  );
  const outstandingAmount =
    toNumber(analytics?.pendingAmount, -1) >= 0
      ? toNumber(analytics?.pendingAmount)
      : toNumber(
          detail?.payment?.remainingBalance ||
            Math.max(0, billedAmount - paidAmount),
        );

  const validityDays = daysUntil(treatment?.validTill);
  const isOverdue =
    Boolean(analytics?.isOverdue) ||
    (validityDays !== null &&
      validityDays < 0 &&
      !["Completed", "Cancelled"].includes(treatment?.status));

  const adherenceScore = getAdherenceScore(sessionIntel, progressValue);
  const riskScore = getRiskScore(riskAssessment);

  const durationDays = (() => {
    const start = treatment?.startDate ? new Date(treatment.startDate) : null;
    const end = treatment?.validTill ? new Date(treatment.validTill) : null;
    if (
      !start ||
      !end ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return "-";
    }
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff >= 0 ? `${diff}d` : "-";
  })();

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aDate = a?.appointmentDate
        ? new Date(a.appointmentDate).getTime()
        : 0;
      const bDate = b?.appointmentDate
        ? new Date(b.appointmentDate).getTime()
        : 0;
      return aDate - bDate;
    });
  }, [sessions]);

  const upcomingSessionId = useMemo(() => {
    const now = Date.now();
    const next = sortedSessions.find((item) => {
      const when = item?.appointmentDate
        ? new Date(item.appointmentDate).getTime()
        : null;
      if (!when || Number.isNaN(when)) return false;
      const status = String(item?.status || "").toLowerCase();
      return (
        when >= now &&
        !["completed", "cancelled", "rejected", "treatmentcompleted"].includes(
          status,
        )
      );
    });
    return next?._id || null;
  }, [sortedSessions]);

  const openDialog = (type) => {
    setDialog({ type });
    setForm({ reason: "", validTill: "" });
  };

  const closeDialog = () => {
    if (isMutating) return;
    setDialog({ type: null });
    setForm({ reason: "", validTill: "" });
  };

  const submitAction = async () => {
    if (dialog.type === "activate") {
      await statusMutation.mutateAsync({
        targetStatus: "Active",
        validTill: form.validTill,
        reason: form.reason || undefined,
      });
      closeDialog();
      return;
    }

    if (dialog.type === "expire") {
      await statusMutation.mutateAsync({
        targetStatus: "Expired",
        reason: form.reason,
      });
      closeDialog();
      return;
    }

    if (dialog.type === "complete") {
      await completeMutation.mutateAsync({
        note: form.reason || undefined,
      });
      closeDialog();
    }
  };

  if (detailQuery.isLoading) {
    return (
      <StateView
        type="loading"
        title="Loading treatment operations workspace"
      />
    );
  }

  if (detailQuery.error) {
    return (
      <StateView
        type="error"
        title="Unable to load treatment details"
        description={detailQuery.error.message}
        actionLabel="Retry"
        onAction={detailQuery.refetch}
      />
    );
  }

  if (!detail) {
    return (
      <StateView
        type="empty"
        title="Treatment not found"
        description="The requested treatment record is not available."
      />
    );
  }

  const kpis = [
    {
      label: "Total Sessions",
      value: totalSessions || 0,
      hint: "Lifecycle plan",
      trend: totalSessions > 0 ? "active" : null,
    },
    {
      label: "Completed",
      value: completedSessions || 0,
      hint: `${progressValue}% completion`,
      trend: progressValue >= 70 ? "+" : null,
    },
    {
      label: "Pending",
      value: pendingSessions,
      hint: "Execution queue",
      trend: pendingSessions > 0 ? "open" : "clear",
    },
    {
      label: "Revenue",
      value: formatCurrency(billedAmount),
      hint: "Total billed",
      trend: billedAmount > 0 ? "tracked" : null,
    },
    {
      label: "Outstanding",
      value: formatCurrency(outstandingAmount),
      hint: "Collection pending",
      trend: outstandingAmount > 0 ? "attention" : "healthy",
    },
    {
      label: "Treatment Duration",
      value: durationDays,
      hint: "Start to validity",
      trend: null,
    },
    {
      label: "Adherence Score",
      value: `${adherenceScore}%`,
      hint: String(sessionIntel?.adherence || "Auto derived").replaceAll(
        "_",
        " ",
      ),
      trend: adherenceScore >= 75 ? "healthy" : "watch",
    },
    {
      label: "Risk Score",
      value: `${riskScore}`,
      hint: `${riskAssessment.length} risk signals`,
      trend: riskScore >= 70 ? "high" : riskScore >= 40 ? "moderate" : "low",
    },
  ];

  const riskBuckets = {
    medical: riskAssessment.filter((item) =>
      String(item?.type || "")
        .toLowerCase()
        .includes("medical"),
    ),
    payment: riskAssessment.filter((item) =>
      String(item?.type || "")
        .toLowerCase()
        .includes("payment"),
    ),
    operational: riskAssessment.filter((item) => {
      const type = String(item?.type || "").toLowerCase();
      return type.includes("operational") || type.includes("delay");
    }),
    adherence: riskAssessment.filter((item) =>
      String(item?.type || "")
        .toLowerCase()
        .includes("adherence"),
    ),
    provider: riskAssessment.filter((item) =>
      String(item?.type || "")
        .toLowerCase()
        .includes("provider"),
    ),
  };

  const bottomActions = [
    {
      id: "complete",
      label: "Complete",
      enabled: canMutate && allowedActions.includes("complete"),
      onClick: () => openDialog("complete"),
    },
    {
      id: "expire",
      label: "Expire",
      enabled: canMutate && allowedActions.includes("expire"),
      onClick: () => openDialog("expire"),
    },
    {
      id: "ledger",
      label: "Ledger",
      enabled: Boolean(detail?.payment?.paymentId),
      href: detail?.payment?.paymentId
        ? `/admin/payments/${detail.payment.paymentId}`
        : null,
    },
  ];

  return (
    <div className="min-w-0 space-y-4 pb-24 lg:pb-8">
      <div className="sticky top-[var(--sticky-offset-workspace)] z-30 rounded-2xl border border-white/55 bg-white/78 p-3 backdrop-blur-xl shadow-[0_16px_34px_rgb(15_23_42_/_0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-[#64748b]">
              Treatments / {customId(String(treatment._id), "TRT")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <BackLink href="/admin/treatments">
                <H1 className="text-xl">Treatment Operations Workspace</H1>
              </BackLink>
              <OperationalBadge status={treatment.status} />
              <Badge
                className={cn(
                  "h-7 rounded-full px-2.5 text-xs",
                  outstandingAmount > 0
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200",
                )}
              >
                {paymentStatus}
              </Badge>
              {isOverdue ? (
                <Badge className="h-7 rounded-full border border-red-200 bg-red-50 text-red-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Overdue
                </Badge>
              ) : null}
              <Badge className="h-7 rounded-full border border-slate-200 bg-white text-slate-700">
                <Timer className="h-3.5 w-3.5" />
                {validityDays === null
                  ? "Validity not set"
                  : validityDays < 0
                    ? `Expired ${Math.abs(validityDays)}d ago`
                    : `${validityDays}d remaining`}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canMutate && allowedActions.includes("complete") ? (
              <Button
                variant="workflowPrimary"
                onClick={() => openDialog("complete")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete Treatment
              </Button>
            ) : null}

            {canMutate && allowedActions.includes("expire") ? (
              <Button
                variant="workflowWarning"
                onClick={() => openDialog("expire")}
              >
                <Clock3 className="h-4 w-4" />
                Expire Treatment
              </Button>
            ) : null}

            <Button
              variant="outline"
              disabled
              title="Pause workflow endpoint is not exposed yet."
            >
              <PauseCircle className="h-4 w-4" />
              Pause Treatment
            </Button>

            {detail?.payment?.paymentId ? (
              <Button asChild variant="outline">
                <Link href={`/admin/payments/${detail.payment.paymentId}`}>
                  <Landmark className="h-4 w-4" />
                  View Ledger
                </Link>
              </Button>
            ) : null}

            {detail?.invoice?.invoiceUrl ? (
              <Button asChild variant="outline">
                <Link href={detail.invoice.invoiceUrl} target="_blank">
                  <Download className="h-4 w-4" />
                  Download Invoice
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <FileText className="h-4 w-4" />
                Download Invoice
              </Button>
            )}
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#1e3a8a] p-6 text-white shadow-[0_28px_66px_rgb(15_23_42_/_0.44)] lg:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#38bdf8]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#10b981]/14 blur-3xl" />

        <div className="relative grid gap-4 lg:grid-cols-[1.2fr_0.85fr_0.95fr]">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-white/30">
                <AvatarImage
                  src={treatment?.patientId?.profilePhoto || ""}
                  alt={patientName || "Patient"}
                />
                <AvatarFallback className="bg-white/20 text-white">
                  {initials(patientName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">
                  {patientName || "Patient"}
                </p>
                <p className="text-xs text-blue-100">
                  {treatment?.patientId?.phone || "No phone"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-blue-100">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {treatment?.serviceId?.name || "Service unavailable"}
              </p>
              <p className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                {providerName || "Provider unassigned"}
              </p>
              <p className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                {formatDate(treatment?.startDate)} -{" "}
                {formatDate(treatment?.validTill)}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="h-7 rounded-full border border-white/25 bg-white/10 px-3 text-[11px] text-white">
                {treatment?.serviceId?.category || "General"}
              </Badge>
              <Badge className="h-7 rounded-full border border-white/25 bg-white/10 px-3 text-[11px] text-white">
                Session {detail?.sessions?.current || completedSessions + 1}
              </Badge>
              <Badge className="h-7 rounded-full border border-white/25 bg-white/10 px-3 text-[11px] text-white">
                {paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.08em] text-blue-100">
              Treatment Progress
            </p>
            <div className="mt-3 flex items-center justify-center">
              <ProgressRing value={progressValue} label="Sessions" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/20 bg-white/10 p-2">
                <p className="text-blue-100">Timeline</p>
                <p className="mt-1 font-semibold text-white">
                  {formatDate(
                    detail?.chain?.nextSessionDate || treatment?.validTill,
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-2">
                <p className="text-blue-100">Risk Level</p>
                <p className="mt-1 font-semibold text-white">
                  {riskScore >= 70
                    ? "High"
                    : riskScore >= 40
                      ? "Moderate"
                      : "Low"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.08em] text-blue-100">
              Operational Controls
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="heroLight"
                size="sm"
                onClick={() => openDialog("complete")}
                disabled={!canMutate || !allowedActions.includes("complete")}
              >
                <Play className="h-4 w-4" />
                Complete
              </Button>
              <Button
                variant="heroGhost"
                size="sm"
                onClick={() => openDialog("expire")}
                disabled={!canMutate || !allowedActions.includes("expire")}
              >
                <Clock3 className="h-4 w-4" />
                Expire
              </Button>
              <Button variant="heroGhost" size="sm" asChild>
                <Link
                  href={
                    detail?.payment?.paymentId
                      ? `/admin/payments/${detail.payment.paymentId}`
                      : "#"
                  }
                >
                  <CircleDollarSign className="h-4 w-4" />
                  Ledger
                </Link>
              </Button>
              <Button variant="heroGhost" size="sm" asChild>
                <Link href={detail?.invoice?.invoiceUrl || "#"} target="_blank">
                  <Download className="h-4 w-4" />
                  Invoice
                </Link>
              </Button>
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-white/20 bg-white/10 p-3 text-xs text-blue-50">
              <p className="flex items-center justify-between">
                <span>Invoice State</span>
                <span className="font-semibold">
                  {detail?.invoice?.invoiceNumber ? "Generated" : "Pending"}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Payment Health</span>
                <span className="font-semibold">
                  {outstandingAmount > 0 ? "Collection Needed" : "Healthy"}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Next Session</span>
                <span className="font-semibold">
                  {formatDate(detail?.chain?.nextSessionDate || null)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            trend={kpi.trend}
            delay={index * 0.03}
          />
        ))}
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.6fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card className="border-white/55 bg-white/84 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#0f172a]">
                <CalendarClock className="h-4 w-4 text-[#2563eb]" />
                Session Timeline
              </CardTitle>
              <CardDescription>
                Operational booking chain with status, payment and provider
                visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedSessions.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="No sessions in chain yet"
                  description="Session timeline will appear after booking chain creation."
                  actionLabel="View Treatments"
                  actionHref="/admin/treatments"
                />
              ) : (
                <div className="space-y-4">
                  {sortedSessions.map((session, index) => {
                    const sessionStatus = session?.status || "Pending";
                    const isUpcoming =
                      session?._id && session._id === upcomingSessionId;
                    const isLate = (() => {
                      if (!session?.appointmentDate) return false;
                      const when = new Date(session.appointmentDate).getTime();
                      if (!Number.isFinite(when)) return false;
                      const status = String(sessionStatus).toLowerCase();
                      return (
                        when < Date.now() &&
                        ![
                          "completed",
                          "cancelled",
                          "rejected",
                          "treatmentcompleted",
                        ].includes(status)
                      );
                    })();

                    return (
                      <motion.div
                        key={session._id || `${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.28 }}
                        transition={{ duration: 0.24, delay: index * 0.03 }}
                        className={cn(
                          "relative rounded-2xl border bg-white p-4 shadow-sm",
                          isUpcoming
                            ? "border-blue-300 ring-1 ring-blue-200"
                            : "border-slate-200",
                          isLate ? "border-red-200 bg-red-50/40" : "",
                        )}
                      >
                        <div className="absolute -left-2 top-9 hidden h-[calc(100%-1.25rem)] w-px bg-gradient-to-b from-[#cbd5e1] to-transparent md:block" />
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[#0f172a]">
                              Session {session?.sessionNumber || index + 1}
                            </p>
                            <p className="text-xs text-[#64748b]">
                              {formatDateTime(session?.appointmentDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isUpcoming ? (
                              <Badge className="border border-blue-200 bg-blue-50 text-blue-700">
                                Next Upcoming
                              </Badge>
                            ) : null}
                            {isLate ? (
                              <Badge className="border border-red-200 bg-red-50 text-red-700">
                                Overdue Session
                              </Badge>
                            ) : null}
                            <Badge
                              className={cn(
                                "border",
                                getSessionStateTone(sessionStatus),
                              )}
                            >
                              {sessionStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid gap-2 text-xs text-[#475569] sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-[#64748b]">
                              Provider
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#0f172a]">
                              {providerName || "Unassigned"}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-[#64748b]">
                              Payment State
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#0f172a]">
                              {session?.paymentStatus || paymentStatus}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-[#64748b]">
                              Invoice Linkage
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#0f172a]">
                              {detail?.invoice?.invoiceNumber || "Pending"}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-[#64748b]">
                              Provider Notes
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-medium text-[#0f172a]">
                              {session?.providerNote ||
                                session?.note ||
                                "No notes"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/appointments/${session._id}`}>
                              Open Session
                            </Link>
                          </Button>
                          {detail?.payment?.paymentId ? (
                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={`/admin/payments/${detail.payment.paymentId}`}
                              >
                                Open Ledger
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/55 bg-white/84 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#0f172a]">
                <CircleDollarSign className="h-4 w-4 text-[#2563eb]" />
                Payment & Financial Operations
              </CardTitle>
              <CardDescription>
                Collection, invoice and settlement monitoring for treatment
                billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <FinanceTile
                  label="Total Billed"
                  value={formatCurrency(billedAmount)}
                  tone="blue"
                />
                <FinanceTile
                  label="Paid Amount"
                  value={formatCurrency(paidAmount)}
                  tone="green"
                />
                <FinanceTile
                  label="Outstanding"
                  value={formatCurrency(outstandingAmount)}
                  tone={outstandingAmount > 0 ? "amber" : "green"}
                />
                <FinanceTile
                  label="Invoice State"
                  value={
                    detail?.invoice?.invoiceNumber ? "Generated" : "Pending"
                  }
                  tone={detail?.invoice?.invoiceNumber ? "green" : "slate"}
                />
                <FinanceTile
                  label="Refund State"
                  value={
                    toNumber(detail?.payment?.totalRefunded) > 0
                      ? "Refund active"
                      : "No refund"
                  }
                  tone={
                    toNumber(detail?.payment?.totalRefunded) > 0
                      ? "amber"
                      : "slate"
                  }
                />
                <FinanceTile
                  label="Settlement"
                  value={
                    outstandingAmount > 0 ? "Pending collection" : "Settled"
                  }
                  tone={outstandingAmount > 0 ? "amber" : "green"}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748b]">Collection Progress</span>
                  <span className="font-semibold text-[#0f172a]">
                    {billedAmount > 0
                      ? Math.round((paidAmount / billedAmount) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    billedAmount > 0
                      ? Math.min(100, (paidAmount / billedAmount) * 100)
                      : 0
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={!detail?.invoice?.invoiceUrl}
                >
                  <Link
                    href={detail?.invoice?.invoiceUrl || "#"}
                    target="_blank"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Invoice Preview
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={!detail?.payment?.paymentId}
                >
                  <Link
                    href={
                      detail?.payment?.paymentId
                        ? `/admin/payments/${detail.payment.paymentId}`
                        : "#"
                    }
                  >
                    <Landmark className="h-3.5 w-3.5" />
                    Ledger Navigation
                  </Link>
                </Button>
                <Button
                  variant="medico"
                  size="sm"
                  disabled={outstandingAmount <= 0}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Payment Collection
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/55 bg-white/84 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#0f172a]">
                <Gauge className="h-4 w-4 text-[#2563eb]" />
                Session Progress Visualization
              </CardTitle>
              <CardDescription>
                Completion graph, adherence meter and treatment execution streak
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProgressLine
                label="Completion"
                value={progressValue}
                tone="blue"
              />
              <ProgressLine
                label="Adherence"
                value={adherenceScore}
                tone={adherenceScore >= 75 ? "green" : "amber"}
              />
              <ProgressLine
                label="Timeline Health"
                value={isOverdue ? 32 : 82}
                tone={isOverdue ? "red" : "green"}
              />

              <div className="grid gap-2 sm:grid-cols-3">
                <MiniStat
                  label="Completed Streak"
                  value={`${Math.max(1, Math.min(6, completedSessions || 0))}`}
                />
                <MiniStat
                  label="Current Session"
                  value={`${detail?.sessions?.current || completedSessions + 1}`}
                />
                <MiniStat label="Completion %" value={`${progressValue}%`} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/55 bg-white/84 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#0f172a]">
                <ShieldAlert className="h-4 w-4 text-[#dc2626]" />
                Risk Assessment Console
              </CardTitle>
              <CardDescription>
                Medical, financial and operational urgency grouped for action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <RiskGroup title="Medical Risk" items={riskBuckets.medical} />
              <RiskGroup title="Payment Risk" items={riskBuckets.payment} />
              <RiskGroup
                title="Operational Delay"
                items={riskBuckets.operational}
              />
              <RiskGroup title="Adherence Risk" items={riskBuckets.adherence} />
              <RiskGroup title="Provider Risk" items={riskBuckets.provider} />
              {riskAssessment.length === 0 ? (
                <EmptyState
                  icon={ShieldAlert}
                  title="No active risk flags"
                  description="Risk engine has not raised treatment alerts yet."
                />
              ) : null}
            </CardContent>
          </Card>

          <TreatmentRecommendations
            recommendations={recommendations}
            treatmentId={treatmentId}
            treatment={treatment}
            detail={detail}
            generatedAt={detail?.updatedAt || treatment?.updatedAt}
          />

          <Card className="border-white/55 bg-white/84 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base text-[#0f172a]">
                Audit & Metadata
              </CardTitle>
              <CardDescription>
                Operational traceability across treatment lifecycle changes
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <AuditTile
                label="Treatment ID"
                value={customId(String(treatment?._id || ""), "TRT")}
              />
              <AuditTile
                label="Created At"
                value={formatDateTime(treatment?.createdAt)}
              />
              <AuditTile
                label="Updated At"
                value={formatDateTime(treatment?.updatedAt)}
              />
              <AuditTile
                label="Current Booking"
                value={
                  detail?.chain?.currentBooking?._id
                    ? customId(String(detail.chain.currentBooking._id), "BKG")
                    : "-"
                }
              />
              <AuditTile
                label="Patient ID"
                value={
                  treatment?.patientId?._id
                    ? customId(String(treatment.patientId._id), "PAT")
                    : "-"
                }
              />
              <AuditTile
                label="Provider ID"
                value={
                  treatment?.servicePartnerId?._id
                    ? customId(String(treatment.servicePartnerId._id), "SPR")
                    : "-"
                }
              />
              <AuditTile
                label="Service ID"
                value={
                  treatment?.serviceId?._id
                    ? customId(String(treatment.serviceId._id), "SRV")
                    : "-"
                }
              />
              <AuditTile
                label="Workflow Updated"
                value={formatDateTime(
                  detail?.workflowUpdatedAt || treatment?.updatedAt,
                )}
              />
            </CardContent>
          </Card>
        </div>

        <TreatmentInsightsSidebar
          treatment={treatment}
          detail={detail}
          recommendations={recommendations}
          onAction={(action) => {
            if (
              action === "complete" &&
              canMutate &&
              allowedActions.includes("complete")
            ) {
              openDialog("complete");
              return;
            }
            if (
              action === "expire" &&
              canMutate &&
              allowedActions.includes("expire")
            ) {
              openDialog("expire");
              return;
            }
            if (
              action === "activate" &&
              canMutate &&
              allowedActions.includes("activate")
            ) {
              openDialog("activate");
            }
          }}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/90 p-2 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          {bottomActions.map((item) =>
            item.href ? (
              <Button
                key={item.id}
                asChild
                variant={item.enabled ? "outline" : "secondary"}
                className="h-9 flex-1"
                disabled={!item.enabled}
              >
                <Link href={item.enabled ? item.href : "#"}>{item.label}</Link>
              </Button>
            ) : (
              <Button
                key={item.id}
                variant={item.enabled ? "medico" : "secondary"}
                className="h-9 flex-1"
                onClick={item.onClick}
                disabled={!item.enabled}
              >
                {item.label}
              </Button>
            ),
          )}
        </div>
      </div>

      <Dialog open={Boolean(dialog.type)} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.type === "activate"
                ? "Activate Treatment"
                : dialog.type === "expire"
                  ? "Expire Treatment"
                  : "Complete Treatment"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {dialog.type === "activate" ? (
              <>
                <Input
                  type="date"
                  value={form.validTill}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      validTill: event.target.value,
                    }))
                  }
                />
                <Textarea
                  placeholder="Reason (optional)"
                  value={form.reason}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reason: event.target.value }))
                  }
                />
              </>
            ) : null}

            {dialog.type === "expire" ? (
              <Textarea
                placeholder="Reason (required)"
                value={form.reason}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, reason: event.target.value }))
                }
              />
            ) : null}

            {dialog.type === "complete" ? (
              <>
                <p className="text-sm text-[#64748b]">
                  Final completion marks the treatment as completed and triggers
                  invoice workflow.
                </p>
                <Textarea
                  placeholder="Completion note (optional)"
                  value={form.reason}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reason: event.target.value }))
                  }
                />
              </>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button onClick={submitAction} disabled={isMutating}>
              {isMutating ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FinanceTile = ({ label, value, tone = "slate" }) => {
  const toneClass = {
    blue: "border-blue-200 bg-blue-50/70 text-blue-700",
    green: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
    amber: "border-amber-200 bg-amber-50/70 text-amber-700",
    slate: "border-slate-200 bg-slate-50/70 text-slate-700",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2",
        toneClass || toneClass.slate,
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.08em]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#0f172a]">{value}</p>
    </div>
  );
};

const ProgressLine = ({ label, value, tone = "blue" }) => {
  const barClass = {
    blue: "[&>div]:bg-blue-500",
    green: "[&>div]:bg-emerald-500",
    amber: "[&>div]:bg-amber-500",
    red: "[&>div]:bg-red-500",
  }[tone];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#64748b]">{label}</span>
        <span className="font-semibold text-[#0f172a]">
          {Math.round(value)}%
        </span>
      </div>
      <Progress
        value={Math.min(100, Math.max(0, value))}
        className={barClass}
      />
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
    <p className="text-[10px] uppercase tracking-[0.08em] text-[#64748b]">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-[#0f172a]">{value}</p>
  </div>
);

const RiskGroup = ({ title, items = [] }) => {
  const visible = items.slice(0, 2);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">
          {title}
        </p>
        <Badge className="border border-slate-200 bg-white text-slate-700">
          {items.length}
        </Badge>
      </div>
      {visible.length === 0 ? (
        <p className="text-xs text-[#64748b]">No active flags</p>
      ) : (
        <div className="space-y-2">
          {visible.map((risk, index) => (
            <div
              key={`${title}-${index}`}
              className={cn(
                "rounded-lg border px-2.5 py-2 text-xs",
                getSeverityClass(risk?.severity),
              )}
            >
              <p className="font-semibold">
                {String(risk?.severity || "medium").toUpperCase()}
              </p>
              <p className="mt-0.5 text-[#334155]">
                {risk?.message || "Risk signal detected"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AuditTile = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
    <p className="text-[10px] uppercase tracking-[0.08em] text-[#64748b]">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-[#0f172a]">{value || "-"}</p>
  </div>
);

export default TreatmentDetailPage;
