"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// shadcn/ui components (assumes shadcn setup in the project)
import { H3 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { ArrowLeft, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { VerifyOtpModal } from "@/components/verify-otp-modal";
import { toast } from "sonner";
import Spinner from "@/components/shared/Spinner";

// Zod schema matching the mongoose model fields the user provided
const adminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(15, "Phone number is too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["subAdmin", "superAdmin"]).default("subAdmin"),
  //   permissions: z
  //     .array(
  //       z.enum([
  //         "user_management",
  //         "doctor_verification",
  //         "content_moderation",
  //         "payment_management",
  //         "system_admin",
  //       ])
  //     )
  //     .optional(),
  //   isActive: z.boolean().default(true),
});

const Add = ({ defaultValues }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "subAdmin",
      permissions: [],
      isActive: true,
      ...defaultValues,
    },
  });

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: "/admin/signup",
    method: POST,
    invalidateKey: ["admin-signup"],
  });

  const onSubmit = async (values) => {
    await submitForm(values);
  };

  useEffect(() => {
    if (result) {
      console.log("result", result);
      setOpen(true);
    }
  }, [result]);

  return (
    <Card className="max-w-2xl mx-auto">
      {open && (
        <VerifyOtpModal
          open={open}
          onClose={() => setOpen(false)}
          phone={form.watch("phone")}
          onResend={() => toast.success("OTP resent")}
        />
      )}

      <CardHeader>
        <CardTitle>
          <Link href="/admin/admins" className="flex gap-1 items-center mb-4">
            <ArrowLeft className="text-3xl cursor-pointer" />
            <H3>Create Admin</H3>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* <Button onClick={() => setOpen(true)}>Open Verify OTP Modal</Button> */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="Mansi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@medico.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="6388966722" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        {/* <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#84818C] h-4 w-4" /> */}
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Password"
                          className="pr-10 border-gray-200"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4 cursor-pointer" />
                          ) : (
                            <EyeIcon className="h-4 w-4 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subAdmin">Sub Admin</SelectItem>
                        <SelectItem value="superAdmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                    </FormControl>
                  </FormItem>
                )}
              /> */}
            </div>

            {/* <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: "user_management", label: "User Management" },
                      { key: "doctor_verification", label: "Doctor Verification" },
                      { key: "content_moderation", label: "Content Moderation" },
                      { key: "payment_management", label: "Payment Management" },
                      { key: "system_admin", label: "System Admin" },
                    ].map((p) => (
                      <label key={p.key} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value?.includes(p.key) ?? false}
                          onCheckedChange={(checked) => {
                            const set = new Set(field.value ?? []);
                            if (checked) set.add(p.key);
                            else set.delete(p.key);
                            field.onChange(Array.from(set));
                          }}
                        />
                        <span className="text-sm">{p.label}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <div className="flex justify-end">
              <Button variant="medico" type="submit">
                {isSubmitFormLoading ? <Spinner /> : "Save Admin"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Add;
