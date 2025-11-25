"use client";

import { Stepper } from "@/components/service-partner/add-steps/stepper";
import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { PUT } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import {
  addressSchema,
  bankAvailabilitySchema,
  documentsSchema,
  finalStepSchema,
  fullSchema,
  personalContactSchema,
  professionalServiceSchema,
} from "@/schemas/ServiceProviderSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { AddServicePartnerStep1 } from "@/components/service-partner/add-steps/add-service-partner-step1";
import { AddServicePartnerStep2 } from "@/components/service-partner/add-steps/add-service-partner-step2";
import { AddServicePartnerStep3 } from "@/components/service-partner/add-steps/add-service-partner-step3";
import { AddServicePartnerStep4 } from "@/components/service-partner/add-steps/add-service-partner-step4";
import { AddServicePartnerStep5 } from "@/components/service-partner/add-steps/add-service-partner-step5";
import { AddServicePartnerStep6 } from "@/components/service-partner/add-steps/add-service-partner-step6";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/useApiQuery";
import { Spinner } from "@/components/ui/spinner";

const defaultValues = {
  firstName: "",
  lastName: "",
  ownerName: "",
  age: 25,
  dateOfBirth: "",
  gender: "Male",
  mobile: "",
  alternateNumber: "",
  landline: "",
  email: "",
  currentAddress: {
    street: "",
    locality: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    landmark: "",
  },
  permanentAddress: {
    street: "",
    locality: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    landmark: "",
    sameAsCurrent: false,
  },
  workAddress: {
    clinicName: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    landmark: "",
  },
  qualification: "",
  registrationNumber: "",
  registrationCouncil: "",
  yearsOfExperience: 0,
  services: [
    { serviceId: "", serviceName: "", experienceYears: 0, specialization: "" },
  ],
  profilePhoto: "",
  bankDetails: {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
  },
  availability: {
    days: [],
    timeSlots: [{ startTime: "", endTime: "" }],
    available24x7: false,
  },
  serviceCities: [],
  languages: [],
  about: "",
  emergencyContact: { name: "", relationship: "", mobile: "" },
  isAvailable: true,
};

const UpdatePage = () => {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const params = useParams();

  const form = useForm({
    defaultValues,
    resolver: zodResolver(fullSchema),
    mode: "onTouched",
  });

  const { handleSubmit, trigger, formState, reset } = form;

  const steps = [
    { id: "personal", label: "Personal & Contact" },
    { id: "address", label: "Addresses" },
    { id: "professional", label: "Professional & Services" },
    { id: "documents", label: "Documents" },
    { id: "bankAvailability", label: "Bank & Availability" },
    { id: "final", label: "Service Cities & Misc" },
  ];

  const onNext = async () => {
    console.log("error", formState?.errors);

    let schema;
    switch (step) {
      case 0:
        schema = personalContactSchema;
        break;
      case 1:
        schema = addressSchema;
        break;
      case 2:
        schema = professionalServiceSchema;
        break;
      case 3:
        schema = documentsSchema;
        break;
      case 4:
        schema = bankAvailabilitySchema;
        break;
      case 5:
        schema = finalStepSchema;
        break;
      default:
        console.warn("Invalid step:", step);
        break;
    }

    const valid = await trigger(Object.keys(schema.shape));
    if (valid) {
      setStep(step + 1);
    }
  };

  const onBack = () => setStep((s) => Math.max(s - 1, 0));
  const onError = (error) => {
    console.log("error", error);
  };

  const { data, isLoading, error } = useApiQuery({
    url: `/serviceProvider/service-provider/${params.servicePartnerId}`,
    queryKeys: ["service-provider", params.servicePartnerId],
  });

  console.log("data", data);

  useEffect(() => {
    if (data?.data) {
      const {
        firstName,
        lastName,
        ownerName,
        age,
        dateOfBirth,
        gender,
        mobile,
        alternateNumber,
        landline,
        email,
        currentAddress,
        permanentAddress,
        workAddress,
        qualification,
        registrationNumber,
        registrationCouncil,
        yearsOfExperience,
        services,
        documents,
        bankDetails,
        availability,
        serviceCities,
        languages,
        about,
        emergencyContact,
        isAvailable,
      } = data?.data;
      reset({
        firstName,
        lastName,
        ownerName,
        age,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        mobile,
        alternateNumber,
        landline,
        email,

        currentAddress,
        permanentAddress,
        workAddress,

        qualification,
        registrationNumber,
        registrationCouncil,
        yearsOfExperience,
        services: services.map((service) => ({
          ...service,
          serviceId: service?.serviceId?._id,
        })),

        identityProof: documents.identityProof,
        addressProof: documents.addressProof,
        educationalCertificates: documents.educationalCertificates,
        professionalCertificates: documents.professionalCertificates?.map(
          (item) => ({
            ...item,
            issueDate: new Date(item?.issueDate),
            expiryDate: new Date(item?.expiryDate),
          })
        ),
        registrationCertificate: {
          ...documents.registrationCertificate,
          issueDate: new Date(documents.registrationCertificate?.issueDate),
          expiryDate: new Date(documents.registrationCertificate?.expiryDate),
        },
        experienceCertificates: documents.experienceCertificates?.map(
          (item) => ({
            ...item,
            from: new Date(item?.from),
            to: new Date(item?.to),
          })
        ),
        policeVerification: {
          ...documents.policeVerification,
          issueDate: new Date(documents.policeVerification.issueDate),
        },
        profilePhoto: documents.profilePhoto,

        bankDetails,
        availability,

        serviceCities: serviceCities.map((item) => item?._id),
        languages,
        about,
        emergencyContact,
        isAvailable,
      });
    }
  }, [data]);

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: `/serviceProvider/service-provider/${params.servicePartnerId}`,
    method: PUT,
    invalidateKey: ["service-provider"],
  });

  const onSubmit = async (data) => {
    // Final submit: data is validated by zodResolver already
    console.log("FINAL PAYLOAD", data);
    const documents = {
      addressProof: data.addressProof,
      educationalCertificates: data.educationalCertificates,
      experienceCertificates: data.experienceCertificates,
      identityProof: data.identityProof,
      policeVerification: data.policeVerification,
      professionalCertificates: data.professionalCertificates,
      registrationCertificate: data.registrationCertificate,
    };
    await submitForm({ ...data, documents });
  };

  useEffect(() => {
    if (result) {
      router.push("/admin/service-partners");
    }
  }, [result]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/service-partners">
        <H1>Update Service Provider</H1>
      </BackLink>

      <Stepper steps={steps} step={step} />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          <Card>
            <CardContent>
              {step === 0 && <AddServicePartnerStep1 />}
              {step === 1 && <AddServicePartnerStep2 />}
              {step === 2 && <AddServicePartnerStep3 />}
              {step === 3 && <AddServicePartnerStep4 />}
              {step === 4 && <AddServicePartnerStep5 />}
              {step === 5 && <AddServicePartnerStep6 />}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <div>
              {step > 0 && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={onBack}
                  className="mr-2"
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step < steps.length - 1 && (
                <Button type="button" onClick={onNext}>
                  Next
                </Button>
              )}

              {step === steps.length - 1 && (
                <Button disabled={isSubmitFormLoading} type="submit">
                  {isSubmitFormLoading ? <Spinner /> : "Submit"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdatePage;
