"use client";

import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { PATCH } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { patientSchema } from "@/schemas/PatientSchema";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/shared/DatePicker";
import { Spinner } from "@/components/ui/spinner";

const UpdatePatient = () => {
  const router = useRouter();
  const params = useParams();

  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      profilePhoto: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
      emergencyContact: {
        name: "",
        phone: "",
        relation: "",
      },
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState,
    reset,
    getValues,
  } = form;

  const { data, isLoading } = useApiQuery({
    url: `/admin/patients/${params.patientId}`,
    queryKeys: ["patients", params.patientId],
  });

  const patient = data?.data?.patient;
  console.log("patient data", data);

  useEffect(() => {
    if (data) {
      reset({
        firstName: patient?.firstName,
        email: patient?.email,
        phone: patient?.phone,
        dateOfBirth: patient?.dateOfBirth && new Date(patient?.dateOfBirth),
        gender: patient?.gender,
        bloodGroup: patient?.bloodGroup,
        profilePhoto: patient?.profilePhoto,
        address: patient?.address || {
          street: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
        emergencyContact: patient?.emergencyContact || {
          name: "",
          phone: "",
          relation: "",
        },
      });
    }
  }, [data]);

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: `/patient/updateProfile/${patient?._id}`,
    method: PATCH,
    invalidateKey: ["patients", patient?._id],
  });

  // ===== Submit handler =====
  const onSubmit = async (values) => {
    console.log({ values });

    await submitForm(values);
  };

  useEffect(() => {
    if (result) {
      console.log("result", result);
      router.push("/admin/patients");
    }
  }, [result]);

  const onError = (error) => {
    console.log("error", error);
  };

  return (
    <div className="space-y-6">
      <BackLink href="/admin/patients">
        <H1>Update Patient</H1>
      </BackLink>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <Card className="space-y-2">
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
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
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={String(field.value)}
                          key={String(field.value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood group</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. O+" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="profilePhoto"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Profile photo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address group */}
                <div className="sm:col-span-2">
                  <h3 className="mb-2 text-lg font-medium">Address</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street</FormLabel>
                          <FormControl>
                            <Input placeholder="Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="address.pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input placeholder="Pincode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Emergency contact */}
                <div className="sm:col-span-2">
                  <h3 className="mb-2 text-lg font-medium">
                    Emergency contact
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={control}
                      name="emergencyContact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="emergencyContact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="10-digit phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="emergencyContact.relation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relation</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Relation (e.g. Sister)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              {/* <Button type="submit">Save profile</Button> */}
              <Button
                variant="medico"
                type="submit"
                disabled={isSubmitFormLoading}
              >
                {isSubmitFormLoading ? <Spinner /> : "Update"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default UpdatePatient;
