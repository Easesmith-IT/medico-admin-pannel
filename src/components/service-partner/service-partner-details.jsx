"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "../shared/info";

export const ServicePartnerDetails = ({ provider }) => {
  return (
    <div className="space-y-6">
      {/* <BackLink href="/admin/service-providers" /> */}

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Service Provider Details</span>
            <Badge>{provider.approvalStatus}</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info
            label="Name"
            value={`${provider.firstName} ${provider.lastName}`}
          />
          <Info label="Owner Name" value={provider.ownerName || "—"} />
          <Info label="Age" value={provider.age} />
          <Info label="Gender" value={provider.gender} />
          <Info
            label="DOB"
            value={new Date(provider.dateOfBirth).toLocaleDateString()}
          />
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Mobile" value={provider.mobile} />
          <Info label="Alternate" value={provider.alternateNumber || "—"} />
          <Info label="Landline" value={provider.landline || "—"} />
          <Info label="Email" value={provider.email} />
        </CardContent>
      </Card>

      {/* Current Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Address</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Street" value={provider.currentAddress.street} />
          <Info label="Locality" value={provider.currentAddress.locality} />
          <Info label="City" value={provider.currentAddress.city} />
          <Info label="State" value={provider.currentAddress.state} />
          <Info label="Pincode" value={provider.currentAddress.pincode} />
          <Info
            label="Landmark"
            value={provider.currentAddress.landmark || "—"}
          />
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Services Offered</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider.services.map((s, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 grid grid-cols-2 gap-4"
            >
              <Info label="Service" value={s.serviceName} />
              <Info label="Specialization" value={s.specialization || "—"} />
              <Info label="Experience" value={`${s.experienceYears} years`} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Qualification" value={provider.qualification} />
          <Info label="Reg. Number" value={provider.registrationNumber} />
          <Info label="Council" value={provider.registrationCouncil} />
          <Info
            label="Experience"
            value={`${provider.yearsOfExperience} years`}
          />
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info
            label="Account Holder"
            value={provider.bankDetails.accountHolderName}
          />
          <Info
            label="Account No."
            value={provider.bankDetails.accountNumber}
          />
          <Info label="IFSC" value={provider.bankDetails.ifscCode} />
          <Info label="Bank" value={provider.bankDetails.bankName || "—"} />
          <Info label="Branch" value={provider.bankDetails.branchName || "—"} />
          <Info label="UPI" value={provider.bankDetails.upiId || "—"} />
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Days" value={provider.availability.days.join(", ")} />
          <Info
            label="Time Slots"
            value={provider.availability.timeSlots
              .map((t) => `${t.startTime} - ${t.endTime}`)
              .join(", ")}
          />
          <Info
            label="Available 24x7"
            value={provider.availability.available24x7 ? "Yes" : "No"}
          />
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Name" value={provider.emergencyContact.name} />
          <Info
            label="Relation"
            value={provider.emergencyContact.relationship}
          />
          <Info label="Mobile" value={provider.emergencyContact.mobile} />
        </CardContent>
      </Card>

      {/* Meta Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meta Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="Languages" value={provider.languages.join(", ")} />
          <Info label="About" value={provider.about || "—"} />
          <Info
            label="Created At"
            value={new Date(provider.createdAt).toLocaleString()}
          />
          <Info
            label="Updated At"
            value={new Date(provider.updatedAt).toLocaleString()}
          />
        </CardContent>
      </Card>
    </div>
  );
};
