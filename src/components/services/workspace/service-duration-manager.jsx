"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export function ServiceDurationManager({ form }) {
  const supportsDuration = form.watch("supportsDuration");
  const selectedDurations = form.watch("durationOptions") || [];
  const defaultDuration = Number(form.watch("defaultDuration") || 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-[22px] border border-[#dbe4f8] bg-white/85 p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Section 5</p>
          <h3 className="text-lg font-semibold text-[#0f172a]">Duration System</h3>
          <p className="text-sm text-[#64748b]">Control default and allowed service durations.</p>
        </div>
        <FormField
          control={form.control}
          name="supportsDuration"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2">
              <FormLabel className="text-sm">Supports Duration</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {supportsDuration ? (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="durationOptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allowed Durations</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((duration) => {
                    const active = (field.value || []).includes(duration);
                    return (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => {
                          const existing = field.value || [];
                          const next = existing.includes(duration)
                            ? existing.filter((item) => item !== duration)
                            : [...existing, duration].sort((a, b) => a - b);
                          field.onChange(next);
                        }}
                        className={[
                          "rounded-full border px-3 py-1 text-sm transition-all",
                          active
                            ? "border-[#2563eb] bg-[#dbeafe] text-[#1d4ed8]"
                            : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
                        ].join(" ")}
                      >
                        {duration} mins
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defaultDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Duration</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {selectedDurations.length > 0 ? (
                    selectedDurations.map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => field.onChange(duration)}
                        className={[
                          "rounded-full border px-3 py-1 text-sm transition-all",
                          Number(duration) === defaultDuration
                            ? "border-[#2563eb] bg-[#2563eb] text-white"
                            : "border-[#e2e8f0] bg-white text-[#475569]",
                        ].join(" ")}
                      >
                        {duration} mins
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-[#94a3b8]">Select duration options first.</p>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3 text-sm text-[#1e3a8a]">
            <p className="font-medium">Recommendation</p>
            <p className="mt-1">
              {selectedDurations.length <= 1
                ? "Add at least two duration options for better booking flexibility."
                : "Balanced duration mix detected for a guided booking experience."}
            </p>
            {defaultDuration > 0 ? (
              <Badge className="mt-2 rounded-full bg-white text-[#1d4ed8]">Default: {defaultDuration} mins</Badge>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
          Duration system is disabled for this service.
        </div>
      )}
    </motion.section>
  );
}

