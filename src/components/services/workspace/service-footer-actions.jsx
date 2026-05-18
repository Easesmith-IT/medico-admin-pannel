"use client";

import Link from "next/link";
import { Eye, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ServiceFooterActions({
  onSaveDraft,
  onPreview,
  onPublish,
  isSubmitting,
}) {
  return (
    <div className="sticky bottom-3 z-30 rounded-[18px] border border-white/65 bg-white/85 p-3 shadow-[0_16px_30px_rgb(15_23_42_/_0.14)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSaveDraft}>
          <Save className="size-4" />
          Save Draft
        </Button>
        <Button type="button" variant="outline" onClick={onPreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="button" variant="medico" onClick={onPublish} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Publish Service
        </Button>
        <Button type="button" variant="secondaryAction" asChild>
          <Link href="/admin/services">
            <X className="size-4" />
            Cancel
          </Link>
        </Button>
      </div>
    </div>
  );
}

