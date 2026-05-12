"use client";

import ServiceDetailsSkeleton from "@/components/service/service-details-skeleton";
import SlotConfigViewer from "@/components/service/slot-view";
import { BackLink } from "@/components/shared/back-link";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  CheckCircle,
  Clock,
  IndianRupee,
  LayersIcon,
  MapPin,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";

const ServiceDetails = () => {
  const params = useParams();

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/service/getServiceById/${params.serviceId}`,
    queryKeys: ["service", params.serviceId],
  });

  const service = data?.data;
  const creatorName =
    `${service?.createdBy?.firstName || ""} ${service?.createdBy?.lastName || ""}`.trim() || "N/A";
  const creatorEmail = service?.createdBy?.email || "N/A";
  const creatorRole = service?.createdBy?.userModel || "N/A";

  return (
    <div className="space-y-6">
      <BackLink href="/admin/services">
        <H1>Service Details</H1>
      </BackLink>

      {isLoading ? <ServiceDetailsSkeleton /> : null}

      {!isLoading && error ? (
        <StateView
          type="error"
          title="Unable to load service details"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}

      {!isLoading && !error && !service ? (
        <StateView
          type="empty"
          title="Service not found"
          description="The requested service record is not available."
          actionLabel="Back to services"
          actionHref="/admin/services"
        />
      ) : null}

      {!isLoading && !error && service ? (
        <div className="w-full">
          <div className="flex flex-col gap-2">
            {service.image ? (
              <img
                src={service.image}
                alt={service.name}
                width={120}
                height={120}
                className="shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-gray-200 text-sm">
                No Image
              </div>
            )}

            <div>
              <h2 className="text-3xl font-bold">{service.name}</h2>
              <p className="mt-2 text-gray-600">{service.description}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <Card className="mb-6 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" /> Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Base Price:</span>
                <span>₹{service.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Equipment Charges:</span>
                <span>₹{service.equipmentCharges}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax Percentage:</span>
                <span>{service.taxPercentage}%</span>
              </div>
            </CardContent>
          </Card>

          {service.supportsDuration ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Duration Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  <span className="font-medium">Default Duration:</span>{" "}
                  {service.defaultDuration} mins
                </p>

                <div className="flex flex-wrap gap-2">
                  {service.durationOptions?.map((duration, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {duration} min
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="mb-6 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Available Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                {service.cities?.map((city) => (
                  <div
                    key={city._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium capitalize">{city.name}</p>
                      <p className="text-xs text-gray-500">
                        Lat: {city.latitude} | Lng: {city.longitude}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Created By
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p>
                <strong>Name:</strong> {creatorName}
              </p>
              <p>
                <strong>Email:</strong> {creatorEmail}
              </p>
              <p>
                <strong>Role:</strong> {creatorRole}
              </p>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          <Card className="mb-6 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayersIcon className="h-5 w-5" /> Other Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Modes:</span>
                <span>{service.modes?.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Mode:</span>
                <span>{service.paymentMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Category:</span>
                <span>{service.category}</span>
              </div>
              {service.category === "nursing" ? (
                <div className="flex justify-between">
                  <span className="font-medium">Nursing Type:</span>
                  <span>{service.nursingType}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="font-medium">Formatted Duration:</span>
                <span>{service.formattedDuration}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time Format:</span>
                <span>{service.displayTimeFormat}</span>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          <Card className="shadow-none">
            <CardContent>
              <SlotConfigViewer slotConfig={service.slotConfig} />
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center gap-2">
            <CheckCircle
              className={`h-5 w-5 ${
                service.isActive ? "text-green-500" : "text-red-500"
              }`}
            />
            <span className="font-medium">
              Status: {service.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Created At:{" "}
            {service.createdAt && new Date(service.createdAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Updated At:{" "}
            {service.updatedAt && new Date(service.updatedAt).toLocaleString()}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ServiceDetails;
