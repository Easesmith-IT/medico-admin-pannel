"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BookingImpactPreview({ impact = {}, warnings = [] }) {
  return (
    <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <CardHeader>
        <CardTitle className="text-base text-[#0F172A]">Booking Impact Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <PreviewRow label="Booking Status" value={impact.bookingStatus || "Approved (System)"} />
        <PreviewRow label="Session Number" value={impact.sessionNumber || "Auto-generated"} />
        <PreviewRow label="Treatment Link Result" value={impact.treatmentResult || "Will be resolved at create"} />
        <PreviewRow label="Provider Assignment" value={impact.providerResult || "Optional/Selected"} />
        <PreviewRow label="Expected Payment Stage" value={impact.paymentStage || "Advance/Final"} />

        <div className="rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] p-3 text-[#166534]">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em]">Operational outcomes</p>
          {(impact.outcomes || []).map((item, index) => (
            <p className="flex items-start gap-1" key={`${item}-${index}`}>
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5" />
              <span>{item}</span>
            </p>
          ))}
        </div>

        {warnings.length ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em]">Warnings</p>
            {warnings.map((warning, index) => (
              <p className="flex items-start gap-1" key={`${warning}-${index}`}>
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                <span>{warning}</span>
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2">
      <p className="text-xs uppercase tracking-[0.08em] text-[#64748B]">{label}</p>
      <p className="text-right font-medium text-[#0F172A]">{value}</p>
    </div>
  );
}
