"use client";

import { motion } from "framer-motion";
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

export function EquipmentConfigCard({ form }) {
  const minDuration = Number(form.watch("equipmentBooking.minDuration") || 0);
  const maxDuration = Number(form.watch("equipmentBooking.maxDuration") || 0);
  const range = Math.max(maxDuration - minDuration, 0);
  const progress = maxDuration > 0 ? Math.min((range / maxDuration) * 100, 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-[#dbe4f8] bg-white/85 p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]"
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Section 4C</p>
        <h3 className="text-lg font-semibold text-[#0f172a]">Equipment Configuration</h3>
        <p className="text-sm text-[#64748b]">Configure rental-duration boundaries and equipment availability.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="equipmentBooking.minDuration"
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
          name="equipmentBooking.maxDuration"
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
          name="equipmentBooking.available24x7"
          render={({ field }) => (
            <FormItem className="rounded-xl border border-[#e2e8f0] bg-white p-3">
              <div className="flex items-center justify-between">
                <FormLabel>Available 24x7</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormDescription>Used in service preview and discoverability.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[#1d4ed8]">Rental Duration Visualizer</p>
        <div className="mt-2 h-2 w-full rounded-full bg-[#dbeafe]">
          <div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-[#1e3a8a]">
          Current rental window: {minDuration || 0} to {maxDuration || 0} minutes.
        </p>
      </div>
    </motion.section>
  );
}

