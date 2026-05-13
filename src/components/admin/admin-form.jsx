"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FormFooter } from "@/components/shared/form-footer";
import Spinner from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { permissions } from "@/constants/permissions";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

const baseSchema = {
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is too short").max(15, "Phone number is too long"),
  role: z.enum(["subAdmin", "superAdmin"]).default("subAdmin"),
  permissions: z.array(z.string()).default([]),
  status: z.enum(["active", "inactive"]).default("active"),
};

const createAdminSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateAdminSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

const defaults = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "subAdmin",
  permissions: [],
  status: "active",
  password: "",
};

export const AdminForm = ({
  mode = "create",
  defaultValues = {},
  isSubmitting = false,
  onSubmit,
  submitLabel = "Save",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const schema = mode === "edit" ? updateAdminSchema : createAdminSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaults,
      ...defaultValues,
    },
  });

  useUnsavedChangesWarning(form.formState.isDirty);

  const watchRole = form.watch("role");
  const isSuperAdminSelected = watchRole === "superAdmin";

  const effectivePermissionList = useMemo(() => {
    if (isSuperAdminSelected) {
      return permissions.map((item) => item.value);
    }
    return form.getValues("permissions") || [];
  }, [form, isSuperAdminSelected]);

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      permissions:
        values.role === "superAdmin"
          ? permissions.map((item) => item.value)
          : values.permissions || [],
    };

    if (mode === "edit" && !payload.password) {
      delete payload.password;
    }

    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="mx-auto max-w-3xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
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
                      <Input placeholder="Last name" {...field} />
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
                      <Input placeholder="Phone number" {...field} />
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "superAdmin") {
                          form.setValue(
                            "permissions",
                            permissions.map((item) => item.value),
                            { shouldDirty: true }
                          );
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="subAdmin">Sub Admin</SelectItem>
                        <SelectItem value="superAdmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      {mode === "edit" ? "Password (optional)" : "Password"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={
                            mode === "edit"
                              ? "Leave blank to keep existing password"
                              : "Enter password"
                          }
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <div className="mb-2 text-sm font-medium">Permissions</div>
                <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-2">
                  {permissions.map((permission) => (
                    <FormField
                      key={permission.value}
                      control={form.control}
                      name="permissions"
                      render={({ field }) => {
                        const checked =
                          isSuperAdminSelected ||
                          (field.value || []).includes(permission.value);

                        return (
                          <FormItem className="flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={checked}
                                disabled={isSuperAdminSelected}
                                onCheckedChange={(nextChecked) => {
                                  const isEnabled = nextChecked === true;
                                  const current = new Set(field.value || []);
                                  if (isEnabled) current.add(permission.value);
                                  else current.delete(permission.value);
                                  field.onChange(Array.from(current));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer font-normal">
                              {permission.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                {isSuperAdminSelected ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Super admin automatically receives all permissions.
                  </p>
                ) : null}
                {effectivePermissionList.length === 0 && !isSuperAdminSelected ? (
                  <p className="mt-2 text-xs text-amber-600">
                    No permissions selected. This admin will not access gated modules.
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
          <FormFooter className="justify-end">
            <Button variant="medico" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : submitLabel}
            </Button>
          </FormFooter>
        </Card>
      </form>
    </Form>
  );
};
