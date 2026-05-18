"use client";

import { motion } from "framer-motion";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function UploadZone({
  title,
  description,
  preview,
  isUploading,
  error,
  getRootProps,
  getInputProps,
  onClear,
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-[#0f172a]">{title}</p>
        {preview ? (
          <Button type="button" size="sm" variant="outline" onClick={onClear}>
            <Trash2 className="size-4" />
            Remove
          </Button>
        ) : null}
      </div>

      <div
        {...getRootProps()}
        className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-center"
      >
        <input {...getInputProps()} />
        {isUploading ? <Loader2 className="size-5 animate-spin text-[#1d4ed8]" /> : <UploadCloud className="size-6 text-[#64748b]" />}
        <p className="mt-2 text-sm text-[#334155]">Drag and drop or click to upload</p>
        <p className="text-xs text-[#64748b]">{description}</p>
      </div>

      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}

      {preview ? (
        <div className="mt-3 rounded-xl border border-[#e2e8f0] bg-white p-2">
          <img src={preview} alt={`${title} preview`} className="h-36 w-full rounded-lg object-cover" />
        </div>
      ) : null}
    </div>
  );
}

export function ServiceMediaStudio({ form, media }) {
  const { iconPreview, imagePreview, iconUpload, imageUpload, iconError, imageError } = media;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-[22px] border border-[#dbe4f8] bg-white/85 p-5 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)]"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#64748b]">Section 6</p>
          <h3 className="text-lg font-semibold text-[#0f172a]">Media & Branding Studio</h3>
          <p className="text-sm text-[#64748b]">Upload icon and banner assets with controlled media validation.</p>
        </div>
        <Badge className="rounded-full bg-[#dbeafe] text-[#1d4ed8]">
          <ImagePlus className="size-3.5" />
          Media Studio
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="icon"
          render={() => (
            <FormItem>
              <FormLabel>Service Icon</FormLabel>
              <FormControl>
                <UploadZone
                  title="Icon"
                  description="PNG/JPG/WebP up to 2MB. Recommended ratio 1:1."
                  preview={iconPreview}
                  isUploading={iconUpload.isUploading}
                  error={iconError}
                  getRootProps={iconUpload.getRootProps}
                  getInputProps={iconUpload.getInputProps}
                  onClear={iconUpload.clear}
                />
              </FormControl>
              <FormDescription>Used in cards, filters, and compact service lists.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>Service Banner</FormLabel>
              <FormControl>
                <UploadZone
                  title="Banner"
                  description="PNG/JPG/WebP up to 5MB. Recommended landscape format."
                  preview={imagePreview}
                  isUploading={imageUpload.isUploading}
                  error={imageError}
                  getRootProps={imageUpload.getRootProps}
                  getInputProps={imageUpload.getInputProps}
                  onClear={imageUpload.clear}
                />
              </FormControl>
              <FormDescription>Used in service workspace hero and consumer-facing assets.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.section>
  );
}

