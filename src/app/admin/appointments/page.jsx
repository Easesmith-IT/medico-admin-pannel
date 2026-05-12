"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { FileOutputIcon, PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

import { Booking } from "@/components/booking/booking";
import { ExportAppointmentModal } from "@/components/booking/export-modal";
import DataNotFound from "@/components/shared/DataNotFound";
import DatePicker from "@/components/shared/DatePicker";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useDebounce } from "@/hooks/use-debounce";
import { useListQueryParams } from "@/hooks/use-list-query-params";
import { buildQuery } from "@/lib/utils";

const defaults = {
  status: "all",
  serviceId: "",
  patientId: "",
  servicePartnerId: "",
  category: "all",
  mode: "all",
  city: "",
  search: "",
  startDate: "",
  endDate: "",
  dateRange: "all",
  page: 1,
  limit: "10",
};

const formatDate = (value) => (value ? value.split("T")[0] : "");

const Appointments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const debouncedSearch = useDebounce(params.search, 600);

  const query = buildQuery({
    status: params.status !== "all" ? params.status : undefined,
    category: params.category !== "all" ? params.category : undefined,
    mode: params.mode !== "all" ? params.mode : undefined,
    serviceId: params.serviceId,
    patientId: params.patientId,
    servicePartnerId: params.servicePartnerId,
    startDate: formatDate(params.startDate),
    endDate: formatDate(params.endDate),
    city: params.city,
    filterBy: params.dateRange !== "all" ? params.dateRange : undefined,
    page: params.page,
    search: debouncedSearch,
    limit: params.limit,
  });

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/booking/getAllBookings?${query}`,
    queryKeys: [
      "bookings",
      params.status,
      params.city,
      debouncedSearch,
      params.dateRange,
      params.category,
      params.mode,
      params.serviceId,
      params.patientId,
      params.servicePartnerId,
      params.startDate,
      params.endDate,
      params.page,
      params.limit,
    ],
  });

  const { data: serviceData, isLoading: isServiceLoading } = useApiQuery({
    url: `/admin/services/names`,
    queryKeys: ["service-admin"],
  });

  const { data: patientData, isLoading: isPatientLoading } = useApiQuery({
    url: `/admin/patients/names`,
    queryKeys: ["patient-admin"],
  });

  const { data: partnerData, isLoading: isPartnerLoading } = useApiQuery({
    url: `/admin/service-providers/names`,
    queryKeys: ["service-provider"],
  });

  const { data: cityData, isLoading: isCityLoading } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  const bookings = data?.data || [];
  const pageCount = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-5">
        <H1>Appointments</H1>
        <Button asChild variant="medico">
          <Link href="/admin/appointments/add">
            <PlusIcon />
            Add Appointment
          </Link>
        </Button>
      </div>

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label htmlFor="booking-search" className="mb-1 block text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="booking-search"
                placeholder="Search by patient/service..."
                value={params.search}
                onChange={(event) =>
                  updateParams({ search: event.target.value, page: 1 })
                }
                className="bg-white pl-9"
              />
            </div>
          </div>

          <Button variant="outline" onClick={resetParams}>
            <RotateCcwIcon />
            Reset
          </Button>
          <Button variant="medico" onClick={() => setIsModalOpen(true)}>
            <FileOutputIcon />
            Export
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <Select
              value={params.status}
              onValueChange={(value) => updateParams({ status: value, page: 1 })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <Select
              value={params.category}
              onValueChange={(value) => updateParams({ category: value, page: 1 })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="nursing">Nursing</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Mode</label>
            <Select
              value={params.mode}
              onValueChange={(value) => updateParams({ mode: value, page: 1 })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Home Service">Home Service</SelectItem>
                <SelectItem value="Visit Provider Location">
                  Visit Provider Location
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Service</label>
            <Select
              disabled={isServiceLoading}
              value={params.serviceId}
              onValueChange={(value) => updateParams({ serviceId: value, page: 1 })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {serviceData?.data?.map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Patient</label>
            <Select
              disabled={isPatientLoading}
              value={params.patientId}
              onValueChange={(value) => updateParams({ patientId: value, page: 1 })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                {patientData?.data?.map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {`${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "-"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Service Partner</label>
            <Select
              disabled={isPartnerLoading}
              value={params.servicePartnerId}
              onValueChange={(value) =>
                updateParams({ servicePartnerId: value, page: 1 })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Partner" />
              </SelectTrigger>
              <SelectContent>
                {partnerData?.data?.map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {`${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "-"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <Select
              disabled={isCityLoading}
              value={params.city}
              onValueChange={(value) => updateParams({ city: value, page: 1 })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cityData?.data?.map((city) => (
                  <SelectItem key={city._id} value={city._id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Date Range</label>
            <Select
              value={params.dateRange}
              onValueChange={(value) => updateParams({ dateRange: value, page: 1 })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Start Date</label>
            <DatePicker
              value={params.startDate ? new Date(params.startDate) : undefined}
              onChange={(value) =>
                updateParams({
                  startDate: value ? value.toISOString() : "",
                  page: 1,
                })
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">End Date</label>
            <DatePicker
              value={params.endDate ? new Date(params.endDate) : undefined}
              onChange={(value) =>
                updateParams({
                  endDate: value ? value.toISOString() : "",
                  page: 1,
                })
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Limit</label>
            <Select
              value={params.limit}
              onValueChange={(value) => updateParams({ limit: value, page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FilterBar>

      {error ? (
        <StateView
          type="error"
          title="Unable to load appointments"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Appointment Date</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <Booking key={booking._id} booking={booking} />
            ))}
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Booking.Skeleton key={index} />
                ))
              : null}
          </TableBody>
        </Table>

        {bookings.length === 0 && !isLoading ? (
          <DataNotFound
            name="Appointments"
            actionLabel="Add Appointment"
            actionHref="/admin/appointments/add"
          />
        ) : null}
      </div>

      <PaginationComp
        page={params.page}
        pageCount={pageCount}
        setPage={(nextPage) => updateParams({ page: nextPage })}
        className="mb-5 mt-8"
      />

      {isModalOpen ? (
        <ExportAppointmentModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      ) : null}
    </div>
  );
};

export default Appointments;

