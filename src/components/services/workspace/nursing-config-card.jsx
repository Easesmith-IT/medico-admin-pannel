"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const SHIFT_PRESETS = [
  { label: "Hourly", value: "hourly" },
  { label: "8 Hour", value: "8-hour" },
  { label: "12 Hour", value: "12-hour" },
  { label: "24 Hour", value: "24-hour" },
  { label: "Day Shift", value: "day-shift" },
  { label: "Night Shift", value: "night-shift" },
];

export function NursingConfigCard({ form }) {
  const shiftTypes = form.watch("nursingSlots.shiftTypes") || [];
  const maxDuration = Number(form.watch("nursingSlots.maxDuration") || 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-[#dbe4f8] bg-white/85 p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]"
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Section 4B</p>
        <h3 className="text-lg font-semibold text-[#0f172a]">Nursing Shift Builder</h3>
        <p className="text-sm text-[#64748b]">Configure coverage presets and nursing duration boundaries.</p>
      </div>

      <FormField
        control={form.control}
        name="nursingSlots.shiftTypes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Shift Types</FormLabel>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SHIFT_PRESETS.map((preset) => {
                const active = (field.value || []).includes(preset.value);
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? (field.value || []).filter((item) => item !== preset.value)
                        : [...(field.value || []), preset.value];
                      field.onChange(next);
                    }}
                    className={[
                      "rounded-xl border px-3 py-2 text-left text-sm transition-all",
                      active
                        ? "border-[#3b82f6] bg-[#dbeafe] text-[#1e40af]"
                        : "border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc]",
                    ].join(" ")}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <FormDescription>Select one or more shift presets.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="nursingSlots.minDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Duration (mins)</FormLabel>
              <FormControl>
                <Input type="number" min={1} className="h-11" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nursingSlots.maxDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Duration (mins)</FormLabel>
              <FormControl>
                <Input type="number" min={1} className="h-11" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nursingSlots.allowCustomDuration"
          render={({ field }) => (
            <FormItem className="rounded-xl border border-[#e2e8f0] bg-white p-3">
              <div className="flex items-center justify-between">
                <FormLabel>Custom Duration</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FormField
          control={form.control}
          name="nursingSlots.available24x7"
          render={({ field }) => (
            <FormItem className="rounded-xl border border-[#e2e8f0] bg-white p-3">
              <div className="flex items-center justify-between">
                <FormLabel>Available 24x7</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-[#1d4ed8]">Coverage Summary</p>
          <p className="mt-1 text-sm text-[#1e3a8a]">
            {maxDuration > 0
              ? `Supports continuous nursing coverage up to ${(maxDuration / 1440).toFixed(1)} day(s).`
              : "Configure max duration to generate a nursing coverage summary."}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {shiftTypes.length > 0 ? shiftTypes.map((shift) => <Badge key={shift} className="rounded-full bg-white text-[#1e3a8a]">{shift}</Badge>) : null}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

