"use client";

import { ServiceDetailsWorkspace } from "@/components/service/service-details-workspace";
import { StateView } from "@/components/shared/state-view";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useParams } from "next/navigation";

const ServiceDetailsPage = () => {
  const params = useParams();

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/service/getServiceById/${params.serviceId}`,
    queryKeys: ["service", params.serviceId],
  });

  const service = data?.data;

  if (isLoading) return <StateView type="loading" rows={8} />;

  if (error) {
    return (
      <StateView
        type="error"
        title="Unable to load service details"
        description={error.message}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  if (!service) {
    return (
      <StateView
        type="empty"
        title="Service not found"
        description="The requested service record is not available."
        actionLabel="Back to services"
        actionHref="/admin/services"
      />
    );
  }

  return <ServiceDetailsWorkspace service={service} onRefetch={refetch} />;
};

export default ServiceDetailsPage;

