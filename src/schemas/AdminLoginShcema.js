import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  rememberMe: z.boolean().default(false).optional(),
  // phone: z
  //   .string()
  //   .regex(/^[0-9]{10}$/, {
  //     message: "Phone number must be exactly 10 digits.",
  //   }),
});
