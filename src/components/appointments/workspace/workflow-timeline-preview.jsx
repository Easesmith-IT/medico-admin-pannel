"use client";

import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  "Booking Created",
  "Provider Assigned",
  "Session Starts",
  "Treatment Updated",
  "Invoice Generated",
  "Payment Collected",
];

export function WorkflowTimelinePreview({ currentStep = 1 }) {
  return (
    <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90">
      <CardHeader>
        <CardTitle className="text-sm text-[#0F172A]">Workflow Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {STEPS.map((step, index) => {
          const done = index < currentStep;
          return (
            <div key={step} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-sm">
              <CheckCircle2 className={`h-4 w-4 ${done ? "text-emerald-600" : "text-slate-300"}`} />
              <span className={done ? "text-[#0F172A]" : "text-[#64748B]"}>{step}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
