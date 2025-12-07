"use client";

import { DoctorDetails } from "@/components/doctor/doctor-details";
import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/useApiQuery";
import Link from "next/link";
import { useParams } from "next/navigation";

const DoctorDetailsPage = () => {
  const params = useParams();

  const { data, isLoading, error } = useApiQuery({
    url: `/admin/doctors/${params.doctorId}`,
    queryKeys: ["doctors", params.doctorId],
  });

  console.log("data", data);

  return (
    <div>
      <div className="flex justify-between gap-5 items-center">
        <BackLink href="/admin/doctors">
          <H1>Doctor Details</H1>
        </BackLink>
        <Button asChild variant="medico">
          <Link href={`/admin/doctors/${params.doctorId}/social`}>Social Media</Link>
        </Button>
      </div>
      <DoctorDetails doctor={data?.data?.doctor || ""} />
    </div>
  );
};

export default DoctorDetailsPage;