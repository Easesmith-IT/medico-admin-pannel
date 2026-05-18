"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BrainCircuit, Loader2, Save } from "lucide-react";

import { InlineSyncIndicator } from "@/components/loading/sync-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stateMap = {
  idle: { state: "idle", label: "Idle" },
  saving: { state: "syncing", label: "Autosaving draft" },
  saved: { state: "success", label: "Draft synced" },
  error: { state: "failed", label: "Draft sync failed" },
};

export function AppointmentWorkspaceHeader({
  autosaveState = "idle",
  validationProgress = 0,
  isSubmitting = false,
  onSaveDraft,
  onCreate,
  backHref = "/admin/appointments",
}) {
  const sync = stateMap[autosaveState] || stateMap.idle;

  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-[var(--sticky-offset-workspace)] z-30 rounded-[24px] border border-white/60 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Link href={backHref} className="inline-flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8]">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <span>/</span>
            <span className="text-[#0F172A]">Appointment Creation Workspace</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-[#0F172A] md:text-xl">Healthcare Appointment Operations Workspace</h1>
            <Badge className="rounded-full bg-[#DBEAFE] text-[#1D4ED8]">Draft</Badge>
            <Badge className="rounded-full bg-[#EEF2FF] text-[#4338CA]">Command-Center Mode</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InlineSyncIndicator state={sync.state} label={sync.label} />
            <Badge className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
              <BrainCircuit className="mr-1 h-3.5 w-3.5" />
              Scheduling Intelligence Active
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSaveDraft}>
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="medico" size="sm" disabled={isSubmitting} onClick={onCreate}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Appointment
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#DBEAFE] bg-[#F8FBFF] p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-[#334155]">Operational Validation Progress</span>
          <span className="text-[#1D4ED8]">{Math.round(validationProgress)}%</span>
        </div>
        <Progress value={validationProgress} className="h-2 bg-[#DBEAFE]" />
      </div>
    </motion.header>
  );
}
