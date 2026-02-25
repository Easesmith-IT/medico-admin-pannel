const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  unitPrice: z.coerce.number().min(0, "Unit price must be >= 0"),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters"),

  type: z.enum(["medicine", "equipment", "consumables"], {
    required_error: "Category type is required",
  }),

  description: z.string().optional(),

  items: z.array(itemSchema).min(1, "At least one item is required"),
});
