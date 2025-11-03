"use client";

import { H1 } from "@/components/typography";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { doctorSchema } from "@/schemas/DoctorSchema";
import { Section } from "@/components/shared/section";
import { FormInput } from "@/components/shared/form-input";
import { BackLink } from "@/components/shared/back-link";
import { useApiMutation } from "@/hooks/useApiMutation";
import { POST } from "@/constants/apiMethods";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

export default function AddDoctor() {
  const form = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      gender: "male",
      registrationNo: "",
      council: "",
      specialization: "",
      experience: "",
      fees: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
      degrees: [""],
      university: "",
      graduationYear: "",
      workplace: "",
      designation: "",
      bio: "",
    },
  });

  const router = useRouter();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "degrees",
  });

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: "/admin/doctors/create",
    method: POST,
    invalidateKey: ["doctors"],
  });

  const onSubmit = async (data) => {
    console.log("Doctor Data:", data);
    const apiData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      medicalRegistrationNumber: data.registrationNo,
      issuingMedicalCouncil: data.council,
      specialization: data.specialization,
      dateOfBirth: data.dob,
      gender: data.gender,
      address: {
        street: data.address?.street,
        city: data.address?.city,
        state: data.address?.state,
        country: data.address?.country,
        pincode: data.address?.pincode,
      },

      yearsOfExperience: data.experience,
      consultationFees: data.fees,
      degrees: data.degrees,
      university: data.university,
      graduationYear: data.graduationYear,
      currentWorkplace: data.workplace,
      designation: data.designation,
      professionalBio: data.bio,
    };

    await submitForm(apiData);
  };

  useEffect(() => {
    if (result) {
      console.log("add doctor result", result);
      router.push("/admin/doctors");
    }
  }, [result]);

  return (
    <div className="">
      <div className="mb-8">
        <BackLink href="/admin/doctors">
          <H1>Create a New Doctor Profile</H1>
          <p className="text-[#4c739a] dark:text-slate-400">
            Fill in the details below to add a new doctor to the system.
          </p>
        </BackLink>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="p-6 md:p-8 space-y-10">
              {/* Basic Information */}
              <Section title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    form={form}
                    name="firstName"
                    label="First Name"
                    placeholder="Enter first name"
                  />
                  <FormInput
                    form={form}
                    name="lastName"
                    label="Last Name"
                    placeholder="Enter last name"
                  />
                  <FormInput
                    form={form}
                    name="email"
                    label="Email Address"
                    placeholder="doctor@example.com"
                  />
                  <FormInput
                    form={form}
                    name="phone"
                    label="Phone Number"
                    placeholder="Enter phone number"
                  />
                  <FormInput
                    form={form}
                    name="dob"
                    label="Date of Birth"
                    type="date"
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-6 mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <FormLabel htmlFor="male">Male</FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <FormLabel htmlFor="female">Female</FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <FormLabel htmlFor="other">Other</FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Section>

              <Separator />

              {/* Medical Credentials */}
              <Section title="Medical Credentials">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    form={form}
                    name="registrationNo"
                    label="Medical Registration Number"
                    placeholder="e.g., 123456"
                  />
                  <FormInput
                    form={form}
                    name="council"
                    label="Issuing Medical Council"
                    placeholder="e.g., National Medical Council"
                  />

                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cardiology">
                              Cardiology
                            </SelectItem>
                            <SelectItem value="dermatology">
                              Dermatology
                            </SelectItem>
                            <SelectItem value="neurology">Neurology</SelectItem>
                            <SelectItem value="pediatrics">
                              Pediatrics
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormInput
                    form={form}
                    name="experience"
                    label="Years of Experience"
                    placeholder="e.g., 10"
                    type="number"
                  />
                  <FormInput
                    form={form}
                    name="fees"
                    label="Consultation Fees"
                    placeholder="e.g., 500"
                    type="number"
                  />
                  {/* <FormInput
                    form={form}
                    name="address"
                    label="Address"
                    placeholder="Enter full address"
                  /> */}
                </div>
              </Section>

              <Separator />
              <Section title="Clinic Address">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    form={form}
                    name="address.street"
                    label="Street"
                    placeholder="Enter street name"
                  />
                  <FormInput
                    form={form}
                    name="address.city"
                    label="City"
                    placeholder="Enter city name"
                  />
                  <FormInput
                    form={form}
                    name="address.state"
                    label="State"
                    placeholder="Enter state name"
                  />
                  <FormInput
                    form={form}
                    name="address.country"
                    label="Country"
                    placeholder="Enter country name"
                  />
                  <FormInput
                    form={form}
                    name="address.pincode"
                    label="Pin Code"
                    placeholder="Enter pincode"
                  />
                </div>
              </Section>
              <Separator />

              {/* Educational Background */}
              <Section title="Educational Background">
                <FormField
                  control={form.control}
                  name="degrees"
                  render={() => (
                    <FormItem>
                      <FormLabel>Degrees</FormLabel>
                      <div className="space-y-2">
                        {fields.map((item, index) => (
                          <div key={item.id} className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder={`Degree #${index + 1}`}
                                className="w-[60%]"
                                {...form.register(`degrees.${index}`)}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => append("")}
                        >
                          + Add Degree
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormInput
                      form={form}
                      name="university"
                      label="University"
                      placeholder="Enter university name"
                    />
                  </div>
                  <FormInput
                    form={form}
                    name="graduationYear"
                    label="Graduation Year"
                    placeholder="e.g., 2010"
                    type="number"
                  />
                </div>
              </Section>

              <Separator />

              {/* Professional Details */}
              <Section title="Professional Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    form={form}
                    name="workplace"
                    label="Current Workplace"
                    placeholder="e.g., City General Hospital"
                  />
                  <FormInput
                    form={form}
                    name="designation"
                    label="Designation"
                    placeholder="e.g., Senior Cardiologist"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a short bio about the doctor..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Section>
            </CardContent>

            <div className="p-6 md:p-8 pt-0 flex justify-end">
              <Button
                variant="medico"
                type="submit"
                disabled={isSubmitFormLoading}
              >
                {isSubmitFormLoading ? <Spinner /> : "Create Doctor"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
