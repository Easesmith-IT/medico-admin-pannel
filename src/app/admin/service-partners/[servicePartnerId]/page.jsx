"use client";

import { DoctorDetails } from "@/components/doctor/doctor-details";
import { ServicePartnerDetailsSkeleton } from "@/components/service-partner/service-partner-detail-skeleton";
import { ServicePartnerDetails } from "@/components/service-partner/service-partner-details";
import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useParams } from "next/navigation";

const provider = {
  _id: "sp1001",
  firstName: "Rohan",
  lastName: "Kapoor",
  ownerName: "HealthPlus Clinic",
  age: 38,
  dateOfBirth: "1987-05-12T00:00:00.000Z",
  gender: "Male",

  mobile: "9876543210",
  alternateNumber: "9123456789",
  landline: "02024561234",
  email: "dr.rohan@example.com",

  currentAddress: {
    street: "MG Road",
    locality: "Camp",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    landmark: "Near City Mall",
  },

  permanentAddress: {
    street: "Main Street",
    locality: "Kothrud",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411038",
    sameAsCurrent: false,
  },

  workAddress: {
    clinicName: "HealthPlus Clinic",
    street: "FC Road",
    locality: "Shivajinagar",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411005",
  },

  services: [
    {
      serviceName: "General Physician",
      specialization: "Internal Medicine",
      experienceYears: 10,
    },
    {
      serviceName: "Diabetes Consultation",
      specialization: "Endocrinology",
      experienceYears: 6,
    },
  ],

  qualification: "MBBS, MD",
  registrationNumber: "MHMC123456",
  registrationCouncil: "Maharashtra Medical Council",
  yearsOfExperience: 12,

  documents: {
    identityProof: { type: "Aadhar", documentNumber: "1234-5678-9012" },
    addressProof: { type: "Rent Agreement" },
  },

  bankDetails: {
    accountHolderName: "Rohan Kapoor",
    accountNumber: "123456789012",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branchName: "Camp Branch",
    upiId: "rohan@upi",
  },

  availability: {
    days: ["Monday", "Tuesday", "Wednesday", "Friday"],
    timeSlots: [
      { startTime: "10:00", endTime: "14:00" },
      { startTime: "17:00", endTime: "20:30" },
    ],
    available24x7: false,
  },

  rating: { average: 4.5, totalReviews: 128 },

  approvalStatus: "Under Review",
  approvedBy: null,
  rejectionReason: "",
  suspensionReason: "",

  isActive: true,
  isVerified: false,
  isAvailable: true,

  emergencyContact: {
    name: "Anil Kapoor",
    relationship: "Brother",
    mobile: "9000000000",
  },

  languages: ["English", "Hindi", "Marathi"],
  about: "Experienced General Physician with over 12 years of practice.",

  createdAt: "2024-11-12T10:00:00.000Z",
  updatedAt: "2024-11-14T15:20:00.000Z",
};

const ServicePartnerPage = () => {
  const params = useParams();

  const { data, isLoading, error } = useApiQuery({
    url: `/serviceProvider/service-provider/${params.servicePartnerId}`,
    queryKeys: ["service-provider"],
  });

  console.log("data", data);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/service-partners" />

      {isLoading && <ServicePartnerDetailsSkeleton />}

      {!isLoading && <ServicePartnerDetails provider={data?.data || ""} />}
    </div>
  );
};

export default ServicePartnerPage;
