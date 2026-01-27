"use client";

import CityForm from "@/components/city/city-form";
import { PUT } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { useEffect, useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useParams, useRouter } from "next/navigation";

const UpdateCity = () => {
  const params = useParams();
  const router = useRouter();

  const [city, setCity] = useState("");
  const { data, isLoading } = useApiQuery({
    url: `/city/cities/${params?.cityId}`,
    queryKeys: ["city", params?.cityId],
  });

  useEffect(() => {
    if (data) {
      setCity(data?.data || "");
    }
  }, [data]);

  const { mutateAsync, isPending } = useApiMutation({
    url: `/city/admin/cities/${city?._id}`,
    method: PUT,
    invalidateKey: ["city"],
  });

  const handleUpdate = async (values) => {
    const payload = {
      ...values,
      polygon: values.geoFence.map(([lat, lng]) => [lng, lat]),
    };

    await mutateAsync(payload);

    router.push("/admin/cities");
  };


  return (
    <div className="space-y-6">
      <BackLink href="/admin/cities">
        <H1>Update City</H1>
      </BackLink>

      <div className="p-6 bg-white rounded-md">
        <CityForm
          defaultValues={{
            name: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
            geoFence:
              city?.area?.coordinates?.[0]?.length >= 3
                ? city?.area?.coordinates?.[0].map(([lng, lat]) => [lat, lng])
                : [],
          }}
          isSubmitting={isPending}
          onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
};

export default UpdateCity;
