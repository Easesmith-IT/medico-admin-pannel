import z from "zod";

export const dateRangeSchema = z
  .object({
    startDate: z.date({
      required_error: "Start date is required",
      invalid_type_error: "Invalid start date",
    }),
    endDate: z.date({
      required_error: "End date is required",
      invalid_type_error: "Invalid end date",
    }),
    format: z.string().min(1, { error: "Format is required" }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"], // attach error to endDate field
  });

export const medicationSchema = z.object({
  medication: z.string().min(1, { error: "Medication is required" }),
});

// Validation schema
const emergencyContactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be 10 digits")
    .optional(),
  relation: z.string().optional(),
});

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(3, "Pincode is required"),
});

export const patientSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  dateOfBirth: z.date().min(1, "Required"),
  gender: z.enum(["male", "female", "other"]).optional(),
  bloodGroup: z.string().optional(),
  profilePhoto: z.url("Must be a valid URL").optional(),
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
});
