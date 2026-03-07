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
        dateOfBirth: dateOfBirth && new Date(dateOfBirth),
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
            issueDate: item?.issueDate && new Date(item?.issueDate),
            expiryDate: item?.expiryDate && new Date(item?.expiryDate),
          })
        ),
        registrationCertificate: {
          ...documents.registrationCertificate,
          issueDate: documents.registrationCertificate?.issueDate && new Date(documents.registrationCertificate?.issueDate),
          expiryDate: documents.registrationCertificate?.expiryDate && new Date(documents.registrationCertificate?.expiryDate),
        },
        experienceCertificates: documents.experienceCertificates?.map(
          (item) => ({
            ...item,
            from: item?.from && new Date(item?.from),
            to: item?.to && new Date(item?.to),
          })
        ),
        policeVerification: documents.policeVerification
          ? {
              ...documents.policeVerification,
              issueDate:
                documents.policeVerification.issueDate &&
                new Date(documents.policeVerification.issueDate),
            }
          : {},
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
    const formData = new FormData();

    /* -----------------------
       NORMAL FIELDS
    -----------------------*/

    Object.entries(data).forEach(([key, value]) => {
      if (
        key !== "profilePhoto" &&
        key !== "identityProof" &&
        key !== "addressProof" &&
        key !== "educationalCertificates" &&
        key !== "professionalCertificates" &&
        key !== "registrationCertificate" &&
        key !== "experienceCertificates" &&
        key !== "policeVerification"
      ) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (typeof value === "object" && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    /* -----------------------
       PROFILE PHOTO
    -----------------------*/

    if (data.profilePhoto instanceof File) {
      formData.append("profilePhoto", data.profilePhoto);
    }

    /* -----------------------
       IDENTITY PROOF
    -----------------------*/

    if (data.identityProof) {
      if (data.identityProof.documentUrl instanceof File) {
        formData.append("identityProofFile", data.identityProof.documentUrl);
      }

      formData.append(
        "identityProof",
        JSON.stringify({
          type: data.identityProof.type,
          documentNumber: data.identityProof.documentNumber,
        })
      );
    }

    /* -----------------------
       ADDRESS PROOF
    -----------------------*/

    if (data.addressProof) {
      if (data.addressProof.documentUrl instanceof File) {
        formData.append("addressProofFile", data.addressProof.documentUrl);
      }

      formData.append(
        "addressProof",
        JSON.stringify({
          type: data.addressProof.type,
        })
      );
    }

    /* -----------------------
       EDUCATIONAL CERTIFICATES
    -----------------------*/

    if (data.educationalCertificates?.length) {
      const meta = data.educationalCertificates.map((cert) => ({
        degree: cert.degree,
        institution: cert.institution,
        year: cert.year,
      }));

      formData.append("educationalCertificates", JSON.stringify(meta));

      data.educationalCertificates.forEach((cert) => {
        if (cert.certificateUrl instanceof File) {
          formData.append("educationalCertificatesFiles", cert.certificateUrl);
        }
      });
    }

    /* -----------------------
       PROFESSIONAL CERTIFICATES
    -----------------------*/

    if (data.professionalCertificates?.length) {
      const meta = data.professionalCertificates.map((cert) => ({
        certificateName: cert.certificateName,
        issuingAuthority: cert.issuingAuthority,
        issueDate: cert.issueDate?.toISOString(),
        expiryDate: cert.expiryDate?.toISOString(),
      }));

      formData.append("professionalCertificates", JSON.stringify(meta));

      data.professionalCertificates.forEach((cert) => {
        if (cert.certificateUrl instanceof File) {
          formData.append("professionalCertificatesFiles", cert.certificateUrl);
        }
      });
    }

    /* -----------------------
       REGISTRATION CERTIFICATE
    -----------------------*/

    if (data.registrationCertificate) {
      if (data.registrationCertificate.certificateUrl instanceof File) {
        formData.append(
          "registrationCertificateFile",
          data.registrationCertificate.certificateUrl
        );
      }

      formData.append(
        "registrationCertificate",
        JSON.stringify({
          issueDate: data.registrationCertificate.issueDate?.toISOString(),
          expiryDate: data.registrationCertificate.expiryDate?.toISOString(),
        })
      );
    }

    /* -----------------------
       EXPERIENCE CERTIFICATES
    -----------------------*/

    if (data.experienceCertificates?.length) {
      const meta = data.experienceCertificates.map((cert) => ({
        organization: cert.organization,
        role: cert.role,
        from: cert.from?.toISOString(),
        to: cert.to?.toISOString(),
      }));

      formData.append("experienceCertificates", JSON.stringify(meta));

      data.experienceCertificates.forEach((cert) => {
        if (cert.certificateUrl instanceof File) {
          formData.append("experienceCertificatesFiles", cert.certificateUrl);
        }
      });
    }

    /* -----------------------
       POLICE VERIFICATION
    -----------------------*/

    if (data.policeVerification) {
      if (data.policeVerification.certificateUrl instanceof File) {
        formData.append(
          "policeVerificationFile",
          data.policeVerification.certificateUrl
        );
      }

      formData.append(
        "policeVerification",
        JSON.stringify({
          issueDate: data.policeVerification.issueDate?.toISOString(),
        })
      );
    }

    /* -----------------------
       SEND REQUEST
    -----------------------*/

    await submitForm(formData);
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
