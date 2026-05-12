"use client";

import { DoctorDetails } from "@/components/doctor/doctor-details";
import { StateView } from "@/components/shared/state-view";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useParams } from "next/navigation";

const DoctorDetailsPage = () => {
  const params = useParams();

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/admin/doctors/${params.doctorId}`,
    queryKeys: ["doctors", params.doctorId],
  });

  const doctor = data?.data?.doctor;

  return (
    <div className="space-y-6">
      {isLoading ? <StateView type="loading" rows={8} /> : null}

      {!isLoading && error ? (
        <StateView
          type="error"
          title="Unable to load doctor details"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}

      {!isLoading && !error && !doctor ? (
        <StateView
          type="empty"
          title="Doctor not found"
          description="The requested doctor record is not available."
          actionLabel="Back to doctors"
          actionHref="/admin/doctors"
        />
      ) : null}

      {!isLoading && !error && doctor ? (
        <DoctorDetails doctor={doctor} onRefetch={refetch} />
      ) : null}
    </div>
  );
};

export default DoctorDetailsPage;
