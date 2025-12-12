import z from "zod";

export const doctorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Select gender",
  }),
  registrationNo: z.string().min(1, "Medical registration number is required"),
  council: z.string().min(1, "Issuing council is required"),
  specialization: z.string().min(1, "Select specialization"),
  experience: z.string().min(1, "Enter experience"),
  fees: z.string().min(1, "Enter consultation fees"),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"), // ✅ 6-digit validation
  }),
  degrees: z.array(z.string().min(1, "Degree cannot be empty")),
  university: z.string().min(1, "Enter university"),
  graduationYear: z.string().min(1, "Enter graduation year"),
  workplace: z.string().min(1, "Enter workplace"),
  designation: z.string().min(1, "Enter designation"),
  bio: z.string().min(1, "Bio is required"),
});


export const AddCommentSchema = z.object({
  comment: z.string().min(1, "Required"),
});

