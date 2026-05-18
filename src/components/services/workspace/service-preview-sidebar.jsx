"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = toNumber(value);
    const duration = 500;
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(target * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{toCurrency(display)}</>;
};

const PreviewCard = ({ values }) => {
  const subtotal = toNumber(values.basePrice) + toNumber(values.equipmentCharges);
  const taxAmount = (subtotal * toNumber(values.taxPercentage)) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-4 rounded-[22px] border border-[#dbe4f8] bg-white/85 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]">
      <div className="rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#162a4d] to-[#1d4ed8] p-4 text-white">
        <p className="text-xs uppercase tracking-[0.14em] text-[#bfdbfe]">Live Service Preview</p>
        <h3 className="mt-2 text-xl font-semibold">{values.name || "Untitled Service"}</h3>
        <p className="mt-1 text-xs text-[#dbeafe]">{values.description || "Description will appear here after input."}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {values.category ? <Badge className="rounded-full bg-white/20 text-white">{values.category}</Badge> : null}
          <Badge className="rounded-full bg-emerald-400/20 text-emerald-100">Draft</Badge>
          {(values.modes || []).slice(0, 2).map((mode) => (
            <Badge key={mode} className="rounded-full bg-white/15 text-white">{mode}</Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-2">
          <p className="text-xs text-[#64748b]">Cities</p>
          <p className="font-semibold text-[#0f172a]">{(values.cities || []).length}</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-2">
          <p className="text-xs text-[#64748b]">Default Duration</p>
          <p className="font-semibold text-[#0f172a]">{values.defaultDuration || "-"} mins</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[#1d4ed8]">Estimated Booking Card</p>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#475569]">Subtotal</span>
            <span className="font-medium text-[#0f172a]">{toCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#475569]">Tax</span>
            <span className="font-medium text-[#0f172a]">{toCurrency(taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#bfdbfe] pt-1">
            <span className="text-[#1d4ed8]">Total</span>
            <span className="text-lg font-bold text-[#1d4ed8]">
              <AnimatedNumber value={total} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ServicePreviewSidebar({ values, open, onOpenChange }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] rounded-t-[24px] border border-[#dbe4f8]">
          <DrawerHeader>
            <DrawerTitle>Service Preview</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-4">
            <PreviewCard values={values} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <motion.aside initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="sticky top-[var(--sticky-offset-sidebar)]">
      <PreviewCard values={values} />
    </motion.aside>
  );
}
