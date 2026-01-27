"use client";

import CityForm from "@/components/city/city-form";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { BackLink } from "@/components/shared/back-link";
import { H1 } from "@/components/typography";
import { useRouter } from "next/navigation";

const AddCity = () => {
  const router = useRouter();

  const { mutateAsync, isPending } = useApiMutation({
    url: "/city/admin/cities",
    method: POST,
    invalidateKey: ["city"],
  });

  const handleCreate = async (values) => {
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
        <H1>Add City</H1>
      </BackLink>

      <div className="p-6 bg-white rounded-md">
        <CityForm isSubmitting={isPending} onSubmit={handleCreate} />
      </div>
    </div>
  );
};

export default AddCity;
