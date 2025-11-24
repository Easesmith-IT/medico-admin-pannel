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

// ----------------------
// ZOD Schemas (per step)
// ----------------------
export const personalContactSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  ownerName: z.string().optional(),
  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .int()
    .min(18)
    .max(70),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.enum(["Male", "Female", "Other"]),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
  alternateNumber: z.string().optional(),
  landline: z.string().optional(),
  email: z.email(),
});

export const addressSchema = z.object({
  currentAddress: z.object({
    street: z.string(),
    locality: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string().default("India"),
    pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
    landmark: z.string().optional(),
  }),
  permanentAddress: z.object({
    street: z.string(),
    locality: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string().default("India"),
    pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits").optional(),
    landmark: z.string().optional(),
    sameAsCurrent: z.boolean().optional(),
  }),
  workAddress: z.object({
    clinicName: z.string().optional(),
    street: z.string().optional(),
    locality: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional().default("India"),
    pincode: z.string().optional(),
    landmark: z.string().optional(),
  }),
});

export const professionalServiceSchema = z.object({
  qualification: z.string().min(1),
  registrationNumber: z.string().min(1),
  registrationCouncil: z.string().min(1),
  yearsOfExperience: z.coerce.number().min(0),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        serviceName: z.string().optional(),
        experienceYears: z.coerce.number().min(0),
        specialization: z.string().optional(),
      })
    )
    .min(1, "At least one service is required"),
});

export const documentsSchema = z.object({
  identityProof: z
    .object({
      type: z.enum(["Aadhar", "PAN", "Voter ID", "Passport"]),
      documentUrl: z.any().optional(),
      documentNumber: z.string().optional(),
    })
    .optional(),
  addressProof: z
    .object({
      type: z.enum(["Aadhar", "Utility Bill", "Rent Agreement", "Passport"]),
      documentUrl: z.any().optional(),
    })
    .optional(),
  educationalCertificates: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string().optional(),
        year: z.coerce.number().optional(),
        certificateUrl: z.any().optional(),
      })
    )
    .optional(),
  professionalCertificates: z
    .array(
      z.object({
        certificateName: z.string(),
        issuingAuthority: z.string().optional(),
        issueDate: z.date().optional(),
        expiryDate: z.date().optional(),
        certificateUrl: z.any().optional(),
      })
    )
    .optional(),
  registrationCertificate: z
    .object({
      certificateUrl: z.any().optional(),
      issueDate: z.date().optional(),
      expiryDate: z.date().optional(),
    })
    .optional(),
  experienceCertificates: z
    .array(
      z.object({
        organization: z.string().optional(),
        role: z.string().optional(),
        from: z.date().optional(),
        to: z.date().optional(),
        certificateUrl: z.any().optional(),
      })
    )
    .optional(),
  policeVerification: z
    .object({
      certificateUrl: z.any().optional(),
      issueDate: z.date().optional(),
    })
    .optional(),
  profilePhoto: z.any().optional(),
});

export const bankAvailabilitySchema = z.object({
  bankDetails: z.object({
    accountHolderName: z.string().min(1),
    accountNumber: z.coerce.number().min(6),
    ifscCode: z.string().min(4),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    upiId: z.string().optional(),
  }),
  availability: z.object({
    days: z
      .array(
        z.enum([
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ])
      )
      .optional(),
    timeSlots: z
      .array(
        z.object({
          startTime: z.string().optional(),
          endTime: z.string().optional(),
        })
      )
      .optional(),
    available24x7: z.boolean().optional(),
  }),
});

export const finalStepSchema = z.object({
  serviceCities: z.array(z.string()).min(1),
  languages: z.array(z.string()).optional(),
  about: z.string().max(500).optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      mobile: z.string().optional(),
    })
    .optional(),
  isAvailable: z.boolean().optional(),
});

// export const fullSchema = personalContactSchema
//   .extend(addressSchema.shape)
//   .extend(professionalServiceSchema.shape)
//   .extend(documentsSchema.shape)
//   .extend(bankAvailabilitySchema.shape)
//   .extend(finalStepSchema.shape);

export const fullSchema = z.object({
  ...personalContactSchema.shape,
  ...addressSchema.shape,
  ...professionalServiceSchema.shape,
  ...documentsSchema.shape,
  ...bankAvailabilitySchema.shape,
  ...finalStepSchema.shape,
});
