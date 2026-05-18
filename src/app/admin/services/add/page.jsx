"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { serviceSchema } from "@/schemas/ServicesSchema";
import { useRouter } from "next/navigation";
import { ServiceHeader } from "@/components/services/workspace/service-header";
import { ServiceBasicInfo } from "@/components/services/workspace/service-basic-info";
import { ServiceModeSelector } from "@/components/services/workspace/service-mode-selector";
import { ServicePricingWorkspace } from "@/components/services/workspace/service-pricing-workspace";
import { ConsultationConfigCard } from "@/components/services/workspace/consultation-config-card";
import { NursingConfigCard } from "@/components/services/workspace/nursing-config-card";
import { EquipmentConfigCard } from "@/components/services/workspace/equipment-config-card";
import { ServiceDurationManager } from "@/components/services/workspace/service-duration-manager";
import { ServiceMediaStudio } from "@/components/services/workspace/service-media-studio";
import { ServicePreviewSidebar } from "@/components/services/workspace/service-preview-sidebar";
import { ServiceValidationPanel } from "@/components/services/workspace/service-validation-panel";
import { ServiceFooterActions } from "@/components/services/workspace/service-footer-actions";

const DRAFT_STORAGE_KEY = "medico_service_workspace_draft_v1";
const DRAFT_DEBOUNCE_MS = 900;

const DEFAULT_VALUES = {
  name: "",
  category: "",
  nursingType: undefined,
  description: "",
  basePrice: 0,
  equipmentCharges: 0,
  taxPercentage: 18,
  modes: ["Home Service"],
  supportsDuration: false,
  defaultDuration: 30,
  durationOptions: [30],
  paymentMode: "Both",
  icon: null,
  image: null,
  cities: [],
  consultationSlots: {
    enabled: true,
    startTime: "09:00",
    endTime: "19:00",
    slotDuration: 30,
  },
  nursingSlots: {
    enabled: true,
    shiftTypes: [],
    minDuration: 60,
    maxDuration: 10080,
    available24x7: false,
    allowCustomDuration: false,
  },
  equipmentBooking: {
    enabled: true,
    minDuration: 60,
    maxDuration: 720,
    available24x7: false,
  },
  timeFormat: "12-hour",
};

const serializeDraft = (values) => ({
  ...values,
  icon: null,
  image: null,
});

const isValidImageFile = (file, { maxMB, allowSvg = false }) => {
  if (!file) return "No file selected";
  const allowedTypes = allowSvg
    ? ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"]
    : ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return "Unsupported file type. Use PNG, JPG, or WebP.";
  }
  if (file.size > maxMB * 1024 * 1024) {
    return `File exceeds ${maxMB}MB limit.`;
  }
  return "";
};

const CreateServiceWorkspace = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [iconPreview, setIconPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [iconError, setIconError] = useState("");
  const [imageError, setImageError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [autosaveState, setAutosaveState] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const autosaveTimeoutRef = useRef(null);
  const hydratedDraftRef = useRef(false);

  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  });

  useUnsavedChangesWarning(form.formState.isDirty);

  const {
    handleSubmit,
    watch,
    setValue,
    formState,
    reset,
    getValues,
    setError,
    clearErrors,
  } = form;

  const watchedValues = watch();
  const category = watch("category");
  const supportsDuration = watch("supportsDuration");

  const {
    data: citiesData,
    isLoading: isCitiesLoading,
    error: cityError,
    refetch: refetchCities,
  } = useApiQuery({
    url: "/city/getAllCities",
    queryKeys: ["city"],
  });

  const cityOptions = useMemo(
    () =>
      (citiesData?.data || []).map((city) => ({
        label: city?.name,
        value: city?._id,
      })),
    [citiesData],
  );

  const { data: servicesData } = useApiQuery({
    url: "/service/getAllServices?limit=200&page=1",
    queryKeys: ["service", "duplicate-check"],
    options: { retry: 0 },
  });

  const duplicateName = useMemo(() => {
    const inputName = String(watchedValues.name || "").trim().toLowerCase();
    if (!inputName) return false;
    const existing = servicesData?.data?.services || [];
    return existing.some(
      (service) => String(service?.name || "").trim().toLowerCase() === inputName,
    );
  }, [servicesData, watchedValues.name]);

  const validationChecks = useMemo(() => {
    const values = watchedValues;
    return [
      {
        key: "name",
        ok: String(values.name || "").trim().length >= 2,
        label: "Service identity configured",
      },
      {
        key: "pricing",
        ok: Number(values.basePrice) > 0,
        label: "Pricing configured",
      },
      {
        key: "cities",
        ok: (values.cities || []).length > 0,
        label: "Coverage cities selected",
      },
      {
        key: "modes",
        ok: (values.modes || []).length > 0,
        label: "Service modes selected",
      },
      {
        key: "media",
        ok: Boolean(values.image || imagePreview),
        label: "Service banner uploaded",
      },
      {
        key: "duration",
        ok: values.supportsDuration ? (values.durationOptions || []).length > 0 : true,
        label: "Duration system validated",
      },
    ];
  }, [watchedValues, imagePreview]);

  const validationProgress = useMemo(() => {
    const done = validationChecks.filter((item) => item.ok).length;
    return validationChecks.length ? (done / validationChecks.length) * 100 : 0;
  }, [validationChecks]);

  const saveDraftToStorage = useCallback(
    (values, silent = false) => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            values: serializeDraft(values),
            savedAt: new Date().toISOString(),
          }),
        );
        setLastSavedAt(new Date().toISOString());
        setAutosaveState("saved");
        if (!silent) {
          toast.success("Draft saved");
        }
      } catch {
        setAutosaveState("error");
        if (!silent) {
          toast.error("Unable to save draft locally");
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hydratedDraftRef.current) return;
    hydratedDraftRef.current = true;

    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.values) {
        reset(
          {
            ...DEFAULT_VALUES,
            ...parsed.values,
          },
          { keepDefaultValues: false },
        );
        setLastSavedAt(parsed?.savedAt || null);
        setAutosaveState("saved");
      }
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [reset]);

  useEffect(() => {
    if (!hydratedDraftRef.current) return;
    if (!formState.isDirty) return;
    setAutosaveState("saving");

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      saveDraftToStorage(getValues(), true);
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [formState.isDirty, getValues, saveDraftToStorage, watchedValues]);

  const onDropIcon = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles?.[0];
      if (!file) return;
      const error = isValidImageFile(file, { maxMB: 2, allowSvg: true });
      if (error) {
        setIconError(error);
        setError("icon", { type: "custom", message: error });
        return;
      }
      clearErrors("icon");
      setIconError("");
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);
      setValue("icon", file, { shouldValidate: true, shouldDirty: true });
    },
    [clearErrors, setError, setValue],
  );

  const onDropImage = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles?.[0];
      if (!file) return;
      const error = isValidImageFile(file, { maxMB: 5 });
      if (error) {
        setImageError(error);
        setError("image", { type: "custom", message: error });
        return;
      }
      clearErrors("image");
      setImageError("");
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setValue("image", file, { shouldValidate: true, shouldDirty: true });
    },
    [clearErrors, setError, setValue],
  );

  const iconDropzone = useDropzone({
    onDrop: onDropIcon,
    maxFiles: 1,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const imageDropzone = useDropzone({
    onDrop: onDropImage,
    maxFiles: 1,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
      "image/webp": [],
    },
  });

  const { mutateAsync: createService, isPending: isPublishing } = useApiMutation({
    url: "/service/createService",
    method: POST,
    invalidateKey: ["service"],
  });

  const submit = useCallback(async (values) => {
    if (duplicateName) {
      setError("name", {
        type: "manual",
        message: "A service with this name already exists.",
      });
      toast.error("Choose a unique service name before publishing.");
      return;
    }

    const slotConfig = {
      consultationSlots: values.consultationSlots,
      nursingSlots: values.nursingSlots,
      equipmentBooking: values.equipmentBooking,
    };

    const formData = new FormData();
    formData.append("name", values.name ?? "");
    formData.append("category", values.category ?? "");
    formData.append("nursingType", values.nursingType ?? "");
    formData.append("description", values.description ?? "");
    formData.append("basePrice", String(values.basePrice ?? 0));
    formData.append("equipmentCharges", String(values.equipmentCharges ?? 0));
    formData.append("taxPercentage", String(values.taxPercentage ?? 0));
    formData.append("supportsDuration", values.supportsDuration ? "true" : "false");
    formData.append("defaultDuration", String(values.defaultDuration ?? 30));
    formData.append(
      "durationOptions",
      JSON.stringify(values.supportsDuration ? values.durationOptions ?? [] : []),
    );
    formData.append("paymentMode", values.paymentMode ?? "Both");
    formData.append("timeFormat", values.timeFormat ?? "12-hour");
    formData.append("modes", JSON.stringify(values.modes ?? []));
    formData.append("cities", JSON.stringify(values.cities ?? []));
    formData.append("slotConfig", JSON.stringify(slotConfig));

    if (values.image instanceof File) {
      formData.append("image", values.image);
    }
    if (values.icon instanceof File) {
      formData.append("icon", values.icon);
    }

    await createService(formData);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setAutosaveState("idle");
    router.push("/admin/services");
  }, [createService, duplicateName, router, setError]);

  useEffect(() => {
    if (!category) return;
    if (category === "consultation") return;
    if (supportsDuration) {
      setValue("supportsDuration", false, { shouldDirty: true, shouldValidate: true });
    }
  }, [category, setValue, supportsDuration]);

  const handleSaveDraft = useCallback(() => {
    saveDraftToStorage(getValues(), false);
  }, [getValues, saveDraftToStorage]);

  const handlePublish = useCallback(() => {
    handleSubmit(submit)();
  }, [handleSubmit, submit]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSaveDraft();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        handlePublish();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePublish, handleSaveDraft]);

  const previewValues = watch();
  const mediaProps = {
    iconPreview,
    imagePreview,
    iconError,
    imageError,
    iconUpload: {
      getRootProps: iconDropzone.getRootProps,
      getInputProps: iconDropzone.getInputProps,
      isUploading: false,
      clear: () => {
        setIconPreview("");
        setIconError("");
        setValue("icon", null, { shouldDirty: true });
      },
    },
    imageUpload: {
      getRootProps: imageDropzone.getRootProps,
      getInputProps: imageDropzone.getInputProps,
      isUploading: false,
      clear: () => {
        setImagePreview("");
        setImageError("");
        setValue("image", null, { shouldDirty: true });
      },
    },
  };

  return (
    <Form {...form}>
      <div className="space-y-5 pb-6">
        <ServiceHeader
          isDirty={formState.isDirty}
          isSubmitting={isPublishing}
          autosaveState={autosaveState}
          lastSavedAt={lastSavedAt}
          validationProgress={validationProgress}
          onSaveDraft={handleSaveDraft}
          onPreview={() => setPreviewOpen(true)}
          onPublish={handlePublish}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-5">
            <ServiceBasicInfo form={form} duplicateName={duplicateName} />
            <ServiceModeSelector
              form={form}
              cityOptions={cityOptions}
              isCityLoading={isCitiesLoading}
              cityError={cityError}
              onRetryCities={refetchCities}
            />
            <ServicePricingWorkspace form={form} />

            {category === "consultation" ? <ConsultationConfigCard form={form} /> : null}
            {category === "nursing" ? <NursingConfigCard form={form} /> : null}
            {category === "equipment" ? <EquipmentConfigCard form={form} /> : null}

            {category === "consultation" ? <ServiceDurationManager form={form} /> : null}
            <ServiceMediaStudio form={form} media={mediaProps} />
            <ServiceValidationPanel checks={validationChecks} />

            <ServiceFooterActions
              onSaveDraft={handleSaveDraft}
              onPreview={() => setPreviewOpen(true)}
              onPublish={handlePublish}
              isSubmitting={isPublishing}
            />
          </div>

          <div className={isMobile ? "hidden" : ""}>
            <ServicePreviewSidebar values={previewValues} open={previewOpen} onOpenChange={setPreviewOpen} />
          </div>
        </div>

        {isMobile ? (
          <ServicePreviewSidebar values={previewValues} open={previewOpen} onOpenChange={setPreviewOpen} />
        ) : null}

        {isPublishing ? (
          <div className="fixed bottom-5 right-5 z-50 rounded-full bg-[#0f172a] px-4 py-2 text-xs text-white shadow-[0_18px_30px_rgb(15_23_42_/_0.35)]">
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Publishing service workspace...
            </span>
          </div>
        ) : null}
      </div>
    </Form>
  );
};

export default CreateServiceWorkspace;
