"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Star,
  ShieldCheck,
  Building2,
  Stethoscope,
} from "lucide-react";

export const DoctorDetails = ({ doctor }) => {
  if (!doctor) return <p>No doctor data found.</p>;
  const {address}= doctor;

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <Card className="mt-5">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={doctor.profilePhoto} alt={doctor.firstName} />
              <AvatarFallback>{doctor.firstName?.[0] ?? "D"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{doctor.firstName} {doctor.lastName}</CardTitle>
              <p className="text-muted-foreground capitalize">
                {doctor.specialization}
              </p>
              <div className="flex gap-2 mt-1">
                <Badge variant={doctor.isActive ? "default" : "secondary"}>
                  {doctor.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  variant={
                    doctor.verificationStatus === "approved"
                      ? "success"
                      : doctor.verificationStatus === "pending"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {doctor.verificationStatus}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Star className="text-yellow-500" />
            <p>
              {doctor.averageRating.toFixed(1)} ({doctor.totalReviews})
            </p>
          </div>
        </CardHeader>

        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{doctor.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{doctor.phone}</span>
          </div>
         {address && <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {/* {address?.street}, {address?.city}, {address?.state}, {address?.pincode}, {address?.country} */}
              {address}
            </span>
          </div>}
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span>Medical Reg. No: {doctor.medicalRegistrationNumber}</span>
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" /> Professional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <p>
            <strong>Specialization:</strong> {doctor.specialization}
          </p>
          <p>
            <strong>Issuing Council:</strong> {doctor.issuingMedicalCouncil}
          </p>
          <p>
            <strong>Experience:</strong> {doctor.yearsOfExperience} years
          </p>
          <p>
            <strong>Consultation Fee:</strong> ₹{doctor.consultationFees}
          </p>
          {doctor.subSpecialties?.length > 0 && (
            <p>
              <strong>Sub-specialties:</strong>{" "}
              {doctor.subSpecialties.join(", ")}
            </p>
          )}
          <p>
            <strong>Bio:</strong> {doctor.professionalBio}
          </p>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>University:</strong> {doctor.university}
          </p>
          <p>
            <strong>Graduation Year:</strong> {doctor.graduationYear}
          </p>
          {doctor.degrees?.length > 0 && (
            <p>
              <strong>Degrees:</strong> {doctor.degrees.join(", ")}
            </p>
          )}
          {doctor.certifications?.length > 0 && (
            <p>
              <strong>Certifications:</strong>{" "}
              {doctor.certifications.join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Clinics */}
      {doctor.clinics?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Clinics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {doctor.clinics.map((clinic, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <p className="font-semibold">{clinic.clinicName}</p>
                <p className="text-sm text-muted-foreground">
                  {clinic.address?.street}, {clinic.address?.city}
                </p>
                <p>
                  <strong>Phone:</strong> {clinic.contactInfo?.phone} |{" "}
                  <strong>Email:</strong> {clinic.contactInfo?.email}
                </p>
                {clinic.operatingHours?.length > 0 && (
                  <div>
                    <p className="font-semibold mt-2">Operating Hours:</p>
                    <ul className="list-disc list-inside">
                      {clinic.operatingHours.map((oh, j) => (
                        <li key={j}>
                          {oh.day}:{" "}
                          {oh.slots.map((s, k) => (
                            <span key={k}>
                              {s.startTime} - {s.endTime}
                              {k !== oh.slots.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Status:</strong> {doctor.verificationStatus}
          </p>
          {doctor.rejectionReason && (
            <p>
              <strong>Reason:</strong> {doctor.rejectionReason}
            </p>
          )}
          {doctor.verifiedAt && (
            <p>
              <strong>Verified At:</strong>{" "}
              {new Date(doctor.verifiedAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Social */}
      <Card>
        <CardHeader>
          <CardTitle>Social Stats</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          <p>
            <strong>Followers:</strong> {doctor.followersCount}
          </p>
          <p>
            <strong>Active:</strong> {doctor.isActive ? "Yes" : "No"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
