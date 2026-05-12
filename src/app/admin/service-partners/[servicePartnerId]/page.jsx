"use client";

import { ServicePartnerDetailsSkeleton } from "@/components/service-partner/service-partner-detail-skeleton";
import { ServicePartnerDetails } from "@/components/service-partner/service-partner-details";
import { StateView } from "@/components/shared/state-view";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useParams } from "next/navigation";

const ServicePartnerPage = () => {
  const params = useParams();

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/serviceProvider/service-provider/${params.servicePartnerId}`,
    queryKeys: ["service-provider", params.servicePartnerId],
  });

  const provider = data?.data;

  return (
    <div className="space-y-6">
      {isLoading ? <ServicePartnerDetailsSkeleton /> : null}

      {!isLoading && error ? (
        <StateView
          type="error"
          title="Unable to load service partner details"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}

      {!isLoading && !error && !provider ? (
        <StateView
          type="empty"
          title="Service partner not found"
          description="The requested service partner record is not available."
          actionLabel="Back to service partners"
          actionHref="/admin/service-partners"
        />
      ) : null}

      {!isLoading && !error && provider ? (
        <ServicePartnerDetails provider={provider} onRefetch={refetch} />
      ) : null}
    </div>
  );
};

export default ServicePartnerPage;
