import z from "zod";

export const AddCitySchema = z.object({
  name: z.string().min(2, "Name is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
