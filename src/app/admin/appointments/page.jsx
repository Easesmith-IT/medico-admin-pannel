"use client";

import { Booking } from "@/components/booking/booking";
import { ExportAppointmentModal } from "@/components/booking/export-modal";
import DataNotFound from "@/components/shared/DataNotFound";
import DatePicker from "@/components/shared/DatePicker";
import { PaginationComp } from "@/components/shared/PaginationComp";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApiQuery } from "@/hooks/useApiQuery";
import { buildQuery } from "@/lib/utils";
import { FileOutputIcon, RotateCcwIcon, Search } from "lucide-react";
import { useEffect, useState } from "react";

const Appointments = () => {
  const [status, setStatus] = useState("all");
  const [serviceId, setServiceId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [servicePartnerId, setServicePartnerId] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRange, setDateRange] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [pageCount, setPageCount] = useState(0);

  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExort = () => {
    setIsModalOpen(true);
  };

  const handleReset = () => {
    setStatus("all");
    setCategory("all");
    setMode("all");
    setServiceId("");
    setPatientId("");
    setServicePartnerId("");
    setStartDate("");
    setEndDate("");
    setCity("");
    setPage(1);
    setLimit("10");
    setDateRange("");
    setSearch("");
  };

  const query = buildQuery({
    status: status !== "all" ? status : undefined,
    category: category !== "all" ? category : undefined,
    mode: mode !== "all" ? mode : undefined,
    serviceId: serviceId || undefined,
    patientId: patientId || undefined,
    servicePartnerId: servicePartnerId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    city: city || undefined,
    dateRange: dateRange || undefined,
    page,
    limit,
  });

  const { data, isLoading, error } = useApiQuery({
    url: `/booking/getAllBookings?${query}`,
    queryKeys: [
      "bookings",
      status,
      city,
      dateRange,
      category,
      mode,
      serviceId,
      patientId,
      servicePartnerId,
      startDate,
      endDate,
      page,
      limit,
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
    queryKeys: ["service-provider-admin"],
  });

  const { data: cityData, isLoading: isCityLoading } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  console.log("data", data);

  useEffect(() => {
    if (data?.data) {
      setBookings(data.data);
      // setPageCount(data?.pagination?.pages || 1);
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-5">
        <H1>Appointments</H1>
        <div className="flex gap-5 items-end">
          <div>
            <label htmlFor="search" className="text-sm font-medium mb-1 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4  text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-lg bg-white"
              />
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcwIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset Filters</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="medico" onClick={handleExort}>
                <FileOutputIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export Data</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Status */}
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={status} onValueChange={setStatus}>
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

        {/* Category */}
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={category} onValueChange={setCategory}>
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

        {/* Mode */}
        <div>
          <label className="text-sm font-medium mb-1 block">Mode</label>
          <Select value={mode} onValueChange={setMode}>
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

        {/* Service ID */}
        <div>
          <label className="text-sm font-medium mb-1 block">Service</label>
          <Select
            disabled={isServiceLoading}
            value={serviceId}
            key={serviceId}
            onValueChange={(value) => setServiceId(value)}
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
              {serviceData && serviceData.data.length === 0 && (
                <div disabled>No services found</div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Patient ID */}
        <div>
          <label className="text-sm font-medium mb-1 block">Patient</label>
          <Select
            disabled={isPatientLoading}
            value={patientId}
            key={patientId}
            onValueChange={(value) => setPatientId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Patient" />
            </SelectTrigger>
            <SelectContent>
              {patientData?.data?.map((item) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.firstName} {item.lastName}
                </SelectItem>
              ))}
              {patientData && patientData.data.length === 0 && (
                <div disabled>No patients found</div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Partner */}
        <div>
          <label className="text-sm font-medium mb-1 block">
            Service Partner
          </label>
          <Select
            disabled={isPartnerLoading}
            value={servicePartnerId}
            key={servicePartnerId}
            onValueChange={(value) => setServicePartnerId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Service Partner" />
            </SelectTrigger>
            <SelectContent>
              {partnerData?.data?.map((item) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.firstName} {item.lastName}
                </SelectItem>
              ))}
              {partnerData && partnerData.data.length === 0 && (
                <div disabled>No service providers found</div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div>
          <label className="text-sm font-medium mb-1 block">City</label>
          <Select
            disabled={isCityLoading}
            value={city}
            key={city}
            onValueChange={(value) => setCity(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cityData?.data?.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
              {cityData && cityData.data.length === 0 && (
                <div disabled>No cities found</div>
              )}
              {/* <SelectItem value="all">All</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-sm font-medium mb-1 block">Date Range</label>
          <Select
            value={dateRange}
            key={dateRange}
            onValueChange={(value) => setDateRange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-sm font-medium mb-1 block">Start Date</label>
          <DatePicker value={startDate} onChange={setStartDate} />
        </div>

        {/* End Date */}
        <div>
          <label className="text-sm font-medium mb-1 block">End Date</label>
          <DatePicker value={endDate} onChange={setEndDate} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Limit</label>
          <Select value={limit} onValueChange={(value) => setLimit(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Limit" />
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

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Appointment Date</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings?.map((booking) => (
              <Booking key={booking._id} booking={booking} />
            ))}

            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <Booking.Skeleton key={index} />
              ))}
          </TableBody>
        </Table>
        {bookings?.length === 0 && !isLoading && (
          <DataNotFound name="Bookings" />
        )}
      </div>

      <PaginationComp
        page={page}
        pageCount={pageCount}
        setPage={setPage}
        className="mt-8 mb-5"
      />

      {isModalOpen && (
        <ExportAppointmentModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default Appointments;
