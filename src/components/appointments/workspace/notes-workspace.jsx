"use client";

import { AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const templates = [
  "Patient requested morning slot due to medication schedule.",
  "Carry previous treatment reports and current prescription.",
  "High urgency follow-up requested by clinician.",
];

export function NotesWorkspace({ control, onInjectTemplate }) {
  return (
    <div className="rounded-2xl border border-[#DBEAFE] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <p className="text-base font-semibold text-[#0F172A]">Operational Notes Workspace</p>
      <p className="mb-3 text-sm text-[#64748B]">Internal notes, patient instructions, urgency flags, and operational tags.</p>

      <div className="grid gap-3 md:grid-cols-2">
        <FormField
          control={control}
          name="urgency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urgency</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Priority">Priority</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="internalTag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operational Tag</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="first_visit">First Visit</SelectItem>
                  <SelectItem value="payment_sensitive">Payment Sensitive</SelectItem>
                  <SelectItem value="risk_watch">Risk Watch</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template}
            type="button"
            className="rounded-full border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs text-[#334155] hover:border-[#93C5FD]"
            onClick={() => onInjectTemplate?.(template)}
          >
            + Template
          </button>
        ))}
      </div>

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem className="mt-3">
            <FormLabel>Instructions and internal notes</FormLabel>
            <FormControl>
              <Textarea rows={4} className="resize-none" placeholder="Capture workflow notes, patient instructions, and escalation context." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Badge className="mt-3 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
        <AlertCircle className="mr-1 h-3 w-3" />
        Notes are visible to operations and care teams.
      </Badge>
    </div>
  );
}
