import { tokens } from "@/styles/tokens";

export const statusTheme = {
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
  Completed: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  Active: "border-green-200 bg-green-50 text-green-700",
  Inactive: "border-slate-200 bg-slate-100 text-slate-600",
  "In Progress": "border-yellow-200 bg-yellow-50 text-yellow-700",
  Paid: "border-teal-200 bg-teal-50 text-teal-700",
  Refunded: "border-violet-200 bg-violet-50 text-violet-700",
} as const;

export const adminTheme = {
  shell: "bg-[#F5F7FB] text-[#0F172A]",
  pageContainer: "mx-auto w-full max-w-[1440px] min-w-0",
  surface: "rounded-[18px] border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_22px_rgb(15_23_42_/_0.06)]",
  glass: "rounded-[18px] border border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_10px_28px_rgb(15_23_42_/_0.08)]",
  sectionTitle: tokens.typography.sectionTitle,
  metaLabel: tokens.typography.metadata,
};
