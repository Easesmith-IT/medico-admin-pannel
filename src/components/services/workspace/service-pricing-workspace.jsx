"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));

const AnimatedValue = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = toNumber(value);
    const started = performance.now();
    const duration = 500;
    let frameId = 0;

    const step = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      setDisplay(target * progress);
      if (progress < 1) frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <>{formatCurrency(display)}</>;
};

export function ServicePricingWorkspace({ form }) {
  const basePrice = toNumber(form.watch("basePrice"));
  const equipmentCharges = toNumber(form.watch("equipmentCharges"));
  const taxPercentage = toNumber(form.watch("taxPercentage"));
  const subtotal = basePrice + equipmentCharges;
  const taxAmount = (subtotal * taxPercentage) / 100;
  const estimatedTotal = subtotal + taxAmount;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-[22px] border border-[#dbe4f8] bg-white/85 p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]"
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Section 3</p>
        <h3 className="text-lg font-semibold text-[#0f172a]">Pricing & Billing</h3>
        <p className="text-sm text-[#64748b]">Configure billing components with a real-time financial preview.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    className="h-11"
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormDescription>Core consultation/service price.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="equipmentCharges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment Charges</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    className="h-11"
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormDescription>Optional add-on equipment amount.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxPercentage"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Tax Percentage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="h-11"
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormDescription>Applies on base + equipment subtotal.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1d4ed8]">
            <IndianRupee className="size-3.5" />
            Live Estimate
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#475569]">Subtotal</span>
              <span className="font-semibold text-[#0f172a]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#475569]">Tax Amount</span>
              <span className="font-semibold text-[#0f172a]">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="border-t border-[#bfdbfe] pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[#1e40af]">Estimated Total</span>
                <span className="text-lg font-bold text-[#1d4ed8]">
                  <AnimatedValue value={estimatedTotal} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

