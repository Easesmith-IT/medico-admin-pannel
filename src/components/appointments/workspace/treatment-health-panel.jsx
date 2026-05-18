"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function TreatmentHealthPanel({ health = {} }) {
  return (
    <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90">
      <CardHeader>
        <CardTitle className="text-sm text-[#0F172A]">Treatment Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Line label="Completed Sessions" value={`${health.completed || 0}/${health.total || 0}`} />
        <Line label="Pending Sessions" value={health.pending || 0} />
        <Line label="Expiry Risk" value={health.expiryRisk || "Stable"} />
        <Line label="Adherence" value={`${health.adherence || 0}%`} />
        <Progress value={health.adherence || 0} className="h-2 bg-[#DBEAFE]" />
      </CardContent>
    </Card>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5">
      <span className="text-xs text-[#64748B]">{label}</span>
      <span className="font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}
