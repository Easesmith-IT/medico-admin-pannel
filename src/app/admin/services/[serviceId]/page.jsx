"use client";

import ServiceDetailsSkeleton from "@/components/service/service-details-skeleton";
import SlotConfigViewer from "@/components/service/slot-view";
import { BackLink } from "@/components/shared/back-link";
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

  const { data, isLoading, error } = useApiQuery({
    url: `/service/getServiceById/${params.serviceId}`,
    queryKeys: ["service", params.serviceId],
  });

  console.log("data", data);
  const service = data?.data;

  // if (!service) return <p>No service found.</p>;

  return (
    <div className="space-y-6">
      <BackLink href="/admin/services">
        {/* <H2>Update Service</H2> */}
      </BackLink>

      {isLoading ? (
        <ServiceDetailsSkeleton />
      ) : (
        <div className="w-full">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            {service.image ? (
              <img // TODO: Use next js Image tag
                src={service.image}
                alt={service.name}
                width={120}
                height={120}
                className="rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-28 h-28 bg-gray-200 rounded-xl flex items-center justify-center text-sm">
                No Image
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <p className="text-gray-600 mt-2">{service.description}</p>
            </div>
          </div>
          <Separator className="my-6" />
          {/* Pricing Section */}
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
          {/* Duration Section */}
          {service.supportsDuration && (
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

                <div className="flex gap-2 flex-wrap">
                  {service.durationOptions?.map((d, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      {d} min
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Cities Section */}
          <Card className="mb-6 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Available Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {service.cities?.map((city) => (
                  <div
                    key={city._id}
                    className="flex justify-between items-center rounded-lg border p-3"
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
          {/* Additional Info */}
          <Card className="mb-6 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Created By
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p>
                <strong>Name:</strong> {service.createdBy?.name}
              </p>
              <p>
                <strong>Email:</strong> {service.createdBy?.email}
              </p>
              <p>
                <strong>Role:</strong> {service.createdBy?.userModel}
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
              {service.category === "nursing" && (
                <div className="flex justify-between">
                  <span className="font-medium">Nursing Type:</span>
                  <span>{service.nursingType}</span>
                </div>
              )}
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
          {/* Status */}
          <div className="flex items-center gap-2 mt-4">
            <CheckCircle
              className={`h-5 w-5 ${
                service.isActive ? "text-green-500" : "text-red-500"
              }`}
            />
            <span className="font-medium">
              Status: {service.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Created At: {service.createdAt && new Date(service.createdAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Updated At: {service.updatedAt && new Date(service.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
