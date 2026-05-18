"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Eye, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const formatSavedAt = (value) => {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not saved yet";
  return `Saved ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export function ServiceHeader({
  isDirty,
  isSubmitting,
  autosaveState,
  lastSavedAt,
  validationProgress,
  onSaveDraft,
  onPreview,
  onPublish,
}) {
  const syncLabel =
    autosaveState === "saving"
      ? "Syncing draft..."
      : autosaveState === "saved"
        ? formatSavedAt(lastSavedAt)
        : autosaveState === "error"
          ? "Draft save failed"
          : isDirty
            ? "Unsaved changes"
            : "All changes synced";

  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-[var(--sticky-offset-workspace)] z-30 rounded-[22px] border border-white/65 bg-white/80 p-4 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)] backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <Link href="/admin/services" className="inline-flex items-center gap-1 text-[#1d4ed8] hover:text-[#1e40af]">
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
            <span>/</span>
            <span>Services</span>
            <span>/</span>
            <span className="text-[#0f172a]">Create Workspace</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#0f172a] md:text-xl">Create Service Workspace</h1>
            <Badge className="rounded-full bg-amber-100 text-amber-700">Draft</Badge>
            {isDirty ? (
              <Badge className="rounded-full bg-rose-100 text-rose-700">Unsaved</Badge>
            ) : (
              <Badge className="rounded-full bg-emerald-100 text-emerald-700">Synced</Badge>
            )}
          </div>
          <p className="text-xs text-[#64748b]">{syncLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onPreview}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onSaveDraft}>
            <Save className="size-4" />
            Save Draft
          </Button>
          <Button type="button" variant="medico" size="sm" onClick={onPublish} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Publish
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#e2e8f0] bg-white/90 p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-[#334155]">Validation Progress</span>
          <span className="text-[#64748b]">{Math.round(validationProgress)}%</span>
        </div>
        <Progress value={validationProgress} className="h-2 bg-[#dbeafe]" />
      </div>
    </motion.header>
  );
}

