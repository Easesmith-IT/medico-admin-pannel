"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ClipboardList, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import DatePicker from "@/components/shared/DatePicker";
import { CustomCombobox } from "@/components/shared/custom-combobox";
import { InlineSyncIndicator } from "@/components/loading/sync-indicator";
import { AppointmentWorkspaceHeader } from "@/components/appointments/workspace/appointment-workspace-header";
import { PatientWorkspaceCard } from "@/components/appointments/workspace/patient-workspace-card";
import { ServiceSelectorWorkspace } from "@/components/appointments/workspace/service-selector-workspace";
import { TreatmentLinkagePanel } from "@/components/appointments/workspace/treatment-linkage-panel";
import { SmartSlotPicker } from "@/components/appointments/workspace/smart-slot-picker";
import { ProviderRecommendationPanel } from "@/components/appointments/workspace/provider-recommendation-panel";
import { AddressSelectionGrid } from "@/components/appointments/workspace/address-selection-grid";
import { BookingImpactPreview } from "@/components/appointments/workspace/booking-impact-preview";
import { PaymentPreviewSidebar } from "@/components/appointments/workspace/payment-preview-sidebar";
import { TreatmentHealthPanel } from "@/components/appointments/workspace/treatment-health-panel";
import { BookingRiskPanel } from "@/components/appointments/workspace/booking-risk-panel";
import { WorkflowTimelinePreview } from "@/components/appointments/workspace/workflow-timeline-preview";
import { NotesWorkspace } from "@/components/appointments/workspace/notes-workspace";
import { StickyActionFooter } from "@/components/appointments/workspace/sticky-action-footer";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { POST } from "@/constants/apiMethods";
import { APPOINTMENT_DEFAULT_VALUES, appointmentFormSchema } from "@/schemas/AppointmentSchema";
import { PAYMENT_STAGES, SLOT_PERIOD_ORDER } from "@/constants/appointment";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { buildQuery, generateTimeRange } from "@/lib/utils";

const DEFAULT_DRAFT_STORAGE_KEY = "medico_appointment_workspace_draft_v2";
const DRAFT_DEBOUNCE_MS = 900;
const objectIdRegex = /^[a-f\d]{24}$/i;

const asText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const resolveLocationValue = (value, lookup = {}) => {
  if (!value) return "Not provided";
  if (typeof value === "object") return value.name || value.label || "Not provided";
  const text = asText(value);
  if (!text) return "Not provided";
  if (lookup[text]) return lookup[text];
  if (objectIdRegex.test(text)) return "Not provided";
  return text;
};

const computeAge = (dob) => {
  if (!dob) return null;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(new Date().getFullYear() - date.getFullYear(), 0);
};

const toMinutes = (time) => {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  return h * 60 + m;
};

const toTime = (minutes) => {
  const value = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(value / 60);
  const m = value % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const periodFromHour = (hour) => {
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
};

const inferRisk = (providerCount, index) => {
  if (providerCount <= 1) return "high";
  if (providerCount <= 3) return index % 2 ? "medium" : "high";
  return index % 3 === 0 ? "medium" : "low";
};

const buildConsultationSlots = (service, providerCount) => {
  const config = service?.slotConfig?.consultationSlots || {};
  const start = config.startTime || "09:00";
  const end = config.endTime || "19:00";
  const duration = Number(config.slotDuration || 30);
  const starts = generateTimeRange(start, end, duration);

  return starts.map((startTime, index) => {
    const startMin = toMinutes(startTime);
    const endMin = startMin + duration;
    return {
      period: periodFromHour(Math.floor(startMin / 60)),
      startTime,
      endTime: toTime(endMin),
      providerCount,
      estimatedWait: Math.max(5, 25 - providerCount * 2 + (index % 4) * 2),
      risk: inferRisk(providerCount, index),
      available: providerCount > 0,
    };
  });
};

const buildNursingSlots = (service, providerCount) => {
  const config = service?.slotConfig?.nursingSlots || {};
  const shiftTypes = config.shiftTypes?.length ? config.shiftTypes : ["8-hour", "12-hour", "24-hour"];
  const shifts = [
    { period: "Morning", startTime: "06:00", duration: 480, key: "8-hour" },
    { period: "Afternoon", startTime: "12:00", duration: 720, key: "12-hour" },
    { period: "Night", startTime: "21:00", duration: 1440, key: "24-hour" },
  ].filter((item) => shiftTypes.includes(item.key) || shiftTypes.includes(item.key.replace("-hour", "hourly")));

  return shifts.map((item, index) => {
    const startMin = toMinutes(item.startTime);
    return {
      period: item.period,
      startTime: item.startTime,
      endTime: toTime(startMin + item.duration),
      providerCount,
      estimatedWait: Math.max(15, 45 - providerCount * 4 + index * 5),
      risk: inferRisk(providerCount, index + 1),
      available: providerCount > 0,
    };
  });
};

const buildEquipmentSlots = (service, providerCount) => {
  const config = service?.slotConfig?.equipmentBooking || {};
  const minDuration = Number(config.minDuration || 60);
  const startSlots = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];

  return startSlots.map((startTime, index) => {
    const startMin = toMinutes(startTime);
    return {
      period: periodFromHour(Math.floor(startMin / 60)),
      startTime,
      endTime: toTime(startMin + minDuration),
      providerCount,
      estimatedWait: Math.max(10, 35 - providerCount * 3 + index),
      risk: inferRisk(providerCount, index + 2),
      available: providerCount > 0,
    };
  });
};

const groupedByPeriod = (slots = []) => {
  const grouped = Object.fromEntries(SLOT_PERIOD_ORDER.map((period) => [period, []]));
  slots.forEach((slot) => {
    if (grouped[slot.period]) grouped[slot.period].push(slot);
  });
  return grouped;
};

export function AppointmentCreateWorkspace({
  initialPatientId = "",
  lockPatientSelection = false,
  backHref = "/admin/appointments",
  successHref = "/admin/appointments",
  draftStorageKey = DEFAULT_DRAFT_STORAGE_KEY,
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [isPatientSelectorOpen, setIsPatientSelectorOpen] = useState(false);
  const [autosaveState, setAutosaveState] = useState("idle");
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      ...APPOINTMENT_DEFAULT_VALUES,
      patientId: initialPatientId || "",
    },
    mode: "onBlur",
  });

  useUnsavedChangesWarning(form.formState.isDirty);

  const { control, watch, setValue, handleSubmit, reset, getValues } = form;
  const watchedValues = watch();

  const patientId = watch("patientId");
  const serviceId = watch("serviceId");
  const cityId = watch("cityId");
  const treatmentLinkType = watch("treatmentLinkType");
  const selectedAddressId = watch("addressId");

  useEffect(() => {
    if (!lockPatientSelection || !initialPatientId) return;
    if (patientId !== initialPatientId) {
      setValue("patientId", initialPatientId, { shouldDirty: false });
    }
  }, [initialPatientId, lockPatientSelection, patientId, setValue]);

  const { data: serviceData } = useApiQuery({
    url: "/admin/services/names",
    queryKeys: ["service-admin-names-workspace"],
  });

  const patientQuery = buildQuery({ searchQuery: search });
  const { data: patientData } = useApiQuery({
    url: `/admin/patients/names?${patientQuery}`,
    queryKeys: ["patient-names-workspace", search, isPatientSelectorOpen],
    options: { enabled: isPatientSelectorOpen },
  });

  const { data: selectedPatientData, refetch: refetchSelectedPatient } = useApiQuery({
    url: `/admin/patients/${patientId}`,
    queryKeys: ["patient-profile-workspace", patientId],
    options: { enabled: false },
  });

  const { data: treatmentData, refetch: refetchTreatments } = useApiQuery({
    url: `/admin/patients/${patientId}/treatments?serviceId=${serviceId || ""}`,
    queryKeys: ["patient-treatments-workspace", patientId, serviceId],
    options: { enabled: false },
  });

  const { data: cityData } = useApiQuery({
    url: "/city/getAllCities",
    queryKeys: ["city-workspace"],
  });

  const providerQuery = buildQuery({ serviceId, cityId });
  const { data: partnerData, refetch: refetchPartners } = useApiQuery({
    url: `/admin/service-providers/names?${providerQuery}`,
    queryKeys: ["providers-workspace", serviceId, cityId],
    options: { enabled: false },
  });

  const { mutateAsync: createBooking, isPending } = useApiMutation({
    url: "/admin/bookings/create",
    method: POST,
    invalidateKey: ["bookings"],
  });

  useEffect(() => {
    if (patientId) refetchSelectedPatient();
  }, [patientId, refetchSelectedPatient]);

  useEffect(() => {
    if (patientId && serviceId) {
      refetchTreatments();
    }
  }, [patientId, serviceId, refetchTreatments]);

  useEffect(() => {
    if (serviceId) refetchPartners();
  }, [serviceId, cityId, refetchPartners]);

  const cityLookup = useMemo(() => {
    const lookup = {};
    (cityData?.data || []).forEach((city) => {
      if (city?._id && city?.name) lookup[String(city._id)] = city.name;
    });
    return lookup;
  }, [cityData]);

  const patientOptions = useMemo(
    () =>
      (patientData?.data || []).map((item) => ({
        value: item._id,
        label: [item.firstName, item.lastName].filter(Boolean).join(" ").trim() || "Unknown Patient",
        fullName: [item.firstName, item.lastName].filter(Boolean).join(" ").trim() || "Unknown Patient",
        patientId: `#ID-${String(item._id).slice(0, 4).toUpperCase()}-${String(item._id).slice(-4).toUpperCase()}`,
        phone: item.phone || "Phone not provided",
        city: item.address?.city || item.address?.state || item.address?.country || "",
      })),
    [patientData]
  );

  const services = useMemo(() => serviceData?.data || [], [serviceData]);

  const selectedService = useMemo(
    () => services.find((item) => item._id === serviceId) || null,
    [services, serviceId]
  );

  useEffect(() => {
    if (!selectedService) return;
    if (selectedService.category && selectedService.category !== watch("category")) {
      setValue("category", selectedService.category, { shouldDirty: true });
    }
    if ((selectedService.modes || []).length && !watch("modes")) {
      setValue("modes", selectedService.modes[0], { shouldDirty: true });
    }
  }, [selectedService, setValue, watch]);

  const selectedPatient = selectedPatientData?.data?.patient;

  const patientAddressOptions = useMemo(() => {
    const rawAddresses = Array.isArray(selectedPatient?.addresses)
      ? selectedPatient.addresses
      : Array.isArray(selectedPatient?.address)
      ? selectedPatient.address
      : selectedPatient?.address
      ? [selectedPatient.address]
      : [];

    return rawAddresses
      .map((address, index) => {
        const id = address?._id || address?.id || "";
        return {
          value: id,
          label: address?.label || "Address",
          isDefault: Boolean(address?.isDefault || address?.isPrimary),
          street: asText(address?.street) || "Not provided",
          city: resolveLocationValue(address?.city, cityLookup),
          cityId: address?.cityId ? String(address.cityId) : "",
          state: resolveLocationValue(address?.state, cityLookup),
          country: resolveLocationValue(address?.country, cityLookup),
          pincode: asText(address?.pincode) || "Not provided",
          key: id || `address-${index}`,
        };
      })
      .filter((item) => Boolean(item.value));
  }, [selectedPatient, cityLookup]);

  useEffect(() => {
    if (!patientId || !patientAddressOptions.length) {
      setValue("addressId", "");
      return;
    }

    if (selectedAddressId && patientAddressOptions.some((address) => address.value === selectedAddressId)) {
      return;
    }

    const defaultAddress =
      patientAddressOptions.find((address) => address.isDefault)?.value || patientAddressOptions[0]?.value || "";
    setValue("addressId", defaultAddress);
  }, [patientId, patientAddressOptions, selectedAddressId, setValue]);

  useEffect(() => {
    const selectedAddress = patientAddressOptions.find((item) => item.value === selectedAddressId);
    if (!selectedAddress) return;
    if (selectedAddress.cityId && selectedAddress.cityId !== watch("cityId")) {
      setValue("cityId", selectedAddress.cityId, { shouldDirty: true });
    }
  }, [patientAddressOptions, selectedAddressId, setValue, watch]);

  const treatmentOptions = useMemo(
    () =>
      (treatmentData?.data || []).map((item) => ({
        value: item._id,
        label: `#${String(item._id).slice(-6).toUpperCase()} • ${item.status} • Sessions ${item.sessionsCount || 0}`,
        ...item,
      })),
    [treatmentData]
  );

  const selectedTreatment = useMemo(
    () => treatmentOptions.find((item) => item.value === watch("treatmentSelection")) || null,
    [treatmentOptions, watch]
  );

  useEffect(() => {
    if (treatmentLinkType !== "existing" && watch("treatmentSelection")) {
      setValue("treatmentSelection", "", { shouldDirty: true });
    }
  }, [setValue, treatmentLinkType, watch]);

  const providers = useMemo(() => {
    const rows = partnerData?.data || [];
    return rows.map((provider, index) => ({
      ...provider,
      syntheticLoad: ((provider?.rating?.totalReviews || 0) + index * 7) % 100,
      completionRate: Math.max(68, 92 - (index % 5) * 4),
    }));
  }, [partnerData]);

  const recommendedProviderId = useMemo(() => {
    if (!providers.length) return "";
    const sorted = [...providers].sort((a, b) => {
      const ratingA = Number(a?.rating?.average || 0);
      const ratingB = Number(b?.rating?.average || 0);
      if (ratingB !== ratingA) return ratingB - ratingA;
      return Number(a.syntheticLoad || 0) - Number(b.syntheticLoad || 0);
    });
    return sorted[0]?._id || "";
  }, [providers]);

  const slotData = useMemo(() => {
    if (!selectedService) return [];
    const providerCount = providers.length;
    const category = watch("category") || selectedService.category;

    if (category === "nursing") return buildNursingSlots(selectedService, providerCount);
    if (category === "equipment") return buildEquipmentSlots(selectedService, providerCount);
    return buildConsultationSlots(selectedService, providerCount);
  }, [selectedService, providers.length, watch]);

  const groupedSlots = useMemo(() => groupedByPeriod(slotData), [slotData]);

  const selectedSlot = useMemo(
    () => slotData.find((item) => item.startTime === watch("startTime")) || null,
    [slotData, watch]
  );

  const patientInsights = useMemo(() => {
    if (!selectedPatient) return {};
    const allergyCount = Array.isArray(selectedPatient?.allergies)
      ? selectedPatient.allergies.length
      : Array.isArray(selectedPatient?.medicalHistory)
      ? selectedPatient.medicalHistory.length
      : 0;

    return {
      city:
        patientAddressOptions.find((item) => item.value === selectedAddressId)?.city ||
        selectedPatient?.address?.city ||
        "Not provided",
      allergyCount,
      activeTreatments: treatmentOptions.filter((item) => ["Active", "InProgress"].includes(item.status)).length,
      overdueInvoices: 0,
      pastAppointments: 0,
      riskLevel: allergyCount > 2 ? "high" : "low",
      lastBookingLabel: "Operational data sync pending",
      age: computeAge(selectedPatient?.dateOfBirth),
    };
  }, [selectedPatient, selectedAddressId, patientAddressOptions, treatmentOptions]);

  const selectedProvider = useMemo(
    () => providers.find((item) => item._id === watch("servicePartnerId")) || null,
    [providers, watch]
  );

  const pricingPreview = useMemo(() => {
    const base = Number(selectedService?.basePrice || 0);
    const equipment = Number(selectedService?.equipmentCharges || 0);
    const taxRate = Number(selectedService?.taxPercentage || 0);
    const discount = 0;
    const subtotal = base + equipment - discount;
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;

    return { base, equipment, tax, discount, total };
  }, [selectedService]);

  const validationChecks = useMemo(() => {
    const values = getValues();
    return [
      { key: "patient", ok: Boolean(values.patientId), label: "Patient selected" },
      { key: "service", ok: Boolean(values.serviceId), label: "Service selected" },
      {
        key: "treatment",
        ok:
          values.treatmentLinkType !== "existing" ||
          (values.treatmentLinkType === "existing" && Boolean(values.treatmentSelection)),
        label: "Treatment linkage resolved",
      },
      { key: "slot", ok: Boolean(values.startTime), label: "Scheduling slot selected" },
      { key: "provider", ok: providers.length > 0, label: "Provider network available" },
      { key: "address", ok: Boolean(values.addressId), label: "Address context captured" },
    ];
  }, [getValues, providers.length]);

  const validationProgress = useMemo(() => {
    const ok = validationChecks.filter((item) => item.ok).length;
    return validationChecks.length ? (ok / validationChecks.length) * 100 : 0;
  }, [validationChecks]);

  const risks = useMemo(() => {
    const list = [];
    if (!selectedProvider) list.push({ key: "Provider Assignment", level: "medium", message: "No provider selected yet." });
    if (selectedSlot?.risk === "high") list.push({ key: "Slot Traffic", level: "high", message: "Selected slot has high traffic risk." });
    if (patientInsights.riskLevel === "high") list.push({ key: "Patient Risk", level: "high", message: "Patient has elevated risk/allergy markers." });
    if (pricingPreview.total > 5000) list.push({ key: "Billing", level: "medium", message: "High-value booking requires payment attention." });
    if (!list.length) list.push({ key: "Operational Risk", level: "low", message: "No immediate risk flags." });
    return list;
  }, [selectedProvider, selectedSlot, patientInsights.riskLevel, pricingPreview.total]);

  const impactPreview = useMemo(() => {
    const treatmentResult =
      treatmentLinkType === "existing"
        ? `Link to ${selectedTreatment ? selectedTreatment.label : "selected treatment"}`
        : treatmentLinkType === "new"
        ? "Create new treatment and initialize session"
        : "Create isolated treatment session workflow";

    const outcomes = [
      `Session slot ${selectedSlot ? `${selectedSlot.startTime}-${selectedSlot.endTime}` : "to be finalized"} will be created`,
      `Treatment remains ${treatmentLinkType === "existing" ? selectedTreatment?.status || "Active" : "Active"}`,
      "Invoice generation triggered after treatment completion",
      selectedProvider ? "Provider assignment confirmed" : "Provider assignment pending",
    ];

    return {
      bookingStatus: "Approved (System Managed)",
      sessionNumber: selectedTreatment ? `#${Number(selectedTreatment.sessionsCount || 0) + 1}` : "Auto",
      treatmentResult,
      providerResult: selectedProvider ? `${selectedProvider.firstName} ${selectedProvider.lastName}` : "Not assigned",
      paymentStage: PAYMENT_STAGES[watch("category")] || "Advance/Final",
      outcomes,
    };
  }, [selectedSlot, selectedProvider, selectedTreatment, treatmentLinkType, watch]);

  const warnings = useMemo(() => risks.filter((item) => item.level !== "low").map((item) => item.message), [risks]);

  const treatmentHealth = useMemo(() => {
    const total = Number(selectedTreatment?.sessionsCount || 0) + 1;
    const completed = selectedTreatment?.sessionsCount || 0;
    const pending = Math.max(total - completed, 0);
    return {
      total,
      completed,
      pending,
      expiryRisk: selectedTreatment?.validTill ? "Monitor" : "Unknown",
      adherence: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [selectedTreatment]);

  const bookingSummary = useMemo(() => {
    const patientName = selectedPatient
      ? [selectedPatient.firstName, selectedPatient.lastName].filter(Boolean).join(" ")
      : "Not selected";
    const providerName = selectedProvider
      ? `${selectedProvider.firstName || ""} ${selectedProvider.lastName || ""}`.trim()
      : "Unassigned";

    return {
      patientName,
      providerName,
      slot: selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "Not selected",
      serviceName: selectedService?.name || "Not selected",
      duration:
        selectedSlot && selectedSlot.startTime && selectedSlot.endTime
          ? `${Math.max(toMinutes(selectedSlot.endTime) - toMinutes(selectedSlot.startTime), 0)} mins`
          : `${selectedService?.defaultDuration || 30} mins`,
      address:
        patientAddressOptions.find((item) => item.value === selectedAddressId)?.street || "Not selected",
    };
  }, [selectedPatient, selectedProvider, selectedSlot, selectedService, patientAddressOptions, selectedAddressId]);

  const saveDraftToStorage = useCallback((values, showToast = false) => {
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ values, savedAt: new Date().toISOString() })
      );
      setAutosaveState("saved");
      if (showToast) toast.success("Appointment draft saved");
    } catch {
      setAutosaveState("error");
      if (showToast) toast.error("Failed to save draft");
    }
  }, [draftStorageKey]);

  useEffect(() => {
    const raw = localStorage.getItem(draftStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.values) {
        const hydrated = {
          ...APPOINTMENT_DEFAULT_VALUES,
          ...parsed.values,
          patientId: lockPatientSelection && initialPatientId ? initialPatientId : parsed.values.patientId,
          appointmentDate: parsed.values.appointmentDate
            ? new Date(parsed.values.appointmentDate)
            : "",
        };
        reset(hydrated);
        setAutosaveState("saved");
      }
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, initialPatientId, lockPatientSelection, reset]);

  useEffect(() => {
    if (!form.formState.isDirty) return;
    setAutosaveState("saving");
    const timeout = setTimeout(() => {
      saveDraftToStorage(getValues(), false);
    }, DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [form.formState.isDirty, getValues, saveDraftToStorage, watchedValues]);

  const onInjectTemplate = useCallback(
    (template) => {
      const current = getValues("notes") || "";
      setValue("notes", current ? `${current}\n${template}` : template, { shouldDirty: true });
    },
    [getValues, setValue]
  );

  const handleAutoAssign = useCallback(() => {
    if (!recommendedProviderId) {
      toast.error("No recommended provider available for this slot");
      return;
    }
    setValue("servicePartnerId", recommendedProviderId, { shouldDirty: true });
    toast.success("Best matching provider auto-assigned");
  }, [recommendedProviderId, setValue]);

  const handleSlotSelect = useCallback(
    (slot) => {
      setValue("endTime", slot.endTime, { shouldDirty: true, shouldValidate: true });
      toast.success(`Slot selected: ${slot.startTime} - ${slot.endTime}`);
    },
    [setValue]
  );

  const handleCreate = useCallback(
    async (values) => {
      const selectedAddress = patientAddressOptions.find((item) => item.value === values.addressId);
      const createNewTreatment = values.treatmentLinkType !== "existing";
      const apiData = {
        serviceId: values.serviceId,
        patientId: values.patientId,
        addressId: values.addressId,
        appointmentDate: format(new Date(values.appointmentDate), "yyyy-MM-dd"),
        startTime: values.startTime,
        endTime: values.endTime || selectedSlot?.endTime,
        category: values.category,
        modes: values.modes ? [values.modes] : [],
        servicePartnerId: values.servicePartnerId || undefined,
        cityId: values.cityId || selectedAddress?.cityId || undefined,
        notes: values.notes,
        urgency: values.urgency,
        internalTag: values.internalTag,
        treatmentId: values.treatmentLinkType === "existing" ? values.treatmentSelection : undefined,
        createNewTreatment,
        standaloneSession: values.treatmentLinkType === "standalone",
      };

      const response = await createBooking(apiData);
      localStorage.removeItem(draftStorageKey);
      setAutosaveState("idle");
      const target =
        typeof successHref === "function"
          ? successHref({ patientId: values.patientId, response })
          : successHref;
      router.push(target || "/admin/appointments");
    },
    [createBooking, draftStorageKey, patientAddressOptions, router, selectedSlot, successHref]
  );

  const submitCreate = useMemo(() => handleSubmit(handleCreate), [handleSubmit, handleCreate]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveDraftToStorage(getValues(), true);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        submitCreate();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [getValues, saveDraftToStorage, submitCreate]);

  return (
    <Form {...form}>
      <div className="space-y-5 pb-16">
        <AppointmentWorkspaceHeader
          autosaveState={autosaveState}
          validationProgress={validationProgress}
          isSubmitting={isPending}
          onSaveDraft={() => saveDraftToStorage(getValues(), true)}
          onCreate={submitCreate}
          backHref={backHref}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#DBEAFE] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">Step 1 - Patient + Service Context</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-2xl border border-[#E2E8F0] bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm text-[#0F172A]">Patient Selection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lockPatientSelection ? (
                      <div className="space-y-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#1D4ED8]">Preselected Patient Context</p>
                        <p className="text-sm font-semibold text-[#0F172A]">
                          {selectedPatient
                            ? [selectedPatient.firstName, selectedPatient.lastName].filter(Boolean).join(" ") || "Patient selected"
                            : "Loading patient profile..."}
                        </p>
                        <p className="text-xs text-[#334155]">
                          Patient is locked from patient-booking flow.
                        </p>
                      </div>
                    ) : (
                      <CustomCombobox
                        items={patientOptions}
                        value={watch("patientId")}
                        onChange={(value) => setValue("patientId", value, { shouldDirty: true })}
                        onOpenChange={setIsPatientSelectorOpen}
                        placeholder="Select patient"
                        searchPlaceholder="Search patients"
                        variant="patient"
                        className="w-full"
                        dropdownClassName="w-[440px]"
                        search={search}
                        setSearch={setSearch}
                      />
                    )}
                  </CardContent>
                </Card>

                <ServiceSelectorWorkspace
                  control={control}
                  services={services}
                  selectedService={selectedService}
                  providerCount={providers.length}
                />
              </div>

              {selectedPatient ? <div className="mt-4"><PatientWorkspaceCard patient={selectedPatient} patientInsights={patientInsights} /></div> : null}
            </section>

            <section className="rounded-2xl border border-[#DBEAFE] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">Step 2 - Treatment Linkage</p>
              <TreatmentLinkagePanel
                control={control}
                treatmentOptions={treatmentOptions}
                selectedTreatment={selectedTreatment}
                treatmentLinkType={treatmentLinkType}
              />
            </section>

            <section className="rounded-2xl border border-[#DBEAFE] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">Step 3 - Scheduling & Provider Matching</p>

              <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs text-[#64748B]">Appointment Date</p>
                  <DatePicker
                    value={watch("appointmentDate")}
                    onChange={(date) => setValue("appointmentDate", date, { shouldDirty: true, shouldValidate: true })}
                    disabled={{ before: new Date() }}
                  />
                </div>
                <SimpleSelect
                  label="Category"
                  value={watch("category")}
                  onChange={(val) => setValue("category", val, { shouldDirty: true })}
                  options={[
                    { value: "consultation", label: "Consultation" },
                    { value: "nursing", label: "Nursing" },
                    { value: "equipment", label: "Equipment" },
                  ]}
                />
                <SimpleSelect
                  label="Mode"
                  value={watch("modes")}
                  onChange={(val) => setValue("modes", val, { shouldDirty: true })}
                  options={[
                    { value: "Home Service", label: "Home Service" },
                    { value: "Visit Provider Location", label: "Visit Provider Location" },
                  ]}
                />
                <SimpleSelect
                  label="City"
                  value={watch("cityId")}
                  onChange={(val) => setValue("cityId", val, { shouldDirty: true })}
                  options={(cityData?.data || []).map((city) => ({ value: city._id, label: city.name }))}
                />
              </div>

              <SmartSlotPicker control={control} groupedSlots={groupedSlots} onSelectSlot={handleSlotSelect} />

              <div className="mt-4">
                <ProviderRecommendationPanel
                  control={control}
                  providers={providers}
                  recommendedProviderId={recommendedProviderId}
                  onAutoAssign={handleAutoAssign}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[#DBEAFE] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">Step 4 - Address & Workflow Impact</p>
              <AddressSelectionGrid control={control} addresses={patientAddressOptions} patientId={selectedPatient?._id} />
              <div className="mt-4">
                <NotesWorkspace control={control} onInjectTemplate={onInjectTemplate} />
              </div>
              <div className="mt-4">
                <BookingImpactPreview impact={impactPreview} warnings={warnings} />
              </div>
            </section>
          </div>

          <div className="space-y-4 xl:sticky xl:top-[var(--sticky-offset-sidebar)] xl:self-start">
            <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90">
              <CardHeader>
                <CardTitle className="text-sm text-[#0F172A]">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <SummaryRow label="Patient" value={bookingSummary.patientName} />
                <SummaryRow label="Provider" value={bookingSummary.providerName} />
                <SummaryRow label="Slot" value={bookingSummary.slot} />
                <SummaryRow label="Service" value={bookingSummary.serviceName} />
                <SummaryRow label="Duration" value={bookingSummary.duration} />
                <SummaryRow label="Address" value={bookingSummary.address} />
              </CardContent>
            </Card>

            <PaymentPreviewSidebar pricing={pricingPreview} />
            <TreatmentHealthPanel health={treatmentHealth} />
            <BookingRiskPanel risks={risks} />
            <WorkflowTimelinePreview currentStep={selectedProvider ? 2 : 1} />

            <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90">
              <CardHeader>
                <CardTitle className="text-sm text-[#0F172A]">Realtime Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {validationChecks.map((check) => (
                  <div
                    key={check.key}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm ${check.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}
                  >
                    {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>{check.label}</span>
                  </div>
                ))}
                <InlineSyncIndicator
                  state={isPending ? "processing" : "idle"}
                  label={isPending ? "Submitting create workflow" : "Ready for orchestration"}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {isMobile ? (
          <Drawer open={previewOpen} onOpenChange={setPreviewOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="fixed bottom-20 right-4 z-30">
                <ClipboardList className="mr-1 h-4 w-4" />
                View Summary
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[84vh]">
              <DrawerHeader>
                <DrawerTitle>Booking Intelligence Summary</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-3 overflow-y-auto px-4 pb-4">
                <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90">
                  <CardContent className="space-y-2 p-3 text-sm">
                    <SummaryRow label="Patient" value={bookingSummary.patientName} />
                    <SummaryRow label="Provider" value={bookingSummary.providerName} />
                    <SummaryRow label="Slot" value={bookingSummary.slot} />
                    <SummaryRow label="Service" value={bookingSummary.serviceName} />
                  </CardContent>
                </Card>
                <PaymentPreviewSidebar pricing={pricingPreview} />
                <TreatmentHealthPanel health={treatmentHealth} />
                <BookingRiskPanel risks={risks} />
              </div>
            </DrawerContent>
          </Drawer>
        ) : null}

        <StickyActionFooter
          isSubmitting={isPending}
          onCancel={() => router.push(backHref)}
          onSaveDraft={() => saveDraftToStorage(getValues(), true)}
          onPreview={() => setPreviewOpen((prev) => !prev)}
          onCreate={submitCreate}
        />

        {previewOpen && !isMobile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed right-5 top-[120px] z-40 w-[360px]"
          >
            <Card className="rounded-2xl border border-[#BFDBFE] bg-white/95 shadow-xl">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-sm">Booking Preview Snapshot</CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setPreviewOpen(false)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <SummaryRow label="Patient" value={bookingSummary.patientName} />
                <SummaryRow label="Service" value={bookingSummary.serviceName} />
                <SummaryRow label="Slot" value={bookingSummary.slot} />
                <SummaryRow label="Provider" value={bookingSummary.providerName} />
                <SummaryRow label="Total" value={new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(pricingPreview.total || 0)} />
                <SummaryRow label="Impact" value={impactPreview.treatmentResult} />
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </Form>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5">
      <span className="text-xs text-[#64748B]">{label}</span>
      <span className="text-right text-sm font-medium text-[#0F172A]">{value || "-"}</span>
    </div>
  );
}

function SimpleSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-[#64748B]">{label}</p>
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-[#D8DEE8] bg-white px-3 text-sm text-[#0F172A]"
      >
        <option value="">Select</option>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
