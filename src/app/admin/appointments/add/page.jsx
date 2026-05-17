"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { BackLink } from "@/components/shared/back-link";
import DatePicker from "@/components/shared/DatePicker";
import { H1 } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { buildQuery, generateTimeRange } from "@/lib/utils";
import { format } from "date-fns/format";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CustomCombobox } from "@/components/shared/custom-combobox";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { FormFooter } from "@/components/shared/form-footer";
import { PatientSummaryCard } from "@/components/shared/patient-summary-card";

// -------------------------------
// ZOD SCHEMA
// -------------------------------
const bookingSchema = z.object({
  serviceId: z.string().min(1, "Required"),
  patientId: z.string().min(1, "Required"),
  addressId: z.string().min(1, "Required"),
  treatmentSelection: z.string().min(1, "Required"),
  cityId: z.string().optional(),
  appointmentDate: z.date().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().optional(),
  //   duration: z.coerce.number().min(1),
  servicePartnerId: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().min(1, "Required"),
  // category: z.enum(["nursing", "consultation", "therapy", "other"]),
  modes: z.string(),
});

const objectIdRegex = /^[a-f\d]{24}$/i;

const asText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const resolveLocationValue = (value, lookup = {}) => {
  if (!value) return "Not provided";
  if (typeof value === "object") {
    return value.name || value.label || "Not provided";
  }
  const text = asText(value);
  if (!text) return "Not provided";
  if (lookup[text]) return lookup[text];
  if (objectIdRegex.test(text)) return "Not provided";
  return text;
};

// -------------------------------
// COMPONENT
// -------------------------------
const AddAppointment = () => {
  const [isPatientSelectorOpen, setIsPatientSelectorOpen] = useState(false);
  const [showPatientSelector, setShowPatientSelector] = useState(true);
  const [search, setSearch] = useState("");

  const [patients, setPatients] = useState([]);
  const [treatmentOptions, setTreatmentOptions] = useState([]);
  const router = useRouter();
  const [timeOptions, setTimeOptions] = useState([]);

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "",
      patientId: "",
      addressId: "",
      treatmentSelection: "",
      appointmentDate: "",
      startTime: "",
      endTime: "",
      //   duration: 30,
      servicePartnerId: "",
      notes: "",
      category: "nursing",
      modes: "",
    },
  });
  useUnsavedChangesWarning(form.formState.isDirty);

  const { control, handleSubmit, watch } = form;

  const patientId = watch("patientId");
  const serviceId = watch("serviceId");
  const cityId = watch("cityId");
  const selectedAddressId = watch("addressId");

  const {
    data: serviceData,
    isLoading: isServiceLoading,
    error: serviceError,
    refetch: refetchServices,
  } = useApiQuery({
    url: `/admin/services/names`,
    queryKeys: ["service-admin"],
  });

  const handleServiceChange = (id) => {
    const serviceDoc = serviceData.data.find((item) => item._id === id);
    const { consultationSlots } = serviceDoc?.slotConfig;

    const timeOptions = generateTimeRange(
      consultationSlots?.startTime,
      consultationSlots?.endTime
    );
    setTimeOptions(timeOptions);
  };

  const paitentQuery = buildQuery({
    searchQuery: search,
  });
  const {
    data: patientData,
    isLoading: isPatientLoading,
    error: patientsError,
    refetch: refetchPatients,
  } = useApiQuery({
    url: `/admin/patients/names?${paitentQuery}`,
    queryKeys: ["patients", search, isPatientSelectorOpen],
    options: { enabled: isPatientSelectorOpen },
  });


  useEffect(() => {
    if (patientData) {
      const modifiedPatients = patientData?.data?.map((item) => ({
        value: item._id,
        label: [item.firstName, item.lastName].filter(Boolean).join(" ").trim() || "Unknown Patient",
        fullName:
          [item.firstName, item.lastName].filter(Boolean).join(" ").trim() ||
          "Unknown Patient",
        patientId: `#ID-${String(item._id).slice(0, 4).toUpperCase()}-${String(item._id)
          .slice(-4)
          .toUpperCase()}`,
        phone: item.phone || "Phone not provided",
        city:
          item.address?.city ||
          item.address?.state ||
          item.address?.country ||
          "",
      }));
      setPatients(modifiedPatients);
    }
  }, [patientData]);

  const {
    data: treatmentData,
    isLoading: isTreatmentLoading,
    error: treatmentError,
    refetch: refetchTreatments,
  } = useApiQuery({
    url: `/admin/patients/${patientId}/treatments?serviceId=${serviceId || ""}`,
    queryKeys: ["patient-treatments", patientId, serviceId],
    options: { enabled: false },
  });

  useEffect(() => {
    if (patientId && serviceId) {
      refetchTreatments();
      form.setValue("treatmentSelection", "");
    } else {
      setTreatmentOptions([]);
      form.setValue("treatmentSelection", "");
    }
  }, [patientId, serviceId, refetchTreatments, form]);

  useEffect(() => {
    const treatments = treatmentData?.data || [];
    const options = treatments.map((item) => ({
      value: item._id,
      label: `#${String(item._id).slice(-6).toUpperCase()} • ${item.status} • Sessions ${item.sessionsCount || 0}`,
    }));
    setTreatmentOptions(options);
  }, [treatmentData]);

  const {
    data: selectedPatientData,
    isLoading: isSelectedPatientLoading,
    error: selectedPatientError,
    refetch: refetchSelectedPatient,
  } = useApiQuery({
    url: `/admin/patients/${patientId}`,
    queryKeys: ["patient-profile", patientId],
    options: { enabled: false },
  });

  useEffect(() => {
    if (patientId) {
      refetchSelectedPatient();
    }
  }, [patientId, refetchSelectedPatient]);

  const selectedPatient = selectedPatientData?.data?.patient;
  const selectedPatientOption = selectedPatient
    ? {
        value: selectedPatient._id,
        label:
          [selectedPatient.firstName, selectedPatient.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || "Unknown Patient",
        fullName:
          [selectedPatient.firstName, selectedPatient.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || "Unknown Patient",
        patientId: `#ID-${String(selectedPatient._id)
          .slice(0, 4)
          .toUpperCase()}-${String(selectedPatient._id)
          .slice(-4)
          .toUpperCase()}`,
        phone: selectedPatient.phone || "Phone not provided",
        city:
          selectedPatient.address?.city ||
          selectedPatient.address?.state ||
          selectedPatient.address?.country ||
          "",
      }
    : null;
  const patientSelectorItems = selectedPatientOption
    ? [
        selectedPatientOption,
        ...patients.filter((item) => item.value !== selectedPatientOption.value),
      ]
    : patients;

  const {
    data: cityData,
    isLoading: isCityLoading,
    error: cityError,
    refetch: refetchCities,
  } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });
  const cityLookup = useMemo(() => {
    const lookup = {};
    (cityData?.data || []).forEach((city) => {
      if (city?._id && city?.name) {
        lookup[String(city._id)] = city.name;
      }
    });
    return lookup;
  }, [cityData]);
  const patientAddressOptions = useMemo(() => {
    const rawAddresses = Array.isArray(selectedPatient?.addresses)
      ? selectedPatient.addresses
      : Array.isArray(selectedPatient?.address)
      ? selectedPatient.address
      : selectedPatient?.address
      ? [selectedPatient.address]
      : [];

    return rawAddresses
      .map((address, idx) => {
        const id = address?._id || address?.id || "";
        return {
          value: id,
          isDefault: Boolean(address?.isDefault),
          street: asText(address?.street) || "Not provided",
          city: resolveLocationValue(address?.city, cityLookup),
          state: resolveLocationValue(address?.state, cityLookup),
          country: resolveLocationValue(address?.country, cityLookup),
          pincode: asText(address?.pincode) || "Not provided",
          key: id || `address-${idx}`,
        };
      })
      .filter((address) => Boolean(address.value));
  }, [selectedPatient, cityLookup]);

  const query = buildQuery({
    serviceId,
    cityId,
  });

  const {
    data: partnerData,
    isLoading: isPartnerLoading,
    error: partnerError,
    refetch: refetchPartners,
  } = useApiQuery({
    url: `/admin/service-providers/names?${query}`,
    queryKeys: ["service-provider", serviceId, cityId],
    options: { enabled: false },
  });

  useEffect(() => {
    if (serviceId || cityId) {
      refetchPartners();
    }
  }, [serviceId, cityId, refetchPartners]);

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: "/admin/bookings/create",
    method: POST,
    invalidateKey: ["bookings"],
  });

  const onSubmit = async (data) => {
    const isCreateTreatment = data.treatmentSelection === "__create_new__";
    const apiData = {
      ...data,
      appointmentDate:
        data.appointmentDate &&
        format(new Date(data.appointmentDate), "yyyy-MM-dd"),
      modes: data.modes ? [data.modes] : [],
      cityId: null,
      treatmentId: isCreateTreatment ? undefined : data.treatmentSelection,
      createNewTreatment: isCreateTreatment,
    };
    delete apiData.treatmentSelection;

    await submitForm(apiData);
  };


  useEffect(() => {
    if (result) {
      router.push("/admin/appointments");
    }
  }, [result]);

  useEffect(() => {
    if (patientId) {
      setShowPatientSelector(false);
    } else {
      setShowPatientSelector(true);
      form.setValue("addressId", "");
    }
  }, [patientId, form]);

  useEffect(() => {
    if (!patientId || !patientAddressOptions.length) {
      form.setValue("addressId", "");
      return;
    }

    if (
      selectedAddressId &&
      patientAddressOptions.some((address) => address.value === selectedAddressId)
    ) {
      return;
    }

    const defaultAddress =
      patientAddressOptions.find((address) => address.isDefault)?.value ||
      patientAddressOptions[0].value;
    form.setValue("addressId", defaultAddress || "");
  }, [patientId, patientAddressOptions, selectedAddressId, form]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/appointments">
        <H1>Create Appointment</H1>
      </BackLink>

      <Card className="shadow-md">
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="gap-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Service ID */}
                <FormField
                  control={control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isServiceLoading}
                          value={field.value}
                          key={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleServiceChange(value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceData?.data?.map((item) => (
                              <SelectItem key={item._id} value={item._id}>
                                {item.name}
                              </SelectItem>
                            ))}
                            {serviceData && serviceData.data.length === 0 && (
                              <SelectItem value="__no_services__" disabled>
                                No services found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serviceError ? (
                  <p className="text-sm text-red-600">
                    Unable to load services.{" "}
                    <button type="button" className="underline" onClick={refetchServices}>
                      Retry
                    </button>
                  </p>
                ) : null}

                {/* Patient ID */}
                <FormField
                  control={control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem
                      className={
                        !showPatientSelector
                          ? "md:col-span-2 lg:col-span-3"
                          : ""
                      }
                    >
                      <FormLabel>Patient</FormLabel>
                      <FormControl>
                        {showPatientSelector ? (
                          <CustomCombobox
                            items={patientSelectorItems}
                            value={field.value}
                            onChange={(nextValue) => {
                              field.onChange(nextValue);
                              if (nextValue) {
                                setShowPatientSelector(false);
                              }
                            }}
                            onOpenChange={setIsPatientSelectorOpen}
                            placeholder="Select Patient..."
                            searchPlaceholder="Search patients..."
                            variant="patient"
                            dropdownClassName="w-[420px]"
                            className="w-full"
                            search={search}
                            setSearch={setSearch}
                            loading={isPatientLoading}
                          />
                        ) : selectedPatient ? (
                          <PatientSummaryCard
                            patient={selectedPatient}
                            cityLookup={cityLookup}
                            onChangePatient={() => {
                              setShowPatientSelector(true);
                              setSearch("");
                              form.setValue("addressId", "");
                            }}
                          />
                        ) : (
                          <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-muted-foreground">
                            Loading patient details...
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {patientsError ? (
                  <p className="text-sm text-red-600">
                    Unable to load patients.{" "}
                    <button type="button" className="underline" onClick={refetchPatients}>
                      Retry
                    </button>
                  </p>
                ) : null}

                <FormField
                  control={control}
                  name="treatmentSelection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!patientId || !serviceId || isTreatmentLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select treatment or create new" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__create_new__">
                              + Create New Treatment
                            </SelectItem>
                            {treatmentOptions.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {treatmentError ? (
                  <p className="text-sm text-red-600">
                    Unable to load treatments.{" "}
                    <button type="button" className="underline" onClick={refetchTreatments}>
                      Retry
                    </button>
                  </p>
                ) : null}
              </div>

              {patientId && (
                <FormField
                  control={control}
                  name="addressId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Address</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {patientAddressOptions.map((address) => {
                            const isSelected = field.value === address.value;
                            return (
                              <button
                                key={address.key}
                                type="button"
                                onClick={() => field.onChange(address.value)}
                                className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                                  isSelected
                                    ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm"
                                    : "border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FBFF]"
                                }`}
                              >
                                <div className="space-y-1 text-sm text-[#0F172A]">
                                  <p>
                                    <span className="font-semibold">Street:</span>{" "}
                                    {address.street}
                                  </p>
                                  <p>
                                    <span className="font-semibold">City:</span>{" "}
                                    {address.city}
                                  </p>
                                  <p>
                                    <span className="font-semibold">State:</span>{" "}
                                    {address.state}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Country:</span>{" "}
                                    {address.country}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Pincode:</span>{" "}
                                    {address.pincode}
                                  </p>
                                </div>
                                {address.isDefault && (
                                  <span className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                    Default
                                  </span>
                                )}
                              </button>
                            );
                          })}

                          {patientAddressOptions.length === 0 && (
                            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                              No saved addresses found for this patient.
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {patientId && isSelectedPatientLoading && (
                <div className="flex items-center justify-center py-2">
                  <Spinner />
                </div>
              )}
              {selectedPatientError ? (
                <p className="text-sm text-red-600">
                  Unable to load patient details.{" "}
                  <button type="button" className="underline" onClick={refetchSelectedPatient}>
                    Retry
                  </button>
                </p>
              ) : null}

              <div className="gap-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 col-span-4">
                {/* Appointment Date */}
                <FormField
                  control={control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Date</FormLabel>
                      <FormControl>
                        {/* <Input type="date" {...field} /> */}
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={{ before: new Date() }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Time */}
                {serviceId && (
                  <FormField
                    control={control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          {/* <Input type="time" {...field} /> */}
                          <Select
                            {...field}
                            onValueChange={(e) => {
                              field.onChange(e);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time, index) => (
                                <SelectItem key={index} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* End Time */}
                {serviceId && (
                  <FormField
                    control={control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          {/* <Input type="time" {...field} /> */}
                          <Select
                            {...field}
                            onValueChange={(e) => {
                              field.onChange(e);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time, index) => (
                                <SelectItem key={index} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Duration */}
                {/* <FormField
                  control={control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* Category */}
                <FormField
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consultation">
                            Consultation
                          </SelectItem>
                          <SelectItem value="nursing">Nursing</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Modes - Multiselect */}
                <FormField
                  control={control}
                  name="modes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modes</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-col gap-3 mt-2"
                        >
                          {["Home Service", "Visit Provider Location"].map(
                            (m) => (
                              <FormItem
                                key={m}
                                className="flex items-center space-x-2"
                              >
                                <FormControl>
                                  <RadioGroupItem value={m} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {m}
                                </FormLabel>
                              </FormItem>
                            )
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {serviceId && (
                <div className="border p-4 rounded-md space-y-5">
                  <FormField
                    control={control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isCityLoading}
                            value={field.value}
                            key={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                              {cityData?.data?.map((item) => (
                                <SelectItem key={item._id} value={item._id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                              {cityData && cityData.data.length === 0 && (
                                <SelectItem value="__no_cities__" disabled>
                                  No city found
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {cityError ? (
                    <p className="text-sm text-red-600">
                      Unable to load cities.{" "}
                      <button type="button" className="underline" onClick={refetchCities}>
                        Retry
                      </button>
                    </p>
                  ) : null}
                  <FormField
                    control={control}
                    name="servicePartnerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Select Service Provider
                        </FormLabel>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                          {partnerData?.data?.map((partner) => {
                            const selected = field.value === partner._id;

                            return (
                              <div
                                key={partner._id}
                                onClick={() => {
                                  if (field.value === partner._id) {
                                    field.onChange(""); // <-- DESELECT
                                  } else {
                                    field.onChange(partner._id); // <-- SELECT
                                  }
                                }}
                                className={`
                cursor-pointer border rounded-xl p-4 shadow-sm 
                transition-all duration-200 
                ${
                  selected
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-300 bg-white"
                }
                hover:shadow-md
              `}
                              >
                                {/* Top Section */}
                                <div className="flex items-center gap-3">
                                  {/* Profile Photo */}
                                  {/* <img
                                src={
                                  partner?.documents?.profilePhoto ||
                                  "/placeholder.jpg"
                                }
                                alt="profile"
                                className="w-14 h-14 rounded-full object-cover border"
                              /> */}

                                  <Avatar className="size-14">
                                    <AvatarImage
                                      src={partner?.documents?.profilePhoto}
                                    />
                                    <AvatarFallback>
                                      {partner.firstName ?? "Partner"}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="flex flex-col">
                                    {/* Name */}
                                    <h3 className="font-semibold text-gray-900 text-lg">
                                      {partner.firstName} {partner.lastName}
                                    </h3>

                                    {/* City */}
                                    <p className="text-sm text-gray-600">
                                      {partner?.currentAddress?.city ||
                                        "City not available"}
                                    </p>
                                  </div>
                                </div>

                                {/* Middle Section */}
                                <div className="mt-3 space-y-1 text-sm">
                                  {/* Experience */}
                                  <p className="text-gray-700">
                                    <span className="font-semibold">
                                      Experience:
                                    </span>{" "}
                                    {partner.yearsOfExperience} yrs
                                  </p>

                                  {/* Rating */}
                                  <p className="text-gray-700">
                                    <span className="font-semibold">
                                      Rating:
                                    </span>{" "}
                                    ⭐{" "}
                                    {partner?.rating?.average?.toFixed(1) || 0}{" "}
                                    ({partner?.rating?.totalReviews || 0})
                                  </p>
                                </div>

                                {/* Badge */}
                                <div className="mt-3">
                                  <span
                                    className={`
                    px-2 py-1 rounded-full text-xs font-semibold
                    ${
                      partner.approvalStatus === "Approved"
                        ? "bg-green-100 text-green-700"
                        : partner.approvalStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : partner.approvalStatus === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  `}
                                  >
                                    {partner.approvalStatus}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {isPartnerLoading && <Spinner />}

                          {/* No Providers */}
                          {partnerData && partnerData.data.length === 0 && (
                            <div className="col-span-full text-sm text-muted-foreground">
                              No service providers found
                            </div>
                          )}
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {partnerError ? (
                    <p className="text-sm text-red-600">
                      Unable to load service providers.{" "}
                      <button type="button" className="underline" onClick={refetchPartners}>
                        Retry
                      </button>
                    </p>
                  ) : null}
                </div>
              )}

              {/* Notes */}
              <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Add notes..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <FormFooter className="flex gap-3 justify-end">
                <Button type="submit" className="">
                  {isSubmitFormLoading ? <Spinner /> : "Create Appointment"}
                </Button>
              </FormFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAppointment;
