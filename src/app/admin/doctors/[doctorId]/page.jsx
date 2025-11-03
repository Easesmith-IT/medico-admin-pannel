"use client";

import { DoctorDetails } from "@/components/doctor/doctor-details";
import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useParams } from "next/navigation";

const DoctorDetailsPage = () => {
  const params = useParams();

  const { data, isLoading, error } = useApiQuery({
    url: `/admin/doctors/${params.doctorId}`,
    queryKeys: ["doctors"],
  });

  console.log("data", data);

  return (
    <div>
      <BackLink href="/admin/doctors">
        <H1>Doctor Details</H1>
      </BackLink>
      <DoctorDetails doctor={data?.data?.doctor || ""} />
    </div>
  );
};

export default DoctorDetailsPage;
