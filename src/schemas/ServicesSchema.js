import z from "zod";

const nursingTypeEnum = z.union([
  z.enum(["hourly", "full-day", "full-night", "12-hour", "24-hour"]),
  z.null(),
]);

const SHIFT_TYPE_ENUM = z.enum([
  "hourly",
  "8-hour",
  "12-hour",
  "24-hour",
  "day-shift",
  "night-shift",
]);

const SLOT_DURATION_ALLOWED = [15, 30, 45, 60];

export const serviceSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    category: z.enum(["consultation", "nursing", "equipment"], {
      required_error: "Category is required",
    }),
    nursingType: nursingTypeEnum.optional(),
    description: z.string().trim().min(5, "Description is required"),
    basePrice: z.coerce.number().min(0),
    equipmentCharges: z.coerce.number().min(0),
    taxPercentage: z.coerce.number().min(0).max(100),
    modes: z
      .array(z.enum(["Home Service", "Visit Provider Location"]))
      .min(1, "Select at least one service mode"),
    supportsDuration: z.boolean(),
    defaultDuration: z.coerce.number().int().min(1).max(1440).optional(),
    durationOptions: z
      .array(z.coerce.number().int().min(1).max(1440))
      .optional(),
    paymentMode: z.enum(["Both", "Prepaid", "Postpaid"]),
    icon: z.any(),
    image: z.any(),
    cities: z.array(z.string()).min(1, "At least one city must be selected"),

    consultationSlots: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      slotDuration: z.coerce
        .number()
        .refine(
          (value) => SLOT_DURATION_ALLOWED.includes(value),
          "Slot duration must be 15, 30, 45, or 60",
        ),
    }),

    nursingSlots: z.object({
      enabled: z.boolean().optional(),
      shiftTypes: z.array(SHIFT_TYPE_ENUM).optional(),
      minDuration: z.coerce.number().int().min(1).max(10080).optional(),
      maxDuration: z.coerce.number().int().min(1).max(10080).optional(),
      available24x7: z.boolean().optional(),
      allowCustomDuration: z.boolean().optional(),
    }),

    equipmentBooking: z.object({
      enabled: z.boolean(),
      minDuration: z.coerce.number().int().min(1).max(10080),
      maxDuration: z.coerce.number().int().min(1).max(10080),
      available24x7: z.boolean(),
    }),
    timeFormat: z.enum(["12-hour", "24-hour"]),
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

    if (data.supportsDuration) {
      if (!data.defaultDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Default duration is required when duration support is enabled",
          path: ["defaultDuration"],
        });
      }
      if (!data.durationOptions?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choose at least one duration option",
          path: ["durationOptions"],
        });
      }
    }

    if (
      data.supportsDuration &&
      data.defaultDuration &&
      data.durationOptions?.length &&
      !data.durationOptions.includes(data.defaultDuration)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default duration must be one of the selected duration options",
        path: ["defaultDuration"],
      });
    }

    if (
      data.nursingSlots?.minDuration &&
      data.nursingSlots?.maxDuration &&
      data.nursingSlots.minDuration > data.nursingSlots.maxDuration
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nursing max duration must be greater than or equal to min duration",
        path: ["nursingSlots", "maxDuration"],
      });
    }

    if (
      data.equipmentBooking?.minDuration &&
      data.equipmentBooking?.maxDuration &&
      data.equipmentBooking.minDuration > data.equipmentBooking.maxDuration
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Equipment max duration must be greater than or equal to min duration",
        path: ["equipmentBooking", "maxDuration"],
      });
    }
  });

export const UpdateBookingStatusSchema = z.object({
  status: z.string().min(1, "Status required"),
  reason: z.string().min(1),
});
