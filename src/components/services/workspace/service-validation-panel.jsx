"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function ServiceValidationPanel({ checks = [] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-[22px] border border-[#dbe4f8] bg-white/85 p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]"
    >
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Section 8</p>
        <h3 className="text-lg font-semibold text-[#0f172a]">Review & Validation</h3>
        <p className="text-sm text-[#64748b]">Resolve warnings before publishing the service.</p>
      </div>

      <div className="grid gap-2">
        {checks.map((check) => (
          <div
            key={check.key}
            className={[
              "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
              check.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-800",
            ].join(" ")}
          >
            {check.ok ? <CheckCircle2 className="mt-0.5 size-4" /> : <AlertTriangle className="mt-0.5 size-4" />}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

