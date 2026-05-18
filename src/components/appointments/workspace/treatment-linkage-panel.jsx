"use client";

import { Activity, CalendarRange, Link2, Sparkles } from "lucide-react";

import { TREATMENT_LINK_TYPES } from "@/constants/appointment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export function TreatmentLinkagePanel({
  control,
  treatmentOptions = [],
  selectedTreatment,
  treatmentLinkType = "existing",
}) {
  return (
    <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <CardHeader>
        <CardTitle className="text-base text-[#0F172A]">Treatment Linkage Workspace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="treatmentLinkType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose linkage mode</FormLabel>
              <FormControl>
                <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2 md:grid-cols-3">
                  {TREATMENT_LINK_TYPES.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm">
                      <RadioGroupItem value={option.value} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="treatmentSelection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Existing treatment</FormLabel>
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
                disabled={treatmentLinkType !== "existing"}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {treatmentOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {treatmentLinkType === "existing" && selectedTreatment ? (
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3">
            <p className="text-sm font-semibold text-[#0F172A]">Linked Treatment Intelligence</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm">
              <Info label="Status" value={selectedTreatment.status || "-"} />
              <Info label="Sessions" value={selectedTreatment.sessionsCount || 0} />
              <Info label="Valid Till" value={formatDate(selectedTreatment.validTill)} />
              <Info label="Current Booking" value={selectedTreatment.currentBookingId ? "Linked" : "Not linked"} />
            </div>
            <Badge className="mt-2 rounded-full border border-[#93C5FD] bg-white text-[#1D4ED8]">
              <Link2 className="mr-1 h-3 w-3" />
              This booking becomes Session #{Number(selectedTreatment.sessionsCount || 0) + 1}
            </Badge>
          </div>
        ) : null}

        {treatmentLinkType === "new" ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-[#334155]">
            <p className="font-semibold text-[#0F172A]">System-Generated Treatment Preview</p>
            <ul className="mt-2 space-y-1">
              <li className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />Treatment will auto-create with status Active.</li>
              <li className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-[#2563EB]" />Session count starts from 1 and links this booking.</li>
              <li className="flex items-center gap-2"><CalendarRange className="h-3.5 w-3.5 text-[#2563EB]" />Validity and lifecycle are managed by treatment workflow.</li>
            </ul>
          </div>
        ) : null}

        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-3 text-sm">
          <p className="font-semibold text-[#0F172A]">System Managed Workflow</p>
          <p className="mt-1 text-[#64748B]">
            Non-editable fields managed by platform: sessionNumber, booking initial status, currentBookingId, lastBookingAt,
            lifecycle completion flags, invoice generation and payment stage transitions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-[#DCE6F8] bg-white px-2 py-1.5">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#64748B]">{label}</p>
      <p className="font-semibold text-[#0F172A]">{value}</p>
    </div>
  );
}
