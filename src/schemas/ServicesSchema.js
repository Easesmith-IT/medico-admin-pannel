import z from "zod";

const nursingTypeEnum = z.union([
  z.enum(["hourly", "full-day", "full-night", "12-hour", "24-hour"]),
  z.null(),
]);

export const serviceSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    category: z.enum(["consultation", "nursing", "equipment"], {
      required_error: "Category is required",
    }),
    nursingType: nursingTypeEnum.optional(),
    description: z.string().min(5, "Description is required"),
    basePrice: z.coerce.number().min(0),
    equipmentCharges: z.coerce.number().min(0),
    taxPercentage: z.coerce.number().min(0).max(100),
    modes: z.array(z.enum(["Home Service", "Visit Provider Location"])),
    supportsDuration: z.boolean(),
    defaultDuration: z.coerce.number().optional(),
    durationOptions: z.array(z.coerce.number()).optional(),
    paymentMode: z.enum(["Both", "Prepaid", "COD"]),
    icon: z.any(),
    image: z.any(),
    cities: z.array(z.string()).min(1, "At least one city must be selected"),

    consultationSlots: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      slotDuration: z.number().int().min(1),
    }),

    nursingSlots: z.object({
      enabled: z.boolean().optional(),
      shiftTypes: z.array(z.string()).optional(),
      minDuration: z.number().int().optional(),
      maxDuration: z.number().int().optional(),
      available24x7: z.boolean().optional(),
      allowCustomDuration: z.boolean().optional(),
    }),

    equipmentBooking: z.object({
      enabled: z.boolean(),
      minDuration: z.number().int().min(1),
      maxDuration: z.number().int().min(1),
      available24x7: z.boolean(),
    }),
    timeFormat: z.string(),
  })
  .superRefine((data, ctx) => {
    // Conditional validation (same as Mongoose validator)
    if (data.category === "nursing" && !data.nursingType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nursing type is required for nursing services",
        path: ["nursingType"],
      });
    }
  });

export const UpdateBookingStatusSchema = z.object({
  status: z.string().min(1, "Status required"),
  reason: z.string().min(1),
});
