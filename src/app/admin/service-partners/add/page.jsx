"use client";

import { H1 } from "@/components/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

// shadcn/ui components (assumes your project has them configured)
import { AddServicePartnerStep1 } from "@/components/service-partner/add-steps/add-service-partner-step1";
import { Stepper } from "@/components/service-partner/add-steps/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  addressSchema,
  bankAvailabilitySchema,
  documentsSchema,
  finalStepSchema,
  fullSchema,
  personalContactSchema,
  professionalServiceSchema,
} from "@/schemas/ServiceProviderSchema";
import { useEffect, useState } from "react";
import { AddServicePartnerStep2 } from "@/components/service-partner/add-steps/add-service-partner-step2";
import { AddServicePartnerStep3 } from "@/components/service-partner/add-steps/add-service-partner-step3";
import { AddServicePartnerStep4 } from "@/components/service-partner/add-steps/add-service-partner-step4";
import { AddServicePartnerStep5 } from "@/components/service-partner/add-steps/add-service-partner-step5";
import { AddServicePartnerStep6 } from "@/components/service-partner/add-steps/add-service-partner-step6";
import { useApiMutation } from "@/hooks/useApiMutation";
import { POST } from "@/constants/apiMethods";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

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

const AddServicePartner = () => {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const form = useForm({
    defaultValues,
    resolver: zodResolver(fullSchema),
    mode: "onTouched",
  });

  const { handleSubmit, trigger, formState } = form;

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

  // const onNext = () => {
  //   if (validateStep(step)) {
  //     setStep((s) => Math.min(s + 1, steps.length - 1));
  //   }
  // };

  const onBack = () => setStep((s) => Math.max(s - 1, 0));
  const onError = (error) => {
    console.log("error", error);
  };

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: "/serviceProvider/createservice-provider",
    method: POST,
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
        if (typeof value === "object" && value !== null) {
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
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
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
          issueDate: data.registrationCertificate.issueDate,
          expiryDate: data.registrationCertificate.expiryDate,
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
        from: cert.from,
        to: cert.to,
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
          issueDate: data.policeVerification.issueDate,
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
      <Link
        href="/admin/service-partners"
        className="flex gap-1 items-center mb-4"
      >
        <ArrowLeftIcon className="text-3xl cursor-pointer" />
        <H1>Add Service Partner</H1>
      </Link>

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

export default AddServicePartner;
