"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Gauge,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const Section = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_10px_24px_rgb(2_6_23_/_0.24)] backdrop-blur">
    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
      <Icon className="h-4 w-4 text-blue-200" />
      {title}
    </p>
    {children}
  </div>
);

const SmallStat = ({ label, value, tone = "default" }) => {
  const toneClass = {
    default: "text-blue-50",
    good: "text-emerald-200",
    warn: "text-amber-200",
    bad: "text-red-200",
  }[tone];

  return (
    <div className="rounded-xl border border-white/15 bg-[#0b1228]/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.08em] text-blue-200/80">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${toneClass || "text-blue-50"}`}
      >
        {value}
      </p>
    </div>
  );
};

export const TreatmentInsightsSidebar = ({
  treatment = {},
  detail = {},
  recommendations = {},
  onAction,
}) => {
  const analytics = recommendations?.analytics || {};
  const sessionIntel = recommendations?.sessionIntelligence || {};
  const riskAssessment = recommendations?.riskAssessment || [];
  const actionRecommendations = recommendations?.actionRecommendations || [];
  const patientHistory = recommendations?.patientHistory || {};

  const totalAmount = Number(
    analytics?.totalAmount || detail?.payment?.totalAmount || 0,
  );
  const paidAmount = Number(
    analytics?.paidAmount || detail?.payment?.totalPaid || 0,
  );
  const pendingAmount = Number(
    analytics?.pendingAmount ??
      detail?.payment?.remainingBalance ??
      Math.max(0, totalAmount - paidAmount),
  );
  const completion = Number(
    detail?.progressPercentage || sessionIntel?.completionPercentage || 0,
  );

  const highRiskCount = riskAssessment.filter(
    (item) => String(item?.severity || "").toLowerCase() === "high",
  ).length;
  const mediumRiskCount = riskAssessment.filter(
    (item) => String(item?.severity || "").toLowerCase() === "medium",
  ).length;
  const escalationNeeded = highRiskCount > 0 || analytics?.isOverdue;

  return (
    <aside className="min-w-0">
      <div className="space-y-4 xl:sticky xl:top-[var(--sticky-offset-sidebar)]">
        <div className="rounded-[26px] border border-[#0f172a] bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0b1220] p-4 shadow-[0_24px_54px_rgb(2_6_23_/_0.38)]">
          <p className="mb-4 text-xs uppercase tracking-[0.12em] text-blue-200/80">
            Operations Rail
          </p>

          <Section icon={Sparkles} title="Quick Actions">
            <div className="grid gap-2">
              <Button
                variant="heroLight"
                size="sm"
                className="justify-start"
                onClick={() => onAction?.("complete")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete Treatment
              </Button>
              <Button
                variant="heroGhost"
                size="sm"
                className="justify-start"
                onClick={() => onAction?.("expire")}
              >
                <Clock3 className="h-4 w-4" />
                Expire Treatment
              </Button>
              <Button
                variant="heroGhost"
                size="sm"
                className="justify-start"
                onClick={() => onAction?.("activate")}
              >
                <TrendingUp className="h-4 w-4" />
                Activate
              </Button>
            </div>
          </Section>

          <Section icon={CircleDollarSign} title="Payment Health">
            <div className="grid gap-2">
              <SmallStat
                label="Total Billed"
                value={formatCurrency(totalAmount)}
              />
              <SmallStat
                label="Paid"
                value={formatCurrency(paidAmount)}
                tone="good"
              />
              <SmallStat
                label="Outstanding"
                value={formatCurrency(pendingAmount)}
                tone={pendingAmount > 0 ? "warn" : "good"}
              />
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-blue-200">
                <span>Collection Progress</span>
                <span className="font-semibold">
                  {totalAmount > 0
                    ? Math.round((paidAmount / totalAmount) * 100)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}
              />
            </div>
          </Section>

          <Section icon={Gauge} title="Session Progress">
            <div className="space-y-2">
              <SmallStat
                label="Completed / Total"
                value={`${sessionIntel?.completedSessions ?? detail?.sessions?.completed ?? 0} / ${
                  sessionIntel?.totalSessions ?? detail?.sessions?.total ?? 0
                }`}
                tone="good"
              />
              <SmallStat
                label="Adherence"
                value={String(sessionIntel?.adherence || "Unknown").replaceAll(
                  "_",
                  " ",
                )}
                tone={
                  sessionIntel?.adherence === "behind"
                    ? "bad"
                    : sessionIntel?.adherence === "moderate"
                      ? "warn"
                      : "good"
                }
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-blue-200">
                  <span>Completion</span>
                  <span className="font-semibold">{completion}%</span>
                </div>
                <Progress value={completion} />
              </div>
            </div>
          </Section>

          <Section icon={Lightbulb} title="Smart Insights">
            <div className="space-y-2 text-xs text-blue-100">
              <InsightLine
                text={
                  patientHistory?.pastAppointments > 0
                    ? `Returning patient with ${patientHistory.pastAppointments} prior appointment(s).`
                    : "New patient baseline, monitoring for behavior trends."
                }
              />
              <InsightLine
                text={
                  analytics?.treatmentNearExpiry
                    ? "Treatment validity near expiry. Plan renewal escalation."
                    : "Treatment validity currently stable."
                }
              />
              <InsightLine
                text={
                  analytics?.isOverdue
                    ? "Overdue indicator detected, immediate intervention recommended."
                    : "No overdue timeline signals detected."
                }
              />
            </div>
          </Section>

          <Section icon={ShieldAlert} title="Treatment Risk">
            <div className="grid gap-2">
              <SmallStat
                label="Critical"
                value={`${highRiskCount}`}
                tone={highRiskCount > 0 ? "bad" : "good"}
              />
              <SmallStat
                label="Medium"
                value={`${mediumRiskCount}`}
                tone={mediumRiskCount > 0 ? "warn" : "default"}
              />
              <SmallStat
                label="Status"
                value={treatment?.status || "Unknown"}
                tone={analytics?.isOverdue ? "bad" : "default"}
              />
            </div>
          </Section>

          <Section icon={AlertTriangle} title="Escalation Status">
            <div className="space-y-2">
              <Badge
                className={
                  escalationNeeded
                    ? "border border-red-300 bg-red-500/20 text-red-100"
                    : "border border-emerald-300 bg-emerald-500/20 text-emerald-100"
                }
              >
                {escalationNeeded
                  ? "Escalation Required"
                  : "No Escalation Required"}
              </Badge>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild variant="heroGhost" size="sm">
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
                <Button asChild variant="heroGhost" size="sm">
                  <Link
                    href={detail?.invoice?.invoiceUrl || "#"}
                    target="_blank"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Invoice
                  </Link>
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </aside>
  );
};

const InsightLine = ({ text }) => (
  <div className="rounded-lg border border-white/15 bg-[#0b1228]/45 px-3 py-2">
    {text}
  </div>
);
