import z from "zod";

const phoneRegex = /^[0-9]{10}$/;
const pincodeRegex = /^[0-9]{6}$/;
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const AddServiceProviderSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  ownerName: z.string().optional(),
  age: z.number().min(18).max(70),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),

  mobile: z.string().regex(phoneRegex, "Mobile must be 10 digits"),
  alternateNumber: z.string().regex(phoneRegex).optional().or(z.literal("")),
  landline: z.string().optional(),
  email: z.string().regex(emailRegex, "Invalid email"),

  currentAddress: z.object({
    street: z.string(),
    locality: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string().default("India"),
    pincode: z.string().regex(pincodeRegex),
    landmark: z.string().optional(),
  }),

  permanentAddress: z.object({
    street: z.string(),
    locality: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string().default("India"),
    pincode: z.string().regex(pincodeRegex),
    landmark: z.string().optional(),
    sameAsCurrent: z.boolean().optional(),
  }),

  qualification: z.string().min(1),
  registrationNumber: z.string().min(1),
  registrationCouncil: z.string().min(1),
  yearsOfExperience: z.number().min(0),

  services: z
    .array(
      z.object({
        serviceId: z.string().optional(),
        serviceName: z.string().optional(),
        experienceYears: z.number().min(0),
        specialization: z.string().optional(),
      })
    )
    .min(1, "At least one service is required"),

  // Documents are represented as URLs here — file upload handling is left for integration
  documents: z
    .object({
      profilePhoto: z.string().optional(),
    })
    .optional(),

  bankDetails: z.object({
    accountHolderName: z.string(),
    accountNumber: z.string(),
    ifscCode: z.string(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    upiId: z.string().optional(),
  }),

  availability: z
    .object({
      days: z.array(
        z.enum([
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ])
      ),
      timeSlots: z
        .array(z.object({ startTime: z.string(), endTime: z.string() }))
        .optional(),
      available24x7: z.boolean().optional(),
    })
    .optional(),

  serviceCities: z.array(z.string()).min(1),

  languages: z.array(z.string()).optional(),
  about: z.string().max(500).optional(),
});
