"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const toCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export function PaymentPreviewSidebar({ pricing = {} }) {
  return (
    <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90">
      <CardHeader>
        <CardTitle className="text-sm text-[#0F172A]">Payment Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Metric label="Base" value={toCurrency(pricing.base)} />
        <Metric label="Tax" value={toCurrency(pricing.tax)} />
        <Metric label="Equipment" value={toCurrency(pricing.equipment)} />
        <Metric label="Discount" value={toCurrency(pricing.discount)} />
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-2">
          <p className="text-xs uppercase tracking-[0.08em] text-[#1D4ED8]">Total</p>
          <motion.p key={pricing.total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-lg font-semibold text-[#1D4ED8]">
            {toCurrency(pricing.total)}
          </motion.p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5">
      <span className="text-xs text-[#64748B]">{label}</span>
      <span className="font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}
