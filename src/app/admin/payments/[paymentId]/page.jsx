"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleDollarSignIcon,
  CreditCardIcon,
  DownloadIcon,
  FileTextIcon,
  HandCoinsIcon,
  LandmarkIcon,
  LayersIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StethoscopeIcon,
  UserIcon,
  Wallet2Icon,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackLink } from "@/components/shared/back-link";
import { StateView } from "@/components/shared/state-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1 } from "@/components/typography";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiQuery } from "@/hooks/useApiQuery";
import { customId } from "@/lib/utils";
import { useParams } from "next/navigation";

const formatCurrency = (value = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

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

const formatSlotTime = (slotTime) => {
  if (!slotTime) return "-";
  if (typeof slotTime === "string") return slotTime;
  if (typeof slotTime === "object") {
    const start = slotTime.startTime || "";
    const end = slotTime.endTime || "";
    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    if (end) return end;
  }
  return "-";
};

const fullName = (item = {}) =>
  `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "-";

const getStatusTone = (status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "");
  if (["paid", "processed", "approved", "resolved", "completed"].includes(normalized))
    return "success";
  if (["unpaid", "failed", "rejected"].includes(normalized)) return "destructive";
  if (["refunded"].includes(normalized)) return "secondary";
  if (["partialrefund", "partiallypaid", "pending", "underreview", "initiated"].includes(normalized))
    return "inprogress";
  return "outline";
};

const getTimelineIcon = (type) => {
  if (type === "transaction") return CreditCardIcon;
  if (type === "refund") return RefreshCwIcon;
  if (type === "webhook") return SparklesIcon;
  if (type === "settlement") return LandmarkIcon;
  if (type === "status") return ShieldCheckIcon;
  return LayersIcon;
};

const buildClientTimelineFallback = (ledger) => {
  const events = [];
  if (ledger?.createdAt) {
    events.push({
      type: "ledger",
      title: "Ledger created",
      description: "Payment ledger initialized.",
      timestamp: ledger.createdAt,
      actor: null,
    });
  }
  (ledger?.transactions || []).forEach((tx) => {
    events.push({
      type: "transaction",
      title: `${tx.stage || "Payment"} transaction`,
      description: `${tx.method || "Unknown"} • ${formatCurrency(
        tx.amountPaid,
        tx.currency || ledger.currency || "INR"
      )}`,
      timestamp: tx.paidAt || tx.createdAt,
      actor: tx.collectedBy || null,
    });
  });
  (ledger?.refunds || []).forEach((refund) => {
    events.push({
      type: "refund",
      title: `${refund.refundType || "Refund"} processed`,
      description: `${refund.mode || "Unknown"} • ${formatCurrency(
        refund.amount,
        ledger.currency || "INR"
      )}`,
      timestamp: refund.refundedAt || refund.createdAt,
      actor: refund.approvedBy || refund.adminId || null,
    });
  });
  if (ledger?.lastWebhookProcessedAt || ledger?.lastWebhookEvent) {
    events.push({
      type: "webhook",
      title: "Webhook received",
      description: ledger.lastWebhookEvent || "Gateway event processed",
      timestamp: ledger.lastWebhookProcessedAt || ledger.updatedAt,
      actor: null,
    });
  }
  if (ledger?.updatedAt) {
    events.push({
      type: "status",
      title: `Status updated: ${ledger.paymentStatus || "-"}`,
      description: "Latest ledger status recorded",
      timestamp: ledger.updatedAt,
      actor: null,
    });
  }
  return events
    .filter((event) => event.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const getHealthFallback = (ledger) => {
  const totalBill = Number(ledger?.totalBillAmount || 0);
  const totalPaid = Number(ledger?.totalPaid || 0);
  const totalRefunded = Number(ledger?.totalRefunded || 0);
  const remainingBalance = Number(ledger?.remainingBalance || 0);
  const netPaid = Math.max(totalPaid - totalRefunded, 0);
  const completionPercentage =
    totalBill > 0 ? Math.min(Math.round((netPaid / totalBill) * 100), 100) : 0;
  const dueRatio = totalBill > 0 ? remainingBalance / totalBill : 0;
  return {
    completionPercentage,
    outstandingRisk:
      remainingBalance <= 0 ? "Low" : dueRatio > 0.5 ? "High" : dueRatio > 0.2 ? "Medium" : "Low",
    dues: remainingBalance,
    settlementPending: false,
  };
};

const getInsights = (ledger, paymentHealth) => {
  const insights = [];
  const paidTxCount = (ledger.transactions || []).filter((tx) => tx.status === "Paid").length;
  const refundCount = (ledger.refunds || []).length;
  if (paymentHealth.completionPercentage === 100) insights.push("All installments completed.");
  if (refundCount === 0) insights.push("No refunds issued for this ledger.");
  else insights.push(`${refundCount} refund event(s) recorded.`);
  if (paymentHealth.settlementPending) insights.push("Provider settlement is pending.");
  if (paidTxCount > 0) {
    const latest = [...(ledger.transactions || [])]
      .filter((tx) => tx.status === "Paid" && (tx.paidAt || tx.createdAt))
      .sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt))[0];
    if (latest) insights.push(`Last payment received on ${formatDateTime(latest.paidAt || latest.createdAt)}.`);
  }
  if (insights.length === 0) insights.push("No major payment events observed yet.");
  return insights;
};

const PaymentLedgerHero = ({ ledger, serviceName, canCollect, canRefund, canSettlement, canDispute }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, ease: "easeOut" }}
    className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#111f4d] to-[#172554] px-8 py-7 text-white shadow-[0_24px_72px_rgba(15,23,42,0.42)]"
  >
    <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[#2563eb]/35 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-[#10b981]/12 blur-3xl" />

    <div className="grid items-start gap-5 lg:grid-cols-[1fr_1fr_0.95fr]">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#93c5fd]/90">Payment Ledger</p>
          <h2 className="mt-1 text-[28px] font-semibold tracking-tight">{customId(ledger._id, "PAY")}</h2>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <p className="text-4xl font-bold leading-none">{formatCurrency(ledger.totalPaid, ledger.currency)}</p>
          <p className="text-sm text-[#bfdbfe]">Collected</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[ledger.paymentStatus || "Unknown", ledger.remainingBalance <= 0 ? "No Dues" : "Due Pending", "Completed"].map((badge) => (
            <span key={badge} className="inline-flex h-8 items-center rounded-full bg-white/14 px-[14px] text-xs font-medium text-[#e2e8f0]">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-white/[0.07] p-4 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-[#93c5fd]/90">Payment Flow</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/15 p-2">
              <UserIcon className="size-3.5 text-[#dbeafe]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#93c5fd]">Patient</p>
              <p className="text-sm font-semibold">{ledger.patientId?.firstName || "Patient"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2 text-[#93c5fd]">
            <ArrowDownIcon className="size-4" />
            <span className="text-[11px] uppercase tracking-[0.12em]">Payment Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/15 p-2">
              <StethoscopeIcon className="size-3.5 text-[#dbeafe]" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#93c5fd]">Provider</p>
              <p className="text-sm font-semibold">{fullName(ledger.servicePartnerId)}</p>
            </div>
          </div>
        </div>
        <div className="space-y-1.5 border-t border-white/10 pt-3 text-xs text-[#cbd5e1]">
          <p>Service: <span className="font-medium text-white">{serviceName}</span></p>
          <p>Treatment: <span className="font-medium text-white">{customId(String(ledger?.treatmentId?._id || ledger?.treatmentId), "TRT")}</span></p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.07] p-4 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.16em] text-[#93c5fd]/90">Quick Actions</p>
        <div className="mt-3 grid gap-2">
          {canCollect ? (
            <Button asChild className="h-10 justify-start rounded-xl bg-[#2563eb] text-white hover:bg-[#1d4ed8]">
              <Link href={`/admin/payments?tab=ledgers&search=${ledger._id}`}>Collect</Link>
            </Button>
          ) : null}
          {canRefund ? (
            <Button asChild className="h-10 justify-start rounded-xl bg-white/12 text-white hover:bg-white/20">
              <Link href={`/admin/payments?tab=ledgers&search=${ledger._id}`}>Refund</Link>
            </Button>
          ) : null}
          {canSettlement ? (
            <Button asChild className="h-10 justify-start rounded-xl bg-white/12 text-white hover:bg-white/20">
              <Link href={`/admin/payments?tab=settlements&search=${ledger._id}`}>Settlement</Link>
            </Button>
          ) : null}
          {canDispute ? (
            <Button asChild className="h-10 justify-start rounded-xl bg-white/12 text-white hover:bg-white/20">
              <Link href={`/admin/payments?tab=disputes&search=${ledger._id}`}>Dispute</Link>
            </Button>
          ) : null}
          <Button asChild className="h-10 justify-start rounded-xl bg-white/12 text-white hover:bg-white/20" disabled={!ledger?.invoiceId?.invoiceUrl}>
            <Link href={ledger?.invoiceId?.invoiceUrl || "#"} target="_blank">
              <DownloadIcon className="size-4" />
              Download Invoice
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </motion.section>
);

const FinancialAnalyticsStrip = ({ ledger }) => {
  const cards = [
    { key: "bill", label: "Total Bill", value: formatCurrency(ledger.totalBillAmount, ledger.currency), icon: CircleDollarSignIcon, caption: "Treatment billed amount", valueClass: "text-[#0f172a]" },
    { key: "paid", label: "Total Paid", value: formatCurrency(ledger.totalPaid, ledger.currency), icon: Wallet2Icon, caption: "Confirmed collections", valueClass: "text-[#0f172a]" },
    { key: "balance", label: "Remaining Balance", value: formatCurrency(ledger.remainingBalance, ledger.currency), icon: AlertTriangleIcon, caption: ledger.remainingBalance > 0 ? "Pending due exists" : "No pending dues", valueClass: ledger.remainingBalance > 0 ? "text-[#ef4444]" : "text-[#0f172a]" },
    { key: "refund", label: "Total Refunded", value: formatCurrency(ledger.totalRefunded, ledger.currency), icon: RefreshCwIcon, caption: "Processed refund amount", valueClass: "text-[#0f172a]" },
  ];
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.key}
            className="rounded-[22px] border-none bg-[rgba(255,255,255,0.9)] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-[12px] uppercase tracking-[0.08em] text-[#64748b]/70">{item.label}</p>
                <div className="rounded-full bg-[#eff6ff] p-2 text-[#2563eb]"><Icon className="size-4" /></div>
              </div>
              <p className={`text-[38px] font-bold leading-tight ${item.valueClass}`}>{item.value}</p>
              <p className="text-xs text-[#64748b]">{item.caption}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
};

const PaymentProgressTracker = ({ ledger, paymentHealth }) => {
  const hasAdvance = (ledger.transactions || []).some((tx) => tx.stage === "Advance" && tx.status === "Paid");
  const hasPartial = (ledger.transactions || []).some((tx) => tx.stage === "Partial" && tx.status === "Paid");
  const hasFinal = (ledger.transactions || []).some((tx) => tx.stage === "Final" && tx.status === "Paid");
  const stages = [
    { key: "advance", label: "Advance Paid", done: hasAdvance },
    { key: "partial", label: "Partial Paid", done: hasPartial },
    { key: "final", label: "Final Paid", done: hasFinal },
  ];

  const chartData = [
    { name: "Net Paid", value: Math.max(Number(ledger.totalPaid || 0) - Number(ledger.totalRefunded || 0), 0), fill: "#10b981" },
    { name: "Refunded", value: Number(ledger.totalRefunded || 0), fill: "#8b5cf6" },
    { name: "Due", value: Number(ledger.remainingBalance || 0), fill: "#ef4444" },
  ].filter((item) => item.value > 0);
  const resolvedChartData = chartData.length ? chartData : [{ name: "No Amount", value: 1, fill: "#cbd5e1" }];

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-lg text-[#0f172a]">Payment Progress Visualization</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.key} className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${stage.done ? "bg-[#10b981] text-white" : "bg-[#e2e8f0] text-[#64748b]"}`}>
                  {stage.done ? "✓" : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0f172a]">{stage.label}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-[#e2e8f0]">
                    <div className="h-full rounded-full bg-[#2563eb]" style={{ width: stage.done ? "100%" : "0%" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-4">
            <p className="text-xs text-[#64748b]">Completion Percentage</p>
            <p className="text-2xl font-bold text-[#0f172a]">{paymentHealth.completionPercentage}%</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-lg text-[#0f172a]">Amount Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={resolvedChartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={88} paddingAngle={2}>
                  {resolvedChartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, ledger.currency || "INR")} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {resolvedChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 rounded-full bg-[#f8fafc] px-3 py-1 text-xs text-[#334155]">
                <span className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

const BillBreakdownCard = ({ ledger }) => {
  const breakdown = ledger.billBreakdown || {};
  const rows = [
    { label: "Subtotal", value: breakdown.subtotal ?? 0 },
    { label: "CGST", value: breakdown.cgst ?? 0 },
    { label: "SGST", value: breakdown.sgst ?? 0 },
    { label: "GST Total", value: breakdown.gstAmount ?? 0 },
  ];
  return (
    <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
      <CardHeader><CardTitle className="text-lg text-[#0f172a]">Bill Breakdown</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-2 items-center gap-2 border-b border-[#f1f5f9] pb-2 text-sm">
            <p className="text-[#64748b]">{row.label}</p>
            <p className="text-right font-medium text-[#0f172a]">{formatCurrency(row.value, ledger.currency)}</p>
          </div>
        ))}
        <div className="grid grid-cols-2 items-center gap-2 rounded-xl bg-[#eff6ff] p-3">
          <p className="text-sm font-semibold text-[#1d4ed8]">Grand Total</p>
          <p className="text-right text-xl font-bold text-[#1d4ed8]">
            {formatCurrency(breakdown.grandTotal ?? ledger.totalBillAmount ?? 0, ledger.currency || "INR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const RelatedEntitiesGrid = ({ ledger }) => {
  const patient = ledger.patientId || {};
  const provider = ledger.servicePartnerId || {};
  const service = ledger.service || {};
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Patient</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-11"><AvatarImage src={patient.profilePhoto || ""} alt={patient.firstName || "Patient"} /><AvatarFallback><UserIcon className="size-4" /></AvatarFallback></Avatar>
            <p className="font-medium text-[#0f172a]">{fullName(patient)}</p>
          </div>
          <p className="text-sm text-[#64748b]">{patient.email || "-"}</p>
          <p className="text-sm text-[#64748b]">{patient.phone || "-"}</p>
          <Button asChild variant="outline" className="w-full rounded-xl"><Link href={patient?._id ? `/admin/patients/${patient._id}` : "#"}>View Patient</Link></Button>
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Provider</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-11"><AvatarImage src={provider.profilePhoto || ""} alt={provider.firstName || "Provider"} /><AvatarFallback><StethoscopeIcon className="size-4" /></AvatarFallback></Avatar>
            <p className="font-medium text-[#0f172a]">{fullName(provider)}</p>
          </div>
          <p className="text-sm text-[#64748b]">{provider.email || "-"}</p>
          <p className="text-sm text-[#64748b]">{provider.mobile || "-"}</p>
          <Button asChild variant="outline" className="w-full rounded-xl"><Link href={provider?._id ? `/admin/service-partners/${provider._id}` : "#"}>View Provider</Link></Button>
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Service</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-[#2563eb]"><StethoscopeIcon className="size-4" /><p className="text-sm font-medium text-[#0f172a]">{service?.name || "-"}</p></div>
          <p className="text-sm text-[#64748b]">Category: {service?.category || "-"}</p>
          <p className="text-sm text-[#64748b]">Treatment: {customId(String(ledger?.treatmentId?._id || ledger?.treatmentId), "TRT")}</p>
          <Button asChild variant="outline" className="w-full rounded-xl"><Link href={service?._id ? `/admin/services/${service._id}` : "#"}>View Service</Link></Button>
        </CardContent>
      </Card>
    </section>
  );
};

const TreatmentInvoiceCard = ({ ledger }) => {
  const treatment = ledger.treatmentId || {};
  const invoice = ledger.invoiceId || null;
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-lg text-[#0f172a]">Treatment</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3"><p className="text-[#64748b]">Treatment ID</p><p className="font-medium text-[#0f172a]">{customId(String(treatment?._id || treatment), "TRT")}</p></div>
          <div className="flex items-center justify-between gap-3"><p className="text-[#64748b]">Status</p><Badge variant={getStatusTone(treatment?.status)}>{treatment?.status || "-"}</Badge></div>
          <div className="flex items-center justify-between gap-3"><p className="text-[#64748b]">Start Date</p><p className="font-medium text-[#0f172a]">{formatDate(treatment?.startDate)}</p></div>
          <div className="flex items-center justify-between gap-3"><p className="text-[#64748b]">End Date</p><p className="font-medium text-[#0f172a]">{formatDate(treatment?.endDate)}</p></div>
          <div className="flex items-center justify-between gap-3"><p className="text-[#64748b]">Current Booking</p><p className="font-medium text-[#0f172a]">{treatment?.currentBookingId ? customId(String(treatment.currentBookingId), "BKG") : "-"}</p></div>
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-lg text-[#0f172a]">Invoice</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {invoice ? (
            <>
              <div className="flex items-center justify-between gap-3"><p className="text-[#64748b]">Invoice ID</p><p className="font-medium text-[#0f172a]">{customId(String(invoice._id), "INV")}</p></div>
              <div className="flex items-center justify-between gap-3"><p className="text-[#64748b]">Invoice Number</p><p className="font-medium text-[#0f172a]">{invoice.invoiceNumber || "-"}</p></div>
              <div className="flex items-center justify-between gap-3"><p className="text-[#64748b]">Invoice Date</p><p className="font-medium text-[#0f172a]">{formatDate(invoice.issuedAt)}</p></div>
              <Button asChild variant="outline" className="mt-2 w-full rounded-xl"><Link href={invoice?.invoiceUrl || "#"} target="_blank"><DownloadIcon className="size-4" />Download Invoice</Link></Button>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-center">
              <FileTextIcon className="mx-auto size-8 text-[#94a3b8]" />
              <p className="mt-3 text-sm font-medium text-[#0f172a]">No invoice generated</p>
              <Button variant="outline" className="mt-4 rounded-xl" disabled>Generate Invoice</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

const BookingsTable = ({ bookings, currency }) => (
  <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
    <CardHeader><CardTitle className="text-lg text-[#0f172a]">Bookings</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="hidden overflow-hidden rounded-2xl border border-[#e2e8f0] lg:block">
        <div className="overflow-x-auto" data-slot="table-container">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#f8fafc]">
              <TableRow>
                <TableHead>Booking ID</TableHead><TableHead>Appointment Date</TableHead><TableHead>Slot Time</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Base Price</TableHead><TableHead className="text-right">Total Amount</TableHead><TableHead>City</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <TableCell>{customId(String(booking._id), "BKG")}</TableCell>
                  <TableCell>{formatDate(booking.appointmentDate)}</TableCell>
                  <TableCell>{formatSlotTime(booking.slotTime)}</TableCell>
                  <TableCell><Badge variant={getStatusTone(booking.status)}>{booking.status || "-"}</Badge></TableCell>
                  <TableCell className="text-right">{formatCurrency(booking?.pricing?.basePrice || 0, currency || "INR")}</TableCell>
                  <TableCell className="text-right">{formatCurrency(booking?.pricing?.totalAmount || 0, currency || "INR")}</TableCell>
                  <TableCell>{booking?.city?.name || "-"}</TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 ? <TableRow><TableCell colSpan={7} className="py-8 text-center text-[#64748b]">No bookings linked with this ledger.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="grid gap-3 lg:hidden">
        {bookings.map((booking) => (
          <div key={booking._id} className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
            <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-[#0f172a]">{customId(String(booking._id), "BKG")}</p><Badge variant={getStatusTone(booking.status)}>{booking.status || "-"}</Badge></div>
            <p className="mt-2 text-xs text-[#64748b]">{formatDate(booking.appointmentDate)} • {formatSlotTime(booking.slotTime)}</p>
            <p className="mt-1 text-xs text-[#64748b]">City: {booking?.city?.name || "-"}</p>
            <p className="mt-2 text-sm text-[#0f172a]">{formatCurrency(booking?.pricing?.totalAmount || 0, currency || "INR")}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const TransactionsTimeline = ({ transactions, currency }) => (
  <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
    <CardHeader><CardTitle className="text-lg text-[#0f172a]">Transaction Timeline</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-center text-sm text-[#64748b]">No transactions recorded.</div>
      ) : (
        transactions.map((tx) => (
          <motion.div key={tx._id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.25 }} className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-[#ecfdf5] p-2 text-[#10b981]"><CircleDollarSignIcon className="size-4" /></div>
                <div><p className="text-sm font-semibold text-[#0f172a]">{tx.stage || "Payment"} Payment</p><p className="text-xs text-[#64748b]">{tx.method || "Unknown"} • {formatDateTime(tx.paidAt || tx.createdAt)}</p></div>
              </div>
              <div className="text-right"><p className="text-sm font-semibold text-[#0f172a]">{formatCurrency(tx.amountPaid, tx.currency || currency || "INR")}</p><Badge className="mt-1" variant={getStatusTone(tx.status)}>{tx.status || "-"}</Badge></div>
            </div>
          </motion.div>
        ))
      )}
    </CardContent>
  </Card>
);

const TransactionsTable = ({ transactions, currency }) => {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
      <CardHeader><CardTitle className="text-lg text-[#0f172a]">Transaction Details</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0]">
          <div className="overflow-x-auto" data-slot="table-container">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#f8fafc]">
                <TableRow>
                  <TableHead className="w-12" /><TableHead>ID</TableHead><TableHead>Method</TableHead><TableHead>Stage</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Paid At</TableHead><TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isOpen = expandedId === tx._id;
                  return (
                    <Fragment key={tx._id}>
                      <TableRow className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                        <TableCell><Button variant="ghost" size="icon" className="size-8" onClick={() => setExpandedId(isOpen ? null : tx._id)}>{isOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}</Button></TableCell>
                        <TableCell>{customId(String(tx._id), "TXN")}</TableCell>
                        <TableCell>{tx.method || "-"}</TableCell>
                        <TableCell>{tx.stage || "-"}</TableCell>
                        <TableCell><Badge variant={getStatusTone(tx.status)}>{tx.status || "-"}</Badge></TableCell>
                        <TableCell className="text-right">{formatCurrency(tx.amountPaid, tx.currency || currency || "INR")}</TableCell>
                        <TableCell>{formatDateTime(tx.paidAt)}</TableCell>
                        <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                      </TableRow>
                      {isOpen ? (
                        <TableRow className="bg-[#f8fafc]">
                          <TableCell colSpan={8}>
                            <div className="grid gap-2 p-2 text-xs text-[#334155] md:grid-cols-2 xl:grid-cols-3">
                              <p><span className="text-[#64748b]">Note:</span> {tx.note || "-"}</p>
                              <p><span className="text-[#64748b]">Collected By:</span> {tx?.collectedBy?.name || fullName(tx?.collectedBy) || tx?.collectedBy?.email || "-"}</p>
                              <p><span className="text-[#64748b]">Failure Reason:</span> {tx.failureReason || "-"}</p>
                              <p><span className="text-[#64748b]">Razorpay Order ID:</span> {tx.razorpayOrderId || "-"}</p>
                              <p><span className="text-[#64748b]">Razorpay Payment ID:</span> {tx.razorpayPaymentId || "-"}</p>
                              <p><span className="text-[#64748b]">Type:</span> {tx.type || "Charge"}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RefundsTable = ({ refunds, currency }) => {
  const [expandedId, setExpandedId] = useState(null);
  if (refunds.length === 0) {
    return (
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-lg text-[#0f172a]">Refunds</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-8 text-center">
            <RefreshCwIcon className="mx-auto size-8 text-[#a5b4fc]" />
            <p className="mt-3 text-sm font-medium text-[#0f172a]">No refunds processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
      <CardHeader><CardTitle className="text-lg text-[#0f172a]">Refund Management</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0]">
          <div className="overflow-x-auto" data-slot="table-container">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#f8fafc]">
                <TableRow>
                  <TableHead className="w-12" /><TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Refunded At</TableHead><TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => {
                  const isOpen = expandedId === refund._id;
                  return (
                    <Fragment key={refund._id}>
                      <TableRow className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                        <TableCell><Button variant="ghost" size="icon" className="size-8" onClick={() => setExpandedId(isOpen ? null : refund._id)}>{isOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}</Button></TableCell>
                        <TableCell>{customId(String(refund._id), "RFD")}</TableCell>
                        <TableCell>{refund.refundType || "-"}</TableCell>
                        <TableCell>{refund.mode || "-"}</TableCell>
                        <TableCell><Badge variant={getStatusTone(refund.status)}>{refund.status || "-"}</Badge></TableCell>
                        <TableCell className="text-right">{formatCurrency(refund.amount, currency || "INR")}</TableCell>
                        <TableCell>{formatDateTime(refund.refundedAt)}</TableCell>
                        <TableCell>{formatDateTime(refund.createdAt)}</TableCell>
                      </TableRow>
                      {isOpen ? (
                        <TableRow className="bg-[#f8fafc]">
                          <TableCell colSpan={8}>
                            <div className="grid gap-2 p-2 text-xs text-[#334155] md:grid-cols-2 xl:grid-cols-3">
                              <p><span className="text-[#64748b]">Reason:</span> {refund.reason || "-"}</p>
                              <p><span className="text-[#64748b]">Note:</span> {refund.note || "-"}</p>
                              <p><span className="text-[#64748b]">Approved By:</span> {refund?.approvedBy?.name || fullName(refund?.approvedBy) || refund?.approvedBy?.email || "-"}</p>
                              <p><span className="text-[#64748b]">Admin:</span> {refund?.adminId?.name || fullName(refund?.adminId) || refund?.adminId?.email || "-"}</p>
                              <p><span className="text-[#64748b]">Razorpay Refund ID:</span> {refund.razorpayRefundId || "-"}</p>
                              <p><span className="text-[#64748b]">Razorpay Payment ID:</span> {refund.razorpayPaymentId || "-"}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityTimeline = ({ timeline }) => (
  <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
    <CardHeader><CardTitle className="text-lg text-[#0f172a]">Activity Timeline</CardTitle></CardHeader>
    <CardContent>
      <div className="relative space-y-4 pl-2">
        <div className="absolute bottom-0 left-[17px] top-1 w-px bg-[#e2e8f0]" />
        {timeline.map((event, index) => {
          const Icon = getTimelineIcon(event.type);
          return (
            <motion.div key={`${event.type}-${index}-${event.timestamp}`} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.24 }} className="relative ml-7 rounded-2xl border border-[#e2e8f0] bg-white p-4">
              <div className="absolute -left-[30px] top-5 flex size-6 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#2563eb]"><Icon className="size-3.5" /></div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">{event.title || "Event"}</p>
                  <p className="mt-1 text-xs text-[#64748b]">{event.description || "-"}</p>
                  <p className="mt-1 text-xs text-[#94a3b8]">Actor: {event?.actor?.name || fullName(event?.actor) || event?.actor?.email || "System"}</p>
                </div>
                <p className="text-xs text-[#64748b]">{formatDateTime(event.timestamp)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

const PaymentInsightsSidebar = ({ ledger, paymentHealth, insights, canCollect, canRefund, canSettlement, canDispute }) => {
  const latestBooking = [...(ledger.bookingSummaries || [])]
    .filter((item) => item.appointmentDate)
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0];
  const settlement = ledger.settlementSummary || null;
  return (
    <div className="space-y-4 xl:sticky xl:top-[calc(var(--app-header-height)+1rem)]">
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Payment Health</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><p className="text-xs text-[#64748b]">Completion</p><p className="text-2xl font-bold text-[#0f172a]">{paymentHealth.completionPercentage}%</p></div>
          <div className="h-2 rounded-full bg-[#e2e8f0]"><div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${Math.min(paymentHealth.completionPercentage || 0, 100)}%` }} /></div>
          <div className="flex items-center justify-between"><p className="text-[#64748b]">Risk</p><Badge variant={paymentHealth.outstandingRisk === "High" ? "destructive" : paymentHealth.outstandingRisk === "Medium" ? "inprogress" : "success"}>{paymentHealth.outstandingRisk}</Badge></div>
          <div className="flex items-center justify-between"><p className="text-[#64748b]">Dues</p><p className="font-semibold text-[#0f172a]">{formatCurrency(paymentHealth.dues, ledger.currency || "INR")}</p></div>
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid gap-2">
          {canCollect ? <Button asChild variant="medico" className="justify-start rounded-xl"><Link href={`/admin/payments?tab=ledgers&search=${ledger._id}`}><HandCoinsIcon className="size-4" />Collect Payment</Link></Button> : null}
          {canRefund ? <Button asChild variant="outline" className="justify-start rounded-xl"><Link href={`/admin/payments?tab=ledgers&search=${ledger._id}`}>Process Refund</Link></Button> : null}
          {canSettlement ? <Button asChild variant="outline" className="justify-start rounded-xl"><Link href={`/admin/payments?tab=settlements&search=${ledger._id}`}>Start Settlement</Link></Button> : null}
          {canDispute ? <Button asChild variant="outline" className="justify-start rounded-xl"><Link href={`/admin/payments?tab=disputes&search=${ledger._id}`}>Raise Dispute</Link></Button> : null}
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Booking Snapshot</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-[#334155]">
          <p>Total Linked: <span className="font-semibold text-[#0f172a]">{(ledger.bookingSummaries || []).length}</span></p>
          <p>Latest Date: <span className="font-semibold text-[#0f172a]">{formatDate(latestBooking?.appointmentDate)}</span></p>
          <p>Latest City: <span className="font-semibold text-[#0f172a]">{latestBooking?.city?.name || "-"}</span></p>
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Settlement Status</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {settlement ? (
            <>
              <div className="flex items-center justify-between"><p className="text-[#64748b]">Status</p><Badge variant={getStatusTone(settlement.status)}>{settlement.status}</Badge></div>
              <div className="flex items-center justify-between"><p className="text-[#64748b]">Requested</p><p className="font-semibold text-[#0f172a]">{formatCurrency(settlement.amountRequested, ledger.currency || "INR")}</p></div>
            </>
          ) : <p className="text-sm text-[#64748b]">No settlement request yet.</p>}
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Audit Info</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-[#334155]">
          <p>Created: <span className="font-medium text-[#0f172a]">{formatDateTime(ledger.createdAt)}</span></p>
          <p>Updated: <span className="font-medium text-[#0f172a]">{formatDateTime(ledger.updatedAt)}</span></p>
          <p>Webhook: <span className="font-medium text-[#0f172a]">{ledger.lastWebhookEvent || "-"}</span></p>
        </CardContent>
      </Card>
      <Card className="rounded-[22px] border-white/50 bg-[rgba(255,255,255,0.88)]">
        <CardHeader><CardTitle className="text-base text-[#0f172a]">Insights</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {insights.map((insight) => <div key={insight} className="rounded-xl bg-[#f8fafc] p-3 text-sm text-[#334155]">{insight}</div>)}
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentLedgerDetailPage = () => {
  const params = useParams();
  const paymentId = params?.paymentId;

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/admin/payments/ledgers/${paymentId}`,
    queryKeys: ["admin-payments-ledger-detail", paymentId],
  });
  const ledger = data?.data || null;

  const ledgerData = ledger || {};
  const normalizedStatus = String(ledgerData.paymentStatus || "").toLowerCase();
  const canCollect = normalizedStatus === "unpaid" || normalizedStatus === "partially paid";
  const canRefund = ["paid", "partially paid", "partialrefund"].includes(normalizedStatus);
  const canSettlement = ["paid", "partialrefund"].includes(normalizedStatus);
  const canDispute = ["refunded", "partialrefund"].includes(normalizedStatus);

  const serviceName = ledgerData?.service?.name || "Healthcare Service";
  const paymentHealth = ledgerData?.paymentHealth || getHealthFallback(ledgerData);
  const timeline =
    ledgerData?.timeline?.length ? ledgerData.timeline : buildClientTimelineFallback(ledgerData);
  const insights = getInsights(ledgerData, paymentHealth);

  const transactions = useMemo(
    () =>
      [...(ledger?.transactions || [])].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [ledger?.transactions]
  );
  const refunds = useMemo(
    () =>
      [...(ledger?.refunds || [])].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [ledger?.refunds]
  );
  const bookings = useMemo(
    () =>
      [...(ledger?.bookingSummaries || [])].sort(
        (a, b) => new Date(b.appointmentDate || 0) - new Date(a.appointmentDate || 0)
      ),
    [ledger?.bookingSummaries]
  );

  if (isLoading) return <StateView type="loading" rows={8} />;
  if (error) {
    return (
      <StateView
        type="error"
        title="Unable to load payment ledger detail"
        description={error.message}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }
  if (!ledger) {
    return (
      <StateView
        type="empty"
        title="Payment ledger not found"
        actionLabel="Back to Payments"
        actionHref="/admin/payments"
      />
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden text-[#0f172a]">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <BackLink href="/admin/payments">
          <H1 className="text-base">
            Payments / Ledger / {customId(String(ledger._id), "PAY")}
          </H1>
        </BackLink>
        <span className="text-xs text-[#64748b]">
          Updated {formatDateTime(ledger.updatedAt)}
        </span>
      </div>

      <div className="relative">
        <PaymentLedgerHero ledger={ledger} serviceName={serviceName} canCollect={canCollect} canRefund={canRefund} canSettlement={canSettlement} canDispute={canDispute} />
        <div className="relative z-10 -mt-6 px-1">
          <FinancialAnalyticsStrip ledger={ledger} />
        </div>
      </div>
      <PaymentProgressTracker ledger={ledger} paymentHealth={paymentHealth} />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4 min-w-0">
          <BillBreakdownCard ledger={ledger} />
          <RelatedEntitiesGrid ledger={ledger} />
          <TreatmentInvoiceCard ledger={ledger} />
          <BookingsTable bookings={bookings} currency={ledger.currency} />
          <TransactionsTimeline transactions={transactions} currency={ledger.currency} />
          <TransactionsTable transactions={transactions} currency={ledger.currency} />
          <RefundsTable refunds={refunds} currency={ledger.currency} />
          <ActivityTimeline timeline={timeline} />
        </div>
        <div className="min-w-0">
          <PaymentInsightsSidebar ledger={ledger} paymentHealth={paymentHealth} insights={insights} canCollect={canCollect} canRefund={canRefund} canSettlement={canSettlement} canDispute={canDispute} />
        </div>
      </div>
    </div>
  );
};

export default PaymentLedgerDetailPage;
