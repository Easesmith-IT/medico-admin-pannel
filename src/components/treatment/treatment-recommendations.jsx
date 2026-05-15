"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formatDateTime = (value) => {
  if (!value) return "just now";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "just now";
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const toSeverity = (value = "info") => {
  const normalized = String(value).toLowerCase();
  if (normalized === "high" || normalized === "critical") return "critical";
  if (normalized === "medium") return "medium";
  if (normalized === "low" || normalized === "healthy") return "healthy";
  return "info";
};

const severityUi = {
  critical: {
    border: "border-red-200",
    rail: "bg-red-500",
    chip: "border-red-200 bg-red-50 text-red-700",
    confidence: "High",
  },
  medium: {
    border: "border-amber-200",
    rail: "bg-amber-500",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    confidence: "Medium",
  },
  info: {
    border: "border-blue-200",
    rail: "bg-blue-500",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    confidence: "Informational",
  },
  healthy: {
    border: "border-emerald-200",
    rail: "bg-emerald-500",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    confidence: "Healthy",
  },
};

const EmptyGroup = ({ icon: Icon, title, description, ctaLabel, ctaHref }) => (
  <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-center">
    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-[#e2e8f0]">
      <Icon className="h-3.5 w-3.5 text-[#2563eb]" />
    </div>
    <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
    <p className="mt-1 text-xs text-[#64748b]">{description}</p>
    {ctaLabel && ctaHref ? (
      <Button asChild size="sm" variant="outline" className="mt-3">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    ) : null}
  </div>
);

const SignalCard = ({ title, message, severity = "info", cta, delay = 0 }) => {
  const tone = severityUi[toSeverity(severity)] || severityUi.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.22, delay }}
      className={`relative overflow-hidden rounded-xl border bg-white ${tone.border}`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${tone.rail}`} />
      <div className="space-y-2 p-3 pl-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">
            {title}
          </p>
          <Badge className={`border ${tone.chip}`}>
            {toSeverity(severity)}
          </Badge>
        </div>
        <p className="text-sm text-[#0f172a]">{message}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-[#64748b]">
            Confidence: {tone.confidence}
          </p>
          {cta ? (
            <Button size="sm" variant="outline" className="h-7">
              {cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

const Group = ({ icon: Icon, title, subtitle, children }) => (
  <Card className="border-white/55 bg-white/84 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)] backdrop-blur">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base text-[#0f172a]">
        <Icon className="h-4 w-4 text-[#2563eb]" />
        {title}
      </CardTitle>
      <CardDescription>{subtitle}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

export const TreatmentRecommendations = ({
  recommendations = {},
  treatmentId,
  treatment = {},
  detail = {},
  generatedAt,
}) => {
  const sessionIntel = recommendations?.sessionIntelligence || {};
  const riskAssessment = recommendations?.riskAssessment || [];
  const actionRecommendations = recommendations?.actionRecommendations || [];
  const analytics = recommendations?.analytics || {};
  const patientHistory = recommendations?.patientHistory || {};

  const adherenceSignals = [
    {
      title: "Adherence State",
      message: `Current adherence: ${String(sessionIntel?.adherence || "unknown").replaceAll("_", " ")}.`,
      severity:
        sessionIntel?.adherence === "behind"
          ? "critical"
          : sessionIntel?.adherence === "moderate"
            ? "medium"
            : "healthy",
      cta: "Review Schedule",
    },
    {
      title: "Session Gap",
      message:
        sessionIntel?.averageGapDays != null
          ? `Average gap between sessions is ${sessionIntel.averageGapDays} day(s).`
          : "Gap tracking is still building from new session data.",
      severity:
        sessionIntel?.averageGapDays >= 7
          ? "medium"
          : sessionIntel?.averageGapDays >= 1
            ? "info"
            : "healthy",
      cta: "Open Timeline",
    },
  ];

  const paymentSignals = [
    {
      title: "Outstanding Balance",
      message: `Pending collection: ${formatCurrency(analytics?.pendingAmount || detail?.payment?.remainingBalance || 0)}.`,
      severity:
        Number(
          analytics?.pendingAmount || detail?.payment?.remainingBalance || 0,
        ) > 0
          ? "medium"
          : "healthy",
      cta: "Collect Payment",
    },
    {
      title: "Invoice State",
      message: detail?.invoice?.invoiceNumber
        ? `Invoice ${detail.invoice.invoiceNumber} is generated.`
        : "Invoice is pending and should be monitored until completion.",
      severity: detail?.invoice?.invoiceNumber ? "healthy" : "info",
      cta: detail?.invoice?.invoiceNumber ? "View Invoice" : "Track Invoice",
    },
  ];

  const smartInsights = [
    patientHistory?.pastAppointments > 0
      ? `Patient has ${patientHistory.pastAppointments} previous appointment(s), enabling stronger care continuity signals.`
      : "New patient profile; baseline behavior still being established.",
    analytics?.isOverdue
      ? "Treatment is marked overdue and should be escalated to operations today."
      : "Treatment cadence currently aligns with timeline expectations.",
    analytics?.treatmentNearExpiry
      ? "Treatment validity is near expiry and renewal planning should be initiated."
      : "Treatment validity window remains stable.",
  ];

  const escalationFlags = [
    ...riskAssessment
      .filter((risk) => toSeverity(risk?.severity) === "critical")
      .slice(0, 2)
      .map((risk) => ({
        title: "Critical Risk",
        message: risk?.message || "Critical risk signal detected.",
        severity: "critical",
        cta: "Escalate",
      })),
    ...(analytics?.isOverdue
      ? [
          {
            title: "Overdue Treatment",
            message:
              "Treatment has crossed expected timeline and requires immediate review.",
            severity: "critical",
            cta: "Escalate",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <Card className="border-white/55 bg-white/84 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)] backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#0f172a]">
            <Sparkles className="h-4 w-4 text-[#2563eb]" />
            Treatment Intelligence Workspace
          </CardTitle>
          <CardDescription>
            Generated{" "}
            {formatDateTime(
              generatedAt || treatment?.updatedAt || detail?.updatedAt,
            )}{" "}
            • Confidence labels included for operational actioning
          </CardDescription>
        </CardHeader>
      </Card>

      <Group
        icon={CheckCircle2}
        title="Recommended Actions"
        subtitle="Prioritized workflow actions for treatment progression"
      >
        {actionRecommendations.length === 0 ? (
          <EmptyGroup
            icon={CheckCircle2}
            title="No active recommendations"
            description="Operational action engine has no immediate interventions."
            ctaLabel="Review Treatment"
            ctaHref={`/admin/treatments/${treatmentId}`}
          />
        ) : (
          actionRecommendations.map((item, index) => (
            <SignalCard
              key={`${item?.key || "action"}-${index}`}
              title={item?.cta || "Recommended Action"}
              message={item?.message || "Operational recommendation available."}
              severity={item?.severity || "medium"}
              cta={item?.cta || "Open"}
              delay={index * 0.03}
            />
          ))
        )}
      </Group>

      <Group
        icon={ShieldAlert}
        title="Risk Signals"
        subtitle="Severity-layered treatment risk alerts from intelligence engine"
      >
        {riskAssessment.length === 0 ? (
          <EmptyGroup
            icon={ShieldAlert}
            title="No risk flags raised"
            description="Risk scoring currently indicates low operational concern."
          />
        ) : (
          riskAssessment.map((risk, index) => (
            <SignalCard
              key={`${risk?.type || "risk"}-${index}`}
              title={risk?.type || "Risk Signal"}
              message={risk?.message || "Risk indicator identified."}
              severity={risk?.severity || "medium"}
              cta="Review"
              delay={index * 0.03}
            />
          ))
        )}
      </Group>

      <div className="grid gap-4 xl:grid-cols-2">
        <Group
          icon={Gauge}
          title="Adherence Intelligence"
          subtitle="Session consistency and adherence confidence"
        >
          {adherenceSignals.map((signal, index) => (
            <SignalCard
              key={`${signal.title}-${index}`}
              title={signal.title}
              message={signal.message}
              severity={signal.severity}
              cta={signal.cta}
              delay={index * 0.03}
            />
          ))}
        </Group>

        <Group
          icon={CircleDollarSign}
          title="Payment Intelligence"
          subtitle="Billing pressure and collection health"
        >
          {paymentSignals.map((signal, index) => (
            <SignalCard
              key={`${signal.title}-${index}`}
              title={signal.title}
              message={signal.message}
              severity={signal.severity}
              cta={signal.cta}
              delay={index * 0.03}
            />
          ))}
        </Group>
      </div>

      <Group
        icon={Lightbulb}
        title="Smart Insights"
        subtitle="Auto-generated context for operators and coordinators"
      >
        {smartInsights.length === 0 ? (
          <EmptyGroup
            icon={Lightbulb}
            title="No insight generated yet"
            description="Insights appear as treatment workflow data grows."
          />
        ) : (
          smartInsights.map((message, index) => (
            <SignalCard
              key={`insight-${index}`}
              title={`Insight ${index + 1}`}
              message={message}
              severity="info"
              cta="Acknowledge"
              delay={index * 0.02}
            />
          ))
        )}
      </Group>

      <Group
        icon={AlertTriangle}
        title="Escalation Flags"
        subtitle="Critical escalations requiring immediate workflow intervention"
      >
        {escalationFlags.length === 0 ? (
          <EmptyGroup
            icon={AlertTriangle}
            title="No escalation required"
            description="Critical threshold has not been reached."
          />
        ) : (
          escalationFlags.map((flag, index) => (
            <SignalCard
              key={`escalation-${index}`}
              title={flag.title}
              message={flag.message}
              severity={flag.severity}
              cta={flag.cta}
              delay={index * 0.03}
            />
          ))
        )}
      </Group>

      <Group
        icon={Stethoscope}
        title="Clinical Context"
        subtitle="Patient continuity and care context for treatment operators"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <ContextTile
            label="Past Appointments"
            value={patientHistory?.pastAppointments ?? 0}
            tone="blue"
          />
          <ContextTile
            label="Medications"
            value={patientHistory?.medicationsCount ?? 0}
            tone="emerald"
          />
          <ContextTile
            label="Allergies"
            value={(patientHistory?.allergies || []).length}
            tone={
              (patientHistory?.allergies || []).length > 0 ? "amber" : "emerald"
            }
          />
          <ContextTile
            label="Conditions"
            value={(patientHistory?.medicalConditions || []).length}
            tone="blue"
          />
        </div>
      </Group>
    </div>
  );
};

const ContextTile = ({ label, value, tone = "blue" }) => {
  const toneClass = {
    blue: "border-blue-200 bg-blue-50/70",
    emerald: "border-emerald-200 bg-emerald-50/70",
    amber: "border-amber-200 bg-amber-50/70",
  }[tone];

  return (
    <div
      className={`rounded-xl border p-3 ${toneClass || "border-slate-200 bg-slate-50"}`}
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-[#0f172a]">{value}</p>
    </div>
  );
};
