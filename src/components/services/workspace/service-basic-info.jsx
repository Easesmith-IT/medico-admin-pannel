"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
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

const CATEGORY_OPTIONS = [
  { value: "consultation", label: "Consultation" },
  { value: "nursing", label: "Nursing" },
  { value: "equipment", label: "Equipment" },
];

export function ServiceBasicInfo({ form, duplicateName }) {
  const name = form.watch("name");
  const description = form.watch("description");
  const category = form.watch("category");

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-[24px] border border-white/70 bg-gradient-to-br from-[#0f172a] via-[#162a4d] to-[#1d4ed8] p-5 text-white shadow-[0_20px_42px_rgb(15_23_42_/_0.24)]"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#bfdbfe]">Section 1</p>
          <h2 className="text-xl font-semibold tracking-tight">Basic Service Identity</h2>
          <p className="text-sm text-[#dbeafe]">Define the operational identity of this service.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {category ? (
            <Badge className="rounded-full bg-white/15 text-white">{CATEGORY_OPTIONS.find((item) => item.value === category)?.label}</Badge>
          ) : null}
          <Badge className="rounded-full bg-emerald-400/20 text-emerald-100">Status: New</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-white">Service Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Home ICU Nursing"
                  className="h-12 border-white/30 bg-white/10 text-white placeholder:text-slate-300"
                  {...field}
                />
              </FormControl>
              <div className="flex items-center justify-between text-xs text-slate-200">
                <FormDescription className="text-slate-200">
                  This appears across service listings and booking flows.
                </FormDescription>
                <span>{(name || "").length}/80</span>
              </div>
              {duplicateName ? (
                <p className="text-xs text-amber-200">A service with this name already exists.</p>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-11 border-white/30 bg-white/10 text-white">
                    <SelectValue placeholder="Select service category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Time Format</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-11 border-white/30 bg-white/10 text-white">
                    <SelectValue placeholder="Choose time format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="12-hour">12 Hour</SelectItem>
                  <SelectItem value="24-hour">24 Hour</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {category === "nursing" ? (
          <FormField
            control={form.control}
            name="nursingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Nursing Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="h-11 border-white/30 bg-white/10 text-white">
                      <SelectValue placeholder="Select nursing type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="full-day">Full Day</SelectItem>
                    <SelectItem value="full-night">Full Night</SelectItem>
                    <SelectItem value="12-hour">12 Hour</SelectItem>
                    <SelectItem value="24-hour">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-white">Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Describe the care workflow and value proposition for this service..."
                  className="resize-none border-white/30 bg-white/10 text-white placeholder:text-slate-300"
                  {...field}
                />
              </FormControl>
              <div className="flex items-center justify-between text-xs text-slate-200">
                <FormDescription className="text-slate-200">
                  Keep it operationally clear for onboarding, billing, and booking teams.
                </FormDescription>
                <span>{(description || "").length}/400</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.section>
  );
}

