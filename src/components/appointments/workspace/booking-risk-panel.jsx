"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BookingRiskPanel({ risks = [] }) {
  const high = risks.filter((item) => item.level === "high");

  return (
    <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90">
      <CardHeader>
        <CardTitle className="text-sm text-[#0F172A]">Booking Risk Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge className={high.length ? "rounded-full border border-rose-200 bg-rose-50 text-rose-700" : "rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"}>
            {high.length ? <AlertTriangle className="mr-1 h-3 w-3" /> : <ShieldCheck className="mr-1 h-3 w-3" />}
            {high.length ? `${high.length} high risk` : "Risk stable"}
          </Badge>
        </div>
        {risks.map((risk) => (
          <div key={risk.key} className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">{risk.key}</p>
            <p className="text-sm text-[#0F172A]">{risk.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
