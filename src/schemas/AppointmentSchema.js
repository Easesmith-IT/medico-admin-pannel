import { z } from "zod";

export const appointmentCategoryEnum = z.enum([
  "consultation",
  "nursing",
  "equipment",
]);

export const appointmentModeEnum = z.enum([
  "Home Service",
  "Visit Provider Location",
]);

export const appointmentFormSchema = z
  .object({
    serviceId: z.string().min(1, "Service is required"),
    patientId: z.string().min(1, "Patient is required"),
    addressId: z.string().min(1, "Address is required"),
    cityId: z.string().optional(),
    treatmentLinkType: z.enum(["existing", "new", "standalone"]),
    treatmentSelection: z.string().optional(),
    appointmentDate: z.date({ required_error: "Appointment date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional(),
    category: appointmentCategoryEnum,
    modes: appointmentModeEnum,
    servicePartnerId: z.string().optional(),
    notes: z.string().optional(),
    urgency: z.enum(["Routine", "Priority", "Critical"]),
    internalTag: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.treatmentLinkType === "existing" && !value.treatmentSelection) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an existing treatment",
        path: ["treatmentSelection"],
      });
    }
  });

export const APPOINTMENT_DEFAULT_VALUES = {
  serviceId: "",
  patientId: "",
  addressId: "",
  cityId: "",
  treatmentLinkType: "existing",
  treatmentSelection: "",
  appointmentDate: "",
  startTime: "",
  endTime: "",
  category: "consultation",
  modes: "Home Service",
  servicePartnerId: "",
  notes: "",
  urgency: "Routine",
  internalTag: "",
};
