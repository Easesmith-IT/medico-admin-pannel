"use client";

import { AppointmentCreateWorkspace } from "@/components/appointments/workspace/appointment-create-workspace";
import { useParams } from "next/navigation";

export default function AddPatientBookingPage() {
  const params = useParams();
  const patientId = String(params?.patientId || params?.PatientId || "");

  return (
    <AppointmentCreateWorkspace
      initialPatientId={patientId}
      lockPatientSelection
      backHref={`/admin/patients/${patientId}/bookings`}
      successHref={`/admin/patients/${patientId}/bookings`}
      draftStorageKey={`medico_appointment_workspace_draft_patient_${patientId}`}
    />
  );
}
