import z from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Name is required"),
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
});
