"use client";

import { BackLink } from "@/components/shared/back-link";
import MultiSelect from "@/components/shared/MultiSelect";
import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PATCH } from "@/constants/apiMethods";
import { shiftTypesOptions } from "@/constants/service";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { serviceSchema } from "@/schemas/ServicesSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";

function DurationChips({ values = [], selected = [], onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {values.map((d) => {
        const isActive = selected.includes(d);
        return (
          <button
            key={d}
            type="button"
            className={`px-3 py-1 rounded-lg border text-sm transition-all
              ${
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-muted text-muted-foreground hover:shadow"
              }
            `}
            onClick={() => onChange(d)}
          >
            {d} min
          </button>
        );
      })}
    </div>
  );
}

const UpdateService = () => {
  const [imagePreview, setImagePreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");
  const [cities, setCities] = useState([]);
  const router = useRouter();
  const params = useParams();

  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "Nursing",
      description:
        "Professional medical consultation and examination by qualified doctors",
      basePrice: 500,
      equipmentCharges: 0,
      taxPercentage: 18,
      modes: ["Home Service", "Visit Provider Location"],
      supportsDuration: true,
      defaultDuration: 30,
      durationOptions: [30, 45, 60],
      paymentMode: "Both",
      icon: "",
      image: "",
      cities: [],
      nursingSlots: {
        enabled: true,
        shiftTypes: [],
        minDuration: 0,
        maxDuration: 0,
        available24x7: false,
        allowCustomDuration: false,
      },
    },
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState,
    reset,
    getValues,
  } = form;

  const category = watch("category");
  const supportsDuration = watch("supportsDuration");
  console.log("getValues", getValues());

  const { data, isLoading } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  useEffect(() => {
    if (data) {
      const modifiedCities = data?.data?.map((city) => ({
        label: city?.name,
        value: city?._id,
      }));
      setCities(modifiedCities || []);
    }
  }, [data]);

  const { data: serviceData, isLoading: isServiceLoading } = useApiQuery({
    url: `/service/getServiceById/${params.serviceId}`,
    queryKeys: ["service", params.serviceId],
  });

  console.log("serviceData", serviceData);

  useEffect(() => {
    if (serviceData) {
      const service = serviceData?.data;
      reset({
        name: service?.name || "",
        timeFormat: service?.timeFormat || "",
        basePrice: service?.basePrice || 0,
        cities: service?.cities?.map((city) => city?._id) || [],
        description: service?.description || "",
        equipmentCharges: service?.equipmentCharges || 0,
        taxPercentage: service?.taxPercentage || 0,
        modes: service?.modes || [],
        supportsDuration: service?.supportsDuration || false,
        defaultDuration: service?.defaultDuration || 0,
        durationOptions: service?.durationOptions || [],
        paymentMode: service?.paymentMode || "Both",
        category: service?.category || "",
        equipmentBooking: service?.slotConfig.equipmentBooking || {
          enabled: true,
          minDuration: 1,
          maxDuration: 1,
          available24x7: false,
        },
        consultationSlots: service?.slotConfig.consultationSlots || {
          enabled: true,
          startTime: "",
          endTime: "",
          slotDuration: 30,
        },
        nursingSlots: service?.slotConfig.nursingSlots || {
          enabled: true,
          shiftTypes: [],
          minDuration: 0,
          maxDuration: 0,
          available24x7: false,
          allowCustomDuration: false,
        },
        icon: "",
        image: "",
      });
    }
  }, [serviceData]);

  // ===== Dropzones =====
  const onDropImage = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles?.length) return;
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setValue("image", file);
    },
    [setValue]
  );

  const onDropIcon = useCallback(
    (acceptedFiles) => {
      console.log("acceptedFiles", acceptedFiles);

      if (!acceptedFiles?.length) return;
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setIconPreview(url);
      setValue("icon", file);
    },
    [setValue]
  );

  const { getRootProps: getRootImageProps, getInputProps: getInputImageProps } =
    useDropzone({
      onDrop: onDropImage,
      accept: { "image/*": [] },
      maxFiles: 1,
    });

  const { getRootProps: getRootIconProps, getInputProps: getInputIconProps } =
    useDropzone({ onDrop: onDropIcon, accept: { "image/*": [] }, maxFiles: 1 });

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: `/service/services/${serviceData?.data?._id}`,
    method: PATCH,
    invalidateKey: ["service", serviceData?.data?._id],
  });

  // ===== Submit handler =====
  const onSubmit = async (values) => {
    console.log({ values });

    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}[]`, v));
        } else {
          formData.append(key, value);
        }
      }
    });

    const apiData = { ...values, consultationSlots: null, nursingSlots: null };
    const slotConfig = {};

    if (category === "consultation") {
      slotConfig.consultationSlots = values.consultationSlots;
    }

    if (category === "nursing") {
      slotConfig.nursingSlots = values.nursingSlots;
    }

    if (category === "equipment") {
      slotConfig.equipmentBooking = values.equipmentBooking;
    }

    console.log("apiData", { ...apiData, slotConfig });

    await submitForm(values);
  };

  useEffect(() => {
    if (result) {
      console.log("result", result);
      router.push("/admin/services");
    }
  }, [result]);

  const onError = (error) => {
    console.log("error", error);
  };

  return (
    <div className="space-y-6">
      <BackLink href="/admin/services">
        <H1>Update Service</H1>
      </BackLink>

      <Card className="shadow-md">
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name */}
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Service name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="timeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12-hour">12 Hour</SelectItem>
                          <SelectItem value="24-hour">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        key={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
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

                {category === "nursing" && (
                  <FormField
                    control={control}
                    name="nursingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nursing Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select nursing type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="full-day">Full Day</SelectItem>
                            <SelectItem value="full-night">
                              Full Night
                            </SelectItem>
                            <SelectItem value="12-hour">12 Hour</SelectItem>
                            <SelectItem value="24-hour">24 Hour</SelectItem>
                            <SelectItem value="null">None</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {category === "consultation" && (
                  <div className="border p-4 rounded space-y-4 col-span-3">
                    <FormField
                      control={form.control}
                      name="consultationSlots.enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Consultation Enabled</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="consultationSlots.startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="consultationSlots.endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="consultationSlots.slotDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slot Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {category === "nursing" && (
                  <div className="border p-4 rounded space-y-4 col-span-3">
                    {/* Enabled Switch */}
                    <FormField
                      control={form.control}
                      name="nursingSlots.enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Nursing Slots Enabled</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Shift Types */}
                      <FormField
                        control={form.control}
                        name="nursingSlots.shiftTypes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shift Types</FormLabel>
                            <FormControl>
                              <MultiSelect
                                label="Select Shift Type"
                                options={shiftTypesOptions}
                                value={field.value || []}
                                onChange={field.onChange}
                                isLoading={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Min Duration */}
                      <FormField
                        control={form.control}
                        name="nursingSlots.minDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Max Duration */}
                      <FormField
                        control={form.control}
                        name="nursingSlots.maxDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Switches Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 24x7 */}
                      <FormField
                        control={form.control}
                        name="nursingSlots.available24x7"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border p-3 rounded">
                            <FormLabel>Available 24x7</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Allow Custom Duration */}
                      <FormField
                        control={form.control}
                        name="nursingSlots.allowCustomDuration"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border p-3 rounded">
                            <FormLabel>Allow Custom Duration</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {category === "equipment" && (
                  <div className="border p-4 rounded space-y-4 col-span-3">
                    {/* Enabled Switch */}
                    <FormField
                      control={form.control}
                      name="equipmentBooking.enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Equipment Booking Enabled</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Min Duration */}
                      <FormField
                        control={form.control}
                        name="equipmentBooking.minDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Max Duration */}
                      <FormField
                        control={form.control}
                        name="equipmentBooking.maxDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Available 24x7 */}
                      <FormField
                        control={form.control}
                        name="equipmentBooking.available24x7"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border p-3 rounded">
                            <FormLabel>Available 24x7</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* <div className="grid grid-cols-2 gap-5"> */}
                {/* Base Price */}
                <FormField
                  control={control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="cities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Cities</FormLabel>
                      <FormControl>
                        <MultiSelect
                          label="Select Cities"
                          options={cities}
                          value={field.value || []}
                          onChange={field.onChange}
                          isLoading={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* </div> */}

                {/* Description */}
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          // rows={5}
                          placeholder="Short description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Equipment Charges */}
                <FormField
                  control={control}
                  name="equipmentCharges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Charges (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tax Percentage */}
                <FormField
                  control={control}
                  name="taxPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Modes */}
                <FormField
                  control={control}
                  name="modes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-">
                      <FormLabel>Modes</FormLabel>
                      <div className="flex gap-3 mt-2">
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

                {/* Supports Duration */}
                <FormField
                  control={control}
                  name="supportsDuration"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-center">
                      <div className="flex items-center gap-3">
                        <FormLabel>Supports Duration</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(Boolean(v))}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Enable duration options for this service.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration fields */}
                {supportsDuration && (
                  <>
                    <FormField
                      control={control}
                      name="defaultDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="durationOptions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration Options</FormLabel>
                          <FormControl>
                            <DurationChips
                              values={[15, 30, 45, 60, 90]}
                              selected={field.value || []}
                              onChange={(d) => {
                                const exists = field.value?.includes(d);
                                const next = exists
                                  ? field.value.filter((x) => x !== d)
                                  : [...(field.value || []), d].sort(
                                      (a, b) => a - b
                                    );
                                field.onChange(next);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Click to select multiple duration options.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Payment Mode */}
                <FormField
                  control={control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Both">Both</SelectItem>
                          <SelectItem value="Prepaid">Prepaid</SelectItem>
                          <SelectItem value="Postpaid">Postpaid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Icon & Image Uploads */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Icon</FormLabel>
                      <FormControl>
                        <div
                          {...getRootIconProps()}
                          className="border-dashed border rounded p-3 flex items-center justify-center cursor-pointer min-h-[96px]"
                        >
                          <input {...getInputIconProps()} />
                          <div className="flex flex-col items-center gap-2">
                            <UploadCloud />
                            <span className="text-sm">
                              Drop or click to upload icon
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      {iconPreview ? (
                        <div className="mt-2">
                          <img
                            src={iconPreview}
                            alt="icon preview"
                            className="w-20 h-20 object-cover rounded"
                          />
                        </div>
                      ) : null}
                      <FormDescription>
                        PNG/SVG recommended. Max 2MB (demo).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Image</FormLabel>
                      <FormControl>
                        <div
                          {...getRootImageProps()}
                          className="border-dashed border rounded p-3 flex items-center justify-center cursor-pointer min-h-[96px]"
                        >
                          <input {...getInputImageProps()} />
                          <div className="flex flex-col items-center gap-2">
                            <UploadCloud />
                            <span className="text-sm">
                              Drop or click to upload image
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      {imagePreview ? (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="image preview"
                            className="w-full h-40 object-cover rounded"
                          />
                        </div>
                      ) : field.value ? (
                        <div className="mt-2">
                          <img
                            src={field.value}
                            alt="image"
                            className="w-full h-40 object-cover rounded"
                          />
                        </div>
                      ) : null}
                      <FormDescription>
                        Landscape images look best. (demo only)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="submit"
                  disabled={formState.isSubmitting || isSubmitFormLoading}
                  variant="medico"
                >
                  {formState.isSubmitting || isSubmitFormLoading ? (
                    <Spinner />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateService;
