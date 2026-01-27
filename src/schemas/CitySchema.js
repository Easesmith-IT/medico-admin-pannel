import { z } from "zod";

export const AddCitySchema = z.object({
  name: z.string().min(1, "City name is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  geoFence: z
    .array(z.tuple([z.number(), z.number()]))
    .min(3, "Please draw city boundary"),
});
