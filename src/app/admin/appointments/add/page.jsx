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
import { generateTimeRange } from "@/lib/utils";
import { format } from "date-fns/format";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// -------------------------------
// ZOD SCHEMA
// -------------------------------
const bookingSchema = z.object({
  serviceId: z.string().min(1, "Required"),
  patientId: z.string().min(1, "Required"),
  appointmentDate: z.date().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
  //   duration: z.coerce.number().min(1),
  servicePartnerId: z.string().min(1, "Required"),
  notes: z.string().optional(),
  category: z.enum(["nursing", "consultation", "therapy", "other"]),
  modes: z.array(z.string()),

  cityId: z.string().min(1),
});

// -------------------------------
// COMPONENT
// -------------------------------
const AddAppointment = () => {
  const router = useRouter();
  const [timeOptions, setTimeOptions] = useState([]);

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "",
      patientId: "",
      appointmentDate: "",
      startTime: "",
      endTime: "",
      //   duration: 30,
      servicePartnerId: "",
      notes: "",
      category: "nursing",
      modes: [],
      cityId: "",
    },
  });

  const { control, handleSubmit, watch } = form;

  const serviceId = watch("serviceId");

  const { data: serviceData, isLoading: isServiceLoading } = useApiQuery({
    url: `/admin/services/names`,
    queryKeys: ["service-admin"],
  });

  const handleServiceChange = (id) => {
    const serviceDoc = serviceData.data.find((item) => item._id === id);
    const { consultationSlots } = serviceDoc?.slotConfig;
    console.log("consultationSlots", consultationSlots);

    const timeOptions = generateTimeRange(
      consultationSlots?.startTime,
      consultationSlots?.endTime
    );
    setTimeOptions(timeOptions);
  };

  const { data: patientData, isLoading: isPatientLoading } = useApiQuery({
    url: `/admin/patients/names`,
    queryKeys: ["patient-admin"],
  });

  const { data: cityData, isLoading: isCityLoading } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  const { data: partnerData, isLoading: isPartnerLoading } = useApiQuery({
    url: `/admin/service-providers/names`,
    queryKeys: ["service-provider-admin"],
  });

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
    const apiData = {
      ...data,
      appointmentDate: format(new Date(data.appointmentDate), "yyyy-MM-dd"),
    };
    console.log("Booking Payload:", apiData);

    await submitForm(apiData);
  };

  console.log("partnerData", partnerData);

  useEffect(() => {
    if (result) {
      console.log("result", result);
      router.push("/admin/appointments");
    }
  }, [result]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/appointments">
        <H1>Create Booking</H1>
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
                              <div disabled>No services found</div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Patient ID */}
                <FormField
                  control={control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isPatientLoading}
                          value={field.value}
                          key={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patientData?.data?.map((item) => (
                              <SelectItem key={item._id} value={item._id}>
                                {item.firstName} {item.lastName}
                              </SelectItem>
                            ))}
                            {patientData && patientData.data.length === 0 && (
                              <div disabled>No patients found</div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Partner ID */}
                {/* <FormField
                  control={control}
                  name="servicePartnerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Partner ID</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isPartnerLoading}
                          value={field.value}
                          key={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Service Partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {partnerData?.data?.map((item) => (
                              <SelectItem key={item._id} value={item._id}>
                                {item.firstName} {item.lastName}
                              </SelectItem>
                            ))}
                            {partnerData && partnerData.data.length === 0 && (
                              <div disabled>No service providers found</div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>

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

                {/* City ID */}
                <FormField
                  control={control}
                  name="cityId"
                  render={({ field }) => (
                    <FormItem className="">
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
                            {cityData?.data?.map((c) => (
                              <SelectItem key={c._id} value={c._id}>
                                {c.name}
                              </SelectItem>
                            ))}
                            {cityData && cityData.data.length === 0 && (
                              <div disabled>No cities found</div>
                            )}
                            {/* <SelectItem value="all">All</SelectItem> */}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Modes - Multiselect */}
                <FormField
                  control={control}
                  name="modes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-">
                      <FormLabel>Modes</FormLabel>
                      <div className="flex flex-col gap-3 mt-2">
                        {["Home Service", "Visit Provider Location"].map(
                          (m) => (
                            <label key={m} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={m}
                                checked={field.value?.includes(m)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  if (checked)
                                    field.onChange([...(field.value || []), m]);
                                  else
                                    field.onChange(
                                      field.value.filter((x) => x !== m)
                                    );
                                }}
                              />
                              {m}
                            </label>
                          )
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                                <span className="font-semibold">Rating:</span>{" "}
                                ⭐ {partner?.rating?.average?.toFixed(1) || 0} (
                                {partner?.rating?.totalReviews || 0})
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
              <div className="flex gap-3 justify-end">
                <Button type="submit" className="">
                  {isSubmitFormLoading ? <Spinner /> : "Create Booking"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAppointment;
