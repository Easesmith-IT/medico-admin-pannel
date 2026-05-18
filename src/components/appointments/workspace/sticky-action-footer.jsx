"use client";

import { Eye, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StickyActionFooter({
  isSubmitting,
  onCancel,
  onSaveDraft,
  onPreview,
  onCreate,
}) {
  return (
    <div className="sticky bottom-3 z-30 rounded-2xl border border-white/70 bg-white/85 p-3 shadow-[0_18px_32px_rgba(15,23,42,0.16)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="outline" onClick={onSaveDraft}>
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        <Button type="button" variant="outline" onClick={onPreview}>
          <Eye className="h-4 w-4" />
          Preview Booking
        </Button>
        <Button type="button" variant="medico" disabled={isSubmitting} onClick={onCreate}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create Appointment
        </Button>
      </div>
    </div>
  );
}
