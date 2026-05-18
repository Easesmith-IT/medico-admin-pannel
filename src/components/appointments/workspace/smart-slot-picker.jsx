"use client";

import { motion } from "framer-motion";
import { Clock3, Users } from "lucide-react";

import { SLOT_PERIOD_ORDER } from "@/constants/appointment";
import { Badge } from "@/components/ui/badge";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const riskTone = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
};

export function SmartSlotPicker({ control, groupedSlots = {}, onSelectSlot }) {
  return (
    <div className="rounded-2xl border border-[#DBEAFE] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <div className="mb-3">
        <p className="text-base font-semibold text-[#0F172A]">Intelligent Scheduling Grid</p>
        <p className="text-sm text-[#64748B]">Choose slots by period with provider/risk signals.</p>
      </div>

      <FormField
        control={control}
        name="startTime"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Available slots</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {SLOT_PERIOD_ORDER.map((period) => {
                  const slots = groupedSlots[period] || [];
                  return (
                    <div key={period}>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="rounded-full border border-[#CBD5E1] bg-white text-[#334155]">{period}</Badge>
                        <span className="text-xs text-[#64748B]">{slots.length} slots</span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {slots.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">
                            No slots in this period.
                          </div>
                        ) : (
                          slots.map((slot) => {
                            const active = field.value === slot.startTime;
                            return (
                              <motion.button
                                key={`${period}-${slot.startTime}`}
                                type="button"
                                whileHover={{ y: -1 }}
                                onClick={() => {
                                  field.onChange(slot.startTime);
                                  onSelectSlot?.(slot);
                                }}
                                className={cn(
                                  "rounded-xl border p-3 text-left transition-all",
                                  slot.available ? "bg-white" : "bg-slate-100 opacity-60",
                                  active ? "border-[#2563EB] shadow-[0_0_0_2px_rgba(37,99,235,0.2)]" : "border-[#E2E8F0]"
                                )}
                                disabled={!slot.available}
                              >
                                <p className="text-sm font-semibold text-[#0F172A]">{slot.startTime} - {slot.endTime}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                                  <Badge className={cn("rounded-full border", riskTone[slot.risk] || riskTone.medium)}>
                                    {slot.risk} risk
                                  </Badge>
                                  <Badge className="rounded-full border border-[#CBD5E1] bg-white text-[#334155]">
                                    <Users className="mr-1 h-3 w-3" />
                                    {slot.providerCount}
                                  </Badge>
                                  <Badge className="rounded-full border border-[#CBD5E1] bg-white text-[#334155]">
                                    <Clock3 className="mr-1 h-3 w-3" />
                                    wait {slot.estimatedWait}m
                                  </Badge>
                                </div>
                              </motion.button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="endTime"
        render={({ field }) => (
          <input type="hidden" value={field.value || ""} readOnly />
        )}
      />
    </div>
  );
}
