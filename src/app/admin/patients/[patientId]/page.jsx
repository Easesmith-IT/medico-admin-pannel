"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns/format";
import { motion } from "framer-motion";
import {
  ActivitySquare,
  AlertCircle,
  CalendarClock,
  ClipboardList,
  ContactRound,
  FileText,
  HeartPulse,
  History,
  Mail,
  MapPin,
  NotebookPen,
  PencilLine,
  Phone,
  Pill,
  PlusIcon,
  ShieldAlert,
  Stethoscope,
  UserRound,
  VenusAndMars,
} from "lucide-react";
import { toast } from "sonner";

import { AddMedication } from "@/components/patient/add-medication";
import { Medication } from "@/components/patient/medication";
import PatientDetailsSkeleton from "@/components/patient/patient-details-skeleton";
import { BackLink } from "@/components/shared/back-link";
import { StateView } from "@/components/shared/state-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApiQuery } from "@/hooks/useApiQuery";
import { buildQuery, customId } from "@/lib/utils";

const objectIdRegex = /^[a-f\d]{24}$/i;

const sectionMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: "easeOut" },
};

const ensureText = (value, fallback = "Not provided") => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const resolveLabel = (value, lookup = {}) => {
  if (!value) return "Not provided";
  if (typeof value === "object") {
    return ensureText(value.name || value.label || value.title, "Not provided");
  }
  const raw = String(value).trim();
  if (!raw) return "Not provided";
  if (lookup[raw]) return lookup[raw];
  if (objectIdRegex.test(raw)) return "Not provided";
  return raw;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value, fallback = "Not specified") => {
  const date = parseDate(value);
  return date ? format(date, "dd MMM, yyyy") : fallback;
};

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "PT";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
};

const getAgeLabel = (dob) => {
  const birthDate = parseDate(dob);
  if (!birthDate) return "NA";
  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years -= 1;
  return years >= 0 ? `${years} yrs` : "NA";
};

const getStatusTone = (status = "") => {
  const normalized = String(status).toLowerCase();
  if (["approved", "active", "completed"].includes(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["rejected", "cancelled", "inactive"].includes(normalized)) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const timelineIconMap = {
  appointment: CalendarClock,
  report: FileText,
  medication: Pill,
  note: NotebookPen,
  condition: ActivitySquare,
};

const PatientDetailsPage = () => {
  const params = useParams();
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/admin/patients/${params.patientId}`,
    queryKeys: ["patients", params.patientId],
  });

  const timelineQuery = buildQuery({
    page: 1,
    limit: "50",
    patientId: params.patientId,
  });
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useApiQuery({
    url: `/patient/myTreatmentHistory?${timelineQuery}`,
    queryKeys: ["patient-workspace-timeline", params.patientId],
  });

  const {
    data: cityData,
    isLoading: isCityLookupLoading,
    error: cityLookupError,
    refetch: refetchCityLookup,
  } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  const cityLookup = useMemo(() => {
    const lookup = {};
    (cityData?.data || []).forEach((city) => {
      if (city?._id && city?.name) lookup[String(city._id)] = city.name;
    });
    return lookup;
  }, [cityData]);

  const patient = data?.data?.patient;
  const summary = timelineData?.data?.summary;
  const timeline = timelineData?.data?.timeline || [];

  const fullName =
    [patient?.firstName, patient?.lastName].filter(Boolean).join(" ").trim() ||
    "Unknown patient";
  const ageLabel = getAgeLabel(patient?.dateOfBirth || patient?.dob);
  const gender = ensureText(patient?.gender, "NA");
  const bloodGroup = ensureText(patient?.bloodGroup, "NA");
  const patientPhone = ensureText(patient?.phone, "Phone not provided");
  const patientEmail = ensureText(patient?.email, "Email not available");

  const addresses = useMemo(() => {
    if (!patient) return [];
    const source = Array.isArray(patient.addresses)
      ? patient.addresses
      : Array.isArray(patient.address)
      ? patient.address
      : patient.address
      ? [patient.address]
      : [];

    return source.map((address, index) => ({
      id: address?._id || address?.id || `address-${index}`,
      isDefault: Boolean(address?.isDefault),
      street: ensureText(address?.street),
      city: resolveLabel(address?.city, cityLookup),
      state: resolveLabel(address?.state, cityLookup),
      country: resolveLabel(address?.country, cityLookup),
      pincode: ensureText(address?.pincode),
    }));
  }, [patient, cityLookup]);

  const primaryAddress = addresses.find((address) => address.isDefault) || addresses[0];

  const timelineEvents = useMemo(() => {
    const appointmentEvents = timeline.map((item, index) => ({
      id: item._id || item.id || `appointment-${index}`,
      type: "appointment",
      title: item.serviceName || "Appointment",
      status: item.status || "Pending",
      eventDate: parseDate(item.appointmentDate) || parseDate(item.createdAt),
      chips: [
        item.category ? `Category: ${item.category}` : null,
        item.modes?.length ? `Mode: ${item.modes.join(", ")}` : null,
        item.slotTime?.startTime && item.slotTime?.endTime
          ? `Slot: ${item.slotTime.startTime} - ${item.slotTime.endTime}`
          : null,
      ].filter(Boolean),
      description: item.notes || "No notes attached.",
      meta: item.pricing?.totalAmount ? `Amount: INR ${item.pricing.totalAmount}` : null,
    }));

    const medicationEvents = (patient?.currentMedications || []).map((item, index) => ({
      id: `medication-${index}`,
      type: "medication",
      title: item.medicationName || "Medication",
      status: "Active",
      eventDate: parseDate(item.startDate) || parseDate(item.createdAt),
      chips: [item.dosage ? `Dosage: ${item.dosage}` : null, item.frequency ? `Frequency: ${item.frequency}` : null].filter(Boolean),
      description: item.notes || "Medication added to active treatment plan.",
      meta: item.route ? `Route: ${item.route}` : null,
    }));

    const conditionEvents = (patient?.medicalHistory || []).map((item, index) => ({
      id: `condition-${index}`,
      type: "condition",
      title: item.condition || "Medical condition",
      status: ensureText(item.status, "Monitoring"),
      eventDate: parseDate(item.diagnosedDate) || parseDate(item.updatedAt),
      chips: [item.severity ? `Severity: ${item.severity}` : null].filter(Boolean),
      description: item.notes || "No additional notes.",
      meta: item.diagnosedDate ? `Diagnosed: ${formatDate(item.diagnosedDate)}` : null,
    }));

    const merged = [...appointmentEvents, ...medicationEvents, ...conditionEvents];
    return merged.sort((a, b) => {
      const aTime = a.eventDate ? a.eventDate.getTime() : 0;
      const bTime = b.eventDate ? b.eventDate.getTime() : 0;
      return bTime - aTime;
    });
  }, [timeline, patient]);

  const noteEvents = timelineEvents.filter((item) => item.description && item.description !== "No notes attached.");

  const statCards = [
    { label: "Visits", value: summary?.totalTreatmentVisits || timeline.length || 0, icon: CalendarClock },
    { label: "Medications", value: patient?.currentMedications?.length || 0, icon: Pill },
    { label: "Reports", value: patient?.reports?.length || 0, icon: FileText },
    { label: "Allergies", value: patient?.allergies?.length || 0, icon: AlertCircle },
    { label: "Conditions", value: patient?.medicalHistory?.length || 0, icon: HeartPulse },
  ];

  if (isLoading) return <PatientDetailsSkeleton />;

  if (error) {
    return (
      <StateView
        type="error"
        title="Unable to load patient workspace"
        description={error.message}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  if (!patient) {
    return (
      <StateView
        type="empty"
        title="Patient not found"
        description="The requested patient record is not available."
        actionLabel="Back to patients"
        actionHref="/admin/patients"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      <motion.div {...sectionMotion} className="space-y-3">
        <BackLink href="/admin/patients" />

        <div className="overflow-hidden rounded-[24px] border border-slate-800/40 bg-gradient-to-br from-[#0B1220] via-[#13243F] to-[#1E3A8A] shadow-[0_24px_56px_rgba(15,23,42,0.32)]">
          <div className="space-y-6 p-6 sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <Avatar className="size-20 rounded-2xl border border-white/20 shadow-lg sm:size-24">
                  <AvatarImage src={patient.profilePhoto} />
                  <AvatarFallback className="rounded-2xl bg-white/10 text-xl font-semibold text-white">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                      {fullName}
                    </h1>
                    <Badge variant={patient.isActive ? "success" : "destructive"}>
                      {patient.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <p className="text-sm font-medium tracking-wide text-blue-100/90">
                    {customId(patient?._id)}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <IdentityPill icon={VenusAndMars} value={gender} />
                    <IdentityPill icon={HeartPulse} value={`Blood: ${bloodGroup}`} />
                    <IdentityPill icon={UserRound} value={ageLabel} />
                    <IdentityPill icon={Phone} value={patientPhone} />
                  </div>

                  <p className="flex items-center gap-2 text-sm text-blue-100/90">
                    <MapPin className="h-4 w-4" />
                    {primaryAddress
                      ? `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state}`
                      : "Address not available"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="medico" className="rounded-xl">
                  <Link href={`/admin/patients/${params.patientId}/bookings/add`}>
                    <PlusIcon />
                    Book Appointment
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/15">
                  <Link href={`/admin/patients/${params.patientId}/update`}>
                    <PencilLine />
                    Edit Profile
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                  onClick={() =>
                    toast.info("Upload report workspace will be connected here.")
                  }
                >
                  <FileText />
                  Upload Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <HeroInfoChip icon={Mail} label="Email" value={patientEmail} />
              <HeroInfoChip
                icon={CalendarClock}
                label="Member Since"
                value={formatDate(patient.createdAt)}
              />
              <HeroInfoChip
                icon={History}
                label="Last Updated"
                value={formatDate(patient.updatedAt)}
              />
              <HeroInfoChip
                icon={ContactRound}
                label="Emergency Contact"
                value={ensureText(
                  patient?.emergencyContact?.name || patient?.emergencyContact?.phone,
                  "Not provided"
                )}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={{ ...sectionMotion.transition, delay: 0.02 }}
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
      >
        {statCards.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </motion.div>

      <motion.div
        {...sectionMotion}
        transition={{ ...sectionMotion.transition, delay: 0.04 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-[#E5EAF2] bg-white p-2 shadow-sm">
            <TabsTrigger value="overview" className="h-10 rounded-xl px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="appointments" className="h-10 rounded-xl px-4">
              Appointments
            </TabsTrigger>
            <TabsTrigger value="history" className="h-10 rounded-xl px-4">
              Medical History
            </TabsTrigger>
            <TabsTrigger value="documents" className="h-10 rounded-xl px-4">
              Documents
            </TabsTrigger>
            <TabsTrigger value="billing" className="h-10 rounded-xl px-4">
              Billing
            </TabsTrigger>
            <TabsTrigger value="notes" className="h-10 rounded-xl px-4">
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
              <div className="space-y-3">
                {timelineError ? (
                  <p className="text-sm text-red-600">
                    Unable to load patient timeline.{" "}
                    <button type="button" className="underline" onClick={refetchTimeline}>
                      Retry
                    </button>
                  </p>
                ) : null}
                <MedicalTimelineCard events={timelineEvents} loading={isTimelineLoading} />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoChipGrid
                      items={[
                        { icon: UserRound, label: "Date of Birth", value: formatDate(patient.dateOfBirth) },
                        { icon: ShieldAlert, label: "Blood Group", value: bloodGroup },
                        { icon: Phone, label: "Phone", value: patientPhone },
                        { icon: Mail, label: "Email", value: patientEmail },
                      ]}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Active Medications</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setIsMedicationModalOpen(true)}>
                      <PlusIcon />
                      Add
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {patient.currentMedications?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.currentMedications.map((item, index) => (
                          <Medication key={index} item={item} />
                        ))}
                      </div>
                    ) : (
                      <HealthcareEmpty
                        icon={Pill}
                        title="No active medications"
                        description="Medication plans added by clinicians will appear here."
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Address Book</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isCityLookupLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading city labels...
                      </p>
                    ) : null}
                    {cityLookupError ? (
                      <p className="text-sm text-red-600">
                        Unable to load city labels.{" "}
                        <button type="button" className="underline" onClick={refetchCityLookup}>
                          Retry
                        </button>
                      </p>
                    ) : null}
                    {addresses.length ? (
                      addresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-2xl border border-[#E6ECF5] bg-[#FAFCFF] px-4 py-3"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[#0F172A]">
                              {address.street}
                            </p>
                            {address.isDefault ? (
                              <Badge variant="secondary">Default</Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-[#475569]">
                            {address.city}, {address.state}
                          </p>
                          <p className="text-sm text-[#64748B]">
                            {address.country} - {address.pincode}
                          </p>
                        </div>
                      ))
                    ) : (
                      <HealthcareEmpty
                        icon={MapPin}
                        title="No addresses available"
                        description="Patient addresses will appear here once added."
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Appointments Timeline</CardTitle>
                <Button variant="outline" asChild>
                  <Link href={`/admin/patients/${params.patientId}/bookings`}>
                    Open Full Timeline
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {timelineError ? (
                  <p className="mb-3 text-sm text-red-600">
                    Unable to load appointments timeline.{" "}
                    <button type="button" className="underline" onClick={refetchTimeline}>
                      Retry
                    </button>
                  </p>
                ) : null}
                <MedicalTimelineCard
                  events={timelineEvents.filter((item) => item.type === "appointment")}
                  loading={isTimelineLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Medical Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.medicalHistory?.length ? (
                    <ul className="space-y-3">
                      {patient.medicalHistory.map((entry, index) => (
                        <li
                          key={index}
                          className="rounded-2xl border border-[#E8EEF8] bg-[#FBFDFF] px-4 py-3"
                        >
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {ensureText(entry.condition, "Unnamed condition")}
                          </p>
                          <p className="mt-1 text-xs text-[#64748B]">
                            Diagnosed: {formatDate(entry.diagnosedDate)}
                          </p>
                          <p className="mt-2 text-sm text-[#475569]">
                            {ensureText(entry.notes, "No notes")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <HealthcareEmpty
                      icon={HeartPulse}
                      title="No medical history"
                      description="Longitudinal condition history will appear here."
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Allergies & Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.allergies?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <Badge
                          key={`${allergy}-${index}`}
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700"
                        >
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <HealthcareEmpty
                      icon={ShieldAlert}
                      title="No allergy records"
                      description="No active allergy markers are recorded."
                    />
                  )}

                  <Separator />

                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#334155]">
                      Emergency Contact
                    </p>
                    <InfoChipGrid
                      items={[
                        { icon: UserRound, label: "Name", value: patient?.emergencyContact?.name },
                        { icon: ContactRound, label: "Relation", value: patient?.emergencyContact?.relation || patient?.emergencyContact?.relationship },
                        { icon: Phone, label: "Phone", value: patient?.emergencyContact?.phone },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="py-12">
                <HealthcareEmpty
                  icon={FileText}
                  title="No clinical documents yet"
                  description="Upload reports, discharge summaries, or prescriptions to build the patient document workspace."
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        toast.info("Upload report workspace will be connected here.")
                      }
                    >
                      Upload Report
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Billing Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {timeline.length ? (
                  <div className="space-y-3">
                    {timeline.slice(0, 8).map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6ECF5] bg-[#FCFDFF] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {ensureText(item.serviceName, "Service")}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {formatDate(item.appointmentDate || item.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#0F172A]">
                            INR {item.pricing?.totalAmount || 0}
                          </p>
                          <Badge className={getStatusTone(item.status)}>{item.status || "Pending"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <HealthcareEmpty
                    icon={ClipboardList}
                    title="No billing data"
                    description="Billing entries will appear here after appointments are booked."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Clinical Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {noteEvents.length ? (
                  <div className="space-y-3">
                    {noteEvents.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#E8EEF8] bg-[#FBFDFF] px-4 py-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                          <p className="text-xs text-[#64748B]">
                            {formatDate(item.eventDate)}
                          </p>
                        </div>
                        <p className="text-sm text-[#475569]">{item.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <HealthcareEmpty
                    icon={NotebookPen}
                    title="No notes available"
                    description="Consultation notes and clinical remarks will appear here."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {isMedicationModalOpen ? (
        <AddMedication
          isModalOpen={isMedicationModalOpen}
          setIsModalOpen={setIsMedicationModalOpen}
        />
      ) : null}
    </div>
  );
};

const HeroInfoChip = ({ icon: Icon, label, value }) => (
  <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
    <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-100/80">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </p>
    <p className="break-words text-sm font-medium text-white">{ensureText(value)}</p>
  </div>
);

const IdentityPill = ({ icon: Icon, value }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/95">
    <Icon className="h-3.5 w-3.5" />
    {value}
  </span>
);

const StatCard = ({ label, value, icon: Icon }) => (
  <Card className="gap-3 rounded-2xl py-4">
    <CardContent className="flex items-center justify-between px-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-[-0.01em] text-[#0F172A]">
          {value}
        </p>
      </div>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#2563EB]">
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);

const InfoChipGrid = ({ items = [] }) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {items.map((item) => (
      <div
        key={item.label}
        className="min-w-0 rounded-xl border border-[#EAF0F7] bg-[#FAFCFF] px-3 py-2"
      >
        <p className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
          <item.icon className="h-3.5 w-3.5 text-[#2563EB]" />
          {item.label}
        </p>
        <p className="break-all text-sm font-medium text-[#0F172A]">
          {ensureText(item.value)}
        </p>
      </div>
    ))}
  </div>
);

const MedicalTimelineCard = ({ events = [], loading = false }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">Medical Timeline</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-20 animate-pulse rounded-2xl bg-[#EDF2FA]" />
          ))}
        </div>
      ) : events.length ? (
        <div className="space-y-3 pr-2">
          <Accordion type="single" collapsible className="space-y-3">
            {events.map((event) => {
              const EventIcon = timelineIconMap[event.type] || Stethoscope;
              return (
                <AccordionItem
                  key={event.id}
                  value={event.id}
                  className="rounded-2xl border border-[#E8EEF7] bg-[#FCFDFF] px-4"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex w-full items-start gap-3">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#2563EB]">
                        <EventIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {event.title}
                          </p>
                          <Badge className={getStatusTone(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-[#64748B]">
                          {formatDate(event.eventDate)}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {event.chips?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {event.chips.map((chip, idx) => (
                            <span
                              key={`${event.id}-chip-${idx}`}
                              className="rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#475569]"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-sm text-[#475569]">
                        {ensureText(event.description, "No additional details.")}
                      </p>
                      {event.meta ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                          {event.meta}
                        </p>
                      ) : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      ) : (
        <HealthcareEmpty
          icon={CalendarClock}
          title="No timeline events"
          description="Appointments, prescriptions, and medical updates will appear here."
        />
      )}
    </CardContent>
  </Card>
);

const HealthcareEmpty = ({ icon: Icon, title, description, action = null }) => (
  <Empty className="rounded-2xl border border-dashed border-[#D6E0EE] bg-[#FAFCFF]">
    <EmptyHeader>
      <EmptyMedia variant="icon" className="bg-[#EEF4FF] text-[#2563EB]">
        <Icon />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
    {action}
  </Empty>
);

export default PatientDetailsPage;
