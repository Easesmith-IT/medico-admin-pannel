"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import MultiSelect from "@/components/shared/MultiSelect";
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

const MODE_OPTIONS = [
  {
    value: "Home Service",
    label: "Home Service",
    description: "Provider travels to patient location.",
    comingSoon: false,
  },
  {
    value: "Visit Provider Location",
    label: "Visit Provider",
    description: "Patient visits clinic or provider facility.",
    comingSoon: false,
  },
  {
    value: "Teleconsultation",
    label: "Teleconsultation",
    description: "Virtual care mode reserved for future rollout.",
    comingSoon: true,
  },
];

export function ServiceModeSelector({
  form,
  cityOptions,
  isCityLoading,
  cityError,
  onRetryCities,
}) {
  const selectedModes = form.watch("modes") || [];
  const cityCount = (form.watch("cities") || []).length;
  const category = form.watch("category");
  const nursingAlwaysOn = form.watch("nursingSlots.available24x7");
  const equipmentAlwaysOn = form.watch("equipmentBooking.available24x7");

  const isAlwaysAvailable = category === "nursing" ? nursingAlwaysOn : equipmentAlwaysOn;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-[22px] border border-[#dbe4f8] bg-white/85 p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]"
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Section 2</p>
        <h3 className="text-lg font-semibold text-[#0f172a]">Service Modes & Delivery</h3>
        <p className="text-sm text-[#64748b]">Configure where and how this service gets delivered.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {MODE_OPTIONS.map((mode) => {
          const active = selectedModes.includes(mode.value);
          return (
            <button
              key={mode.value}
              type="button"
              disabled={mode.comingSoon}
              onClick={() => {
                if (mode.comingSoon) return;
                if (active) {
                  form.setValue(
                    "modes",
                    selectedModes.filter((item) => item !== mode.value),
                    { shouldDirty: true, shouldValidate: true },
                  );
                  return;
                }
                form.setValue("modes", [...selectedModes, mode.value], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              className={[
                "rounded-2xl border p-4 text-left transition-all",
                mode.comingSoon
                  ? "cursor-not-allowed border-dashed border-slate-300 bg-slate-50 text-slate-500"
                  : active
                    ? "border-[#3b82f6] bg-[#dbeafe] shadow-[0_10px_26px_rgb(37_99_235_/_0.15)]"
                    : "border-[#e2e8f0] bg-white hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgb(15_23_42_/_0.08)]",
              ].join(" ")}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0f172a]">{mode.label}</p>
                {mode.comingSoon ? (
                  <Badge className="rounded-full bg-slate-200 text-slate-700">Soon</Badge>
                ) : active ? (
                  <Badge className="rounded-full bg-blue-600 text-white">Selected</Badge>
                ) : null}
              </div>
              <p className="text-xs text-[#64748b]">{mode.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="paymentMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Mode</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 bg-white">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Both">Both</SelectItem>
                  <SelectItem value="Prepaid">Prepaid</SelectItem>
                  <SelectItem value="Postpaid">Postpaid</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Available 24x7</FormLabel>
          <div className="flex h-11 items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3">
            <p className="text-sm text-[#334155]">Always-on availability signal</p>
            <Switch
              checked={Boolean(isAlwaysAvailable)}
              disabled={category !== "nursing" && category !== "equipment"}
              onCheckedChange={(value) => {
                if (category === "nursing") {
                  form.setValue("nursingSlots.available24x7", value, { shouldDirty: true });
                }
                if (category === "equipment") {
                  form.setValue("equipmentBooking.available24x7", value, { shouldDirty: true });
                }
              }}
            />
          </div>
        </FormItem>

        <FormField
          control={form.control}
          name="cities"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <FormLabel>Cities</FormLabel>
                <Badge className="rounded-full bg-[#dbeafe] text-[#1d4ed8]">{cityCount} selected</Badge>
              </div>
              {isCityLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-2/3 rounded-xl" />
                </div>
              ) : (
                <FormControl>
                  <MultiSelect
                    label="Search and select cities"
                    options={cityOptions}
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
              )}
              {cityError ? (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <span>Unable to load city options.</span>
                  <Button type="button" size="sm" variant="outline" onClick={onRetryCities}>
                    Retry
                  </Button>
                </div>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.section>
  );
}
