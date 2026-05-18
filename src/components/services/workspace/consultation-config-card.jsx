"use client";

import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SLOT_OPTIONS = ["15", "30", "45", "60"];

const parseTime = (value) => {
  const [hour, minute] = String(value || "")
    .split(":")
    .map((part) => Number(part));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
};

export function ConsultationConfigCard({ form }) {
  const startTime = form.watch("consultationSlots.startTime");
  const endTime = form.watch("consultationSlots.endTime");
  const duration = Number(form.watch("consultationSlots.slotDuration") || 30);
  const enabled = form.watch("consultationSlots.enabled");

  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  const validRange = Number.isFinite(startMinutes) && Number.isFinite(endMinutes) && endMinutes > startMinutes;
  const slotsPerDay = validRange ? Math.floor((endMinutes - startMinutes) / duration) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-[#dbe4f8] bg-white/85 p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]"
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Section 4A</p>
        <h3 className="text-lg font-semibold text-[#0f172a]">Consultation Configuration</h3>
        <p className="text-sm text-[#64748b]">Enable consultation windows and slot orchestration.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <FormField
          control={form.control}
          name="consultationSlots.enabled"
          render={({ field }) => (
            <FormItem className="rounded-xl border border-[#e2e8f0] bg-white p-3 md:col-span-4">
              <div className="flex items-center justify-between">
                <FormLabel>Consultation Enabled</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consultationSlots.startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input type="time" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consultationSlots.endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input type="time" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consultationSlots.slotDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slot Duration</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || "")}>
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SLOT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} mins
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1d4ed8]">Slot Timeline Preview</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-[#1e3a8a]">
          <Clock3 className="size-4" />
          <span>
            {startTime || "09:00"} | {duration}m | {duration}m | {duration}m | {endTime || "19:00"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Badge className="rounded-full bg-[#dbeafe] text-[#1d4ed8]">
            {enabled && slotsPerDay > 0 ? `${slotsPerDay} slots generated/day` : "Set time range to generate slots"}
          </Badge>
        </div>
      </div>
    </motion.section>
  );
}

