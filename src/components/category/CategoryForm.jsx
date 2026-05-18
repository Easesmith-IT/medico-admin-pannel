"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BadgeCheck,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Eye,
  FlaskConical,
  GripVertical,
  LoaderCircle,
  Package2,
  Plus,
  Sparkles,
  Stethoscope,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const CATEGORY_TYPE_OPTIONS = [
  {
    id: "equipment",
    apiValue: "equipment",
    label: "Equipment",
    helper: "Physical medical equipment and rentals",
    icon: Package2,
  },
  {
    id: "therapy",
    apiValue: "consumables",
    label: "Therapy",
    helper: "Rehab and therapy consumable service sets",
    icon: Brain,
  },
  {
    id: "consultation",
    apiValue: "medicine",
    label: "Consultation",
    helper: "Consult and specialist-driven category flow",
    icon: Stethoscope,
  },
  {
    id: "package",
    apiValue: "consumables",
    label: "Package",
    helper: "Bundled offerings for enterprise workflows",
    icon: ClipboardCheck,
  },
];

const COLOR_TAGS = [
  { key: "indigo", label: "Indigo", className: "bg-indigo-500" },
  { key: "teal", label: "Teal", className: "bg-teal-500" },
  { key: "emerald", label: "Emerald", className: "bg-emerald-500" },
  { key: "amber", label: "Amber", className: "bg-amber-500" },
  { key: "rose", label: "Rose", className: "bg-rose-500" },
];

const ICON_PICKER = [
  { key: "stethoscope", label: "Stethoscope", icon: Stethoscope },
  { key: "flask", label: "Flask", icon: FlaskConical },
  { key: "sparkles", label: "Sparkles", icon: Sparkles },
  { key: "badge", label: "Badge", icon: BadgeCheck },
];

const typeIdFromApiValue = (value) => {
  if (value === "equipment") return "equipment";
  if (value === "medicine") return "consultation";
  return "therapy";
};

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  unitPrice: z.coerce.number().min(0, "Unit price must be >= 0"),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(50, "Category name cannot exceed 50 characters"),
  type: z.enum(["medicine", "equipment", "consumables"]),
  workflowType: z.enum(["equipment", "therapy", "consultation", "package"]),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  colorTag: z.string().default("indigo"),
  iconKey: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

const baseItem = { name: "", unitPrice: 0, isActive: true, description: "" };

const normalizeDefaults = (values = {}) => {
  const mappedWorkflowType = values.workflowType || typeIdFromApiValue(values.type);
  const sanitizedItems =
    Array.isArray(values.items) && values.items.length
      ? values.items.map((item) => ({
          name: item?.name || "",
          unitPrice: Number(item?.unitPrice || 0),
          isActive: Boolean(item?.isActive ?? true),
          description: item?.description || "",
        }))
      : [baseItem];

  return {
    name: values.name || "",
    type: values.type || "equipment",
    workflowType: mappedWorkflowType || "equipment",
    description: values.description || "",
    isActive: Boolean(values.isActive ?? true),
    colorTag: values.colorTag || "indigo",
    iconKey: values.iconKey || "stethoscope",
    items: sanitizedItems,
  };
};

const parseBulkItems = (source) =>
  source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, pricePart] = line.split("-").map((segment) => segment?.trim() || "");
      const numericPrice = Number(pricePart || 0);
      return {
        name: namePart,
        unitPrice: Number.isFinite(numericPrice) ? numericPrice : 0,
        isActive: true,
        description: "",
      };
    })
    .filter((item) => item.name.length > 0);

const AutosaveIndicator = ({ state }) => {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <LoaderCircle className="size-3.5 animate-spin" />
        Autosaving
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
      <CheckCircle2 className="size-3.5" />
      All changes saved
    </span>
  );
};

const SidebarWidgets = ({ values, validationChecks, previewLoading }) => {
  const itemCount = values.items.length;
  const activeItems = values.items.filter((item) => item.isActive).length;
  const estimatedRevenue = values.items.reduce((total, item) => total + Number(item.unitPrice || 0), 0);
  const selectedColor = COLOR_TAGS.find((tag) => tag.key === values.colorTag);
  const selectedIcon = ICON_PICKER.find((icon) => icon.key === values.iconKey);
  const IconNode = selectedIcon?.icon || Stethoscope;
  const actionableHints = validationChecks.filter((check) => !check.ok).slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-white/70 bg-white/70 p-4 shadow-[0_16px_40px_rgb(15_23_42_/_0.08)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Live Category Preview</p>
        {previewLoading ? (
          <div className="mt-4 space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <span className={cn("size-2 rounded-full", selectedColor?.className || "bg-indigo-500")} />
              {values.workflowType}
            </div>
            <div className="rounded-2xl border border-white/90 bg-gradient-to-br from-white via-indigo-50/70 to-white p-4 shadow-[0_8px_26px_rgb(15_23_42_/_0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{values.name || "Unnamed category"}</h4>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-3">
                    {values.description || "No description yet. Add context for operators and approval teams."}
                  </p>
                </div>
                <div className="rounded-xl border border-white/90 bg-white/80 p-2 text-indigo-600 shadow-sm">
                  <IconNode className="size-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant={values.isActive ? "success" : "destructive"}>{values.isActive ? "Active" : "Inactive"}</Badge>
                <Badge variant="outline">{itemCount} Items</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[20px] border border-white/70 bg-white/75 p-4 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Item Statistics</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-xs text-slate-500">Total Items</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{itemCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-xs text-slate-500">Active</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{activeItems}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3">
            <p className="text-xs text-slate-500">Estimated Revenue</p>
            <p className="mt-1 text-xl font-semibold text-indigo-700">INR {estimatedRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/70 bg-white/75 p-4 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Validation Checklist</p>
        <ul className="mt-3 space-y-2">
          {validationChecks.map((check) => (
            <li key={check.key} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={cn("size-4", check.ok ? "text-emerald-500" : "text-slate-300")} />
              <span className={cn(check.ok ? "text-slate-700" : "text-slate-400")}>{check.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[20px] border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/70 p-4 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suggested Actions</p>
        <div className="mt-3 space-y-2">
          {actionableHints.length ? (
            actionableHints.map((hint) => (
              <div key={hint.key} className="rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-700">
                {hint.suggestion}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Category is ready for creation. Preview and publish.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CategoryForm = ({ defaultValues, onSubmit, isLoading, submitLabel }) => {
  const router = useRouter();
  const [autosaveState, setAutosaveState] = useState("saved");
  const [bulkText, setBulkText] = useState("");
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [isSuccessPulse, setIsSuccessPulse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: normalizeDefaults(defaultValues),
    mode: "onBlur",
  });

  const { fields, append, remove, insert, move, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(normalizeDefaults(defaultValues));
    }
  }, [defaultValues, form]);

  useEffect(() => {
    const timer = setTimeout(() => setPreviewLoading(false), 420);
    return () => clearTimeout(timer);
  }, []);

  const watchedValues = form.watch();

  useEffect(() => {
    if (!form.formState.isDirty) return;
    setAutosaveState("saving");
    const timer = setTimeout(() => setAutosaveState("saved"), 850);
    return () => clearTimeout(timer);
  }, [watchedValues, form.formState.isDirty]);

  const validationChecks = useMemo(() => {
    const values = watchedValues;
    return [
      {
        key: "name",
        ok: String(values.name || "").trim().length >= 2,
        label: "Category name is valid",
        suggestion: "Enter a clear operational category name.",
      },
      {
        key: "description",
        ok: String(values.description || "").trim().length >= 12,
        label: "Description has operational context",
        suggestion: "Add 1-2 lines for internal clinical and ops context.",
      },
      {
        key: "items",
        ok: Array.isArray(values.items) && values.items.some((item) => String(item.name || "").trim()),
        label: "At least one item is configured",
        suggestion: "Add one item manually or use bulk import.",
      },
      {
        key: "pricing",
        ok: Array.isArray(values.items) && values.items.some((item) => Number(item.unitPrice) > 0),
        label: "Pricing is configured",
        suggestion: "Set INR unit price for at least one active item.",
      },
      {
        key: "type",
        ok: Boolean(values.workflowType),
        label: "Category type selected",
        suggestion: "Pick a category type card to finalize the workflow.",
      },
    ];
  }, [watchedValues]);

  const addNewItem = () => append({ ...baseItem });

  const addBulkItems = () => {
    const parsed = parseBulkItems(bulkText);
    if (!parsed.length) return;

    const hasOnlyPlaceholder =
      fields.length === 1 &&
      !form.getValues("items.0.name") &&
      Number(form.getValues("items.0.unitPrice") || 0) === 0;

    if (hasOnlyPlaceholder) {
      replace(parsed);
    } else {
      parsed.forEach((entry) => append(entry));
    }

    setBulkText("");
  };

  const duplicateItem = (index) => {
    const item = form.getValues(`items.${index}`);
    insert(index + 1, {
      ...item,
      name: item?.name ? `${item.name} Copy` : "",
    });
  };

  const submitForm = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        type: CATEGORY_TYPE_OPTIONS.find((option) => option.id === values.workflowType)?.apiValue || values.type,
        description: values.description,
        isActive: values.isActive,
        items: values.items.map((item) => ({
          name: item.name,
          unitPrice: Number(item.unitPrice || 0),
          isActive: Boolean(item.isActive),
          description: item.description || "",
        })),
      };
      setIsSuccessPulse(true);
      await onSubmit(payload);
    } finally {
      setTimeout(() => setIsSuccessPulse(false), 1100);
      setIsSubmitting(false);
    }
  };

  const isBusy = isLoading || isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)} className="space-y-5 pb-28">
        <div className="rounded-[20px] border border-white/80 bg-white/78 p-4 shadow-[0_18px_46px_rgb(15_23_42_/_0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <Button asChild variant="outline" size="icon" className="rounded-full">
                  <Link href="/admin/categories">
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/admin/categories">Categories</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{submitLabel === "Update" ? "Edit Category" : "Add Category"}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <AutosaveIndicator state={autosaveState} />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-[2rem]">
                  {submitLabel === "Update" ? "Edit Category Workspace" : "Create Category Workspace"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Configure enterprise-grade category structure, pricing units, and operator-ready metadata.
                </p>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <Button type="button" variant="secondaryAction" onClick={() => router.push("/admin/categories")}>
                  Cancel
                </Button>
                <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
                  <Eye className="size-4" />
                  Preview
                </Button>
                <Button
                  type="submit"
                  variant="medico"
                  className={cn(
                    "bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-[0_12px_28px_rgb(79_70_229_/_0.35)] transition-transform",
                    isSuccessPulse ? "scale-[1.03]" : "scale-100",
                  )}
                  disabled={isBusy}
                >
                  {isBusy ? <Spinner /> : submitLabel || "Create Category"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
          <div className="space-y-5">
            <Card className="overflow-hidden rounded-[20px] border border-white/70 bg-white/75 shadow-[0_20px_50px_rgb(15_23_42_/_0.08)] backdrop-blur-xl">
              <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-400" />
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Category Details</h2>
                    <p className="text-xs text-slate-500">Clinical operations metadata and governance controls.</p>
                  </div>
                  <Badge variant={watchedValues.isActive ? "success" : "destructive"}>
                    {watchedValues.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-xl border-slate-200 bg-white/90" placeholder="Rehabilitation Equipment" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[92px] resize-none rounded-xl border-slate-200 bg-white/90"
                            placeholder="Define purpose, operator handling, and eligibility context."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <FormLabel className="text-sm">Category Status</FormLabel>
                            <p className="text-xs text-slate-500">Control visibility for downstream teams.</p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="iconKey"
                    render={({ field }) => (
                      <FormItem className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <FormLabel className="text-sm">Icon Picker</FormLabel>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ICON_PICKER.map((option) => {
                            const Icon = option.icon;
                            const active = field.value === option.key;
                            return (
                              <button
                                key={option.key}
                                type="button"
                                onClick={() => field.onChange(option.key)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition",
                                  active
                                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-[0_0_0_3px_rgb(99_102_241_/_0.15)]"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600",
                                )}
                              >
                                <Icon className="size-3.5" />
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorTag"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <FormLabel className="text-sm">Color Tag</FormLabel>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {COLOR_TAGS.map((tag) => {
                            const active = field.value === tag.key;
                            return (
                              <button
                                key={tag.key}
                                type="button"
                                onClick={() => field.onChange(tag.key)}
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
                                  active
                                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-[0_0_0_3px_rgb(99_102_241_/_0.15)]"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200",
                                )}
                              >
                                <span className={cn("size-2.5 rounded-full", tag.className)} />
                                {tag.label}
                              </button>
                            );
                          })}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-800">Category Type</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CATEGORY_TYPE_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = watchedValues.workflowType === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            form.setValue("workflowType", option.id, { shouldValidate: true, shouldDirty: true });
                            form.setValue("type", option.apiValue, { shouldValidate: true, shouldDirty: true });
                          }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "group rounded-2xl border p-4 text-left transition",
                            isSelected
                              ? "border-indigo-300 bg-indigo-50/80 shadow-[0_0_0_4px_rgb(99_102_241_/_0.12)]"
                              : "border-slate-200 bg-white/90 hover:border-indigo-200 hover:bg-indigo-50/30",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "inline-flex size-8 items-center justify-center rounded-xl border",
                                isSelected ? "border-indigo-200 bg-white text-indigo-600" : "border-slate-200 bg-slate-50 text-slate-500",
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            {isSelected ? <Badge variant="secondary">Selected</Badge> : null}
                          </div>
                          <p className="mt-3 text-sm font-semibold text-slate-900">{option.label}</p>
                          <p className="mt-1 text-xs text-slate-500">{option.helper}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] border border-white/70 bg-white/75 shadow-[0_20px_50px_rgb(15_23_42_/_0.08)] backdrop-blur-xl">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Items Management</h2>
                    <p className="text-xs text-slate-500">Inline editable cards with drag sorting and quick actions.</p>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {fields.length} items
                  </Badge>
                </div>

                {fields.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center">
                    <p className="text-sm text-slate-600">No items yet. Start by adding a first item.</p>
                    <Button type="button" variant="outline" className="mt-3" onClick={addNewItem}>
                      <Plus className="size-4" />
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    <div className="space-y-3">
                      {fields.map((fieldItem, index) => (
                        <motion.div
                          key={fieldItem.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.22 }}
                          draggable
                          onDragStart={() => setDraggingIndex(index)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (draggingIndex === null || draggingIndex === index) return;
                            move(draggingIndex, index);
                            setDraggingIndex(null);
                          }}
                          onDragEnd={() => setDraggingIndex(null)}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.06)]"
                        >
                          <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)_120px_auto] md:items-end">
                            <div className="md:mb-2">
                              <button
                                type="button"
                                className="inline-flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                                aria-label="Drag to reorder"
                              >
                                <GripVertical className="size-4" />
                              </button>
                            </div>

                            <FormField
                              control={form.control}
                              name={`items.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Item Name</FormLabel>
                                  <FormControl>
                                    <Input className="h-10 rounded-xl" placeholder="Wheelchair" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (INR)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="h-10 rounded-xl"
                                      value={field.value ?? 0}
                                      onChange={(event) => field.onChange(event.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${index}.isActive`}
                              render={({ field }) => (
                                <FormItem className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <div className="flex items-center justify-between gap-3">
                                    <FormLabel className="m-0 text-xs">Active</FormLabel>
                                    <FormControl>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Optional Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      className="min-h-[72px] resize-none rounded-xl"
                                      placeholder="Operational guidance for this item"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex items-center gap-2 md:pb-1">
                              <Button type="button" variant="outline" size="icon-sm" onClick={() => duplicateItem(index)}>
                                <Copy className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                disabled={fields.length === 1}
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}

                <div className="sticky bottom-6 z-10 flex justify-end">
                  <Button
                    type="button"
                    className="rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 shadow-[0_12px_28px_rgb(79_70_229_/_0.35)]"
                    onClick={addNewItem}
                  >
                    <Plus className="size-4" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] border border-white/70 bg-white/75 shadow-[0_20px_50px_rgb(15_23_42_/_0.08)] backdrop-blur-xl">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Bulk Add Items</h2>
                  <p className="text-xs text-slate-500">Paste one item per line as `Name - Price` and convert instantly.</p>
                </div>
                <Textarea
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  className="min-h-[120px] resize-none rounded-xl border-slate-200 bg-white"
                  placeholder={"Wheelchair - 500\nWalker - 300"}
                />
                <div className="flex justify-end">
                  <Button type="button" variant="outline" disabled={!bulkText.trim()} onClick={addBulkItems}>
                    <Plus className="size-4" />
                    Convert to Item Cards
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-[calc(var(--app-header-height)+4px)]">
              <SidebarWidgets values={watchedValues} validationChecks={validationChecks} previewLoading={previewLoading} />
            </div>
          </div>
        </div>

        <div className="xl:hidden">
          <SidebarWidgets values={watchedValues} validationChecks={validationChecks} previewLoading={previewLoading} />
        </div>

        <div className="sticky bottom-3 z-20 hidden items-center justify-between gap-4 rounded-[18px] border border-white/80 bg-white/85 px-4 py-3 shadow-[0_18px_40px_rgb(15_23_42_/_0.1)] backdrop-blur-xl md:flex">
          <div className="text-xs text-slate-500">
            Use <span className="font-medium text-slate-700">Preview</span> to validate summary and then publish.
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondaryAction" onClick={() => router.push("/admin/categories")}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="size-4" />
              Preview
            </Button>
            <Button type="submit" variant="medico" disabled={isBusy} className="bg-gradient-to-r from-indigo-600 to-indigo-500">
              {isBusy ? <Spinner /> : submitLabel || "Create Category"}
            </Button>
          </div>
        </div>

        <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
          <div className="rounded-[18px] border border-white/80 bg-white/90 p-2 shadow-[0_20px_40px_rgb(15_23_42_/_0.12)] backdrop-blur-xl">
            <div className="grid grid-cols-3 gap-2">
              <Button type="button" variant="secondary" className="h-10" onClick={() => router.push("/admin/categories")}>
                Cancel
              </Button>
              <Button type="button" variant="outline" className="h-10" onClick={() => setPreviewOpen(true)}>
                Preview
              </Button>
              <Button type="submit" variant="medico" className="h-10 bg-gradient-to-r from-indigo-600 to-indigo-500" disabled={isBusy}>
                {isBusy ? <Spinner /> : submitLabel === "Update" ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="right" className="w-[92vw] border-l-slate-200 bg-[#F5F7FB] p-0 sm:max-w-md">
          <SheetHeader className="border-b border-slate-200 bg-white/80">
            <SheetTitle>Live Preview</SheetTitle>
            <SheetDescription>Category summary, validation, and action recommendations.</SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <SidebarWidgets values={watchedValues} validationChecks={validationChecks} previewLoading={previewLoading} />
          </div>
        </SheetContent>
      </Sheet>
    </Form>
  );
};

export default CategoryForm;
