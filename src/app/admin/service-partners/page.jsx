"use client";

import { Doctor } from "@/components/doctor/doctor";
import { ServicePartner } from "@/components/service-partner/service-partner";
import DataNotFound from "@/components/shared/DataNotFound";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PlusIcon, RotateCcwIcon, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildQuery } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

const ServiceProviders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [limit, setLimit] = useState("10");
  const [city, setCity] = useState("");

  const handleReset = () => {
    setSearchQuery("");
    setStatus("all");
    setApprovalStatus("all");
    setPage(1);
    setLimit("10");
    setCity("");
  };

  const { data: cityData, isLoading: isCityLoading } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  const debouncedSearch = useDebounce(searchQuery, 1000);

  const query = buildQuery({
    search: debouncedSearch,
    cityId: city,
    isActive: status,
    approvalStatus,
    page,
    limit,
  });

  const { data, isLoading, error } = useApiQuery({
    url: `/serviceProvider/getAllServiceProviders?${query}`,
    queryKeys: [
      "service-provider",
      status,
      page,
      debouncedSearch,
      limit,
      approvalStatus,
      city,
    ],
  });

  console.log("data", data);

  useEffect(() => {
    if (data) {
      setServiceProviders(data?.data || []);
      setPageCount(data?.pagination?.totalPages || 0);
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <H1>Service Partners</H1>
        <Button variant="medico" asChild>
          <Link href={"/admin/service-partners/add"}>
            <PlusIcon />
            Add Service Partner
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        {/* Search Input */}
        <div>
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search service provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white w-96"
            />
          </div>
        </div>

        {/* Filter Buttons */}

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">City</label>
            <Select
              disabled={isCityLoading}
              value={city}
              key={city}
              onValueChange={(value) => setCity(value)}
            >
              <SelectTrigger>
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
          <div>
            <label className="text-sm font-medium mb-1 block">
              Approval Status
            </label>
            <Select
              onValueChange={(value) => setApprovalStatus(value)}
              value={approvalStatus}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select approval status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select onValueChange={(value) => setStatus(value)} value={status}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="true">Active</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceProviders.map((servicePartner) => (
              <ServicePartner
                key={servicePartner._id || servicePartner.id}
                servicePartner={servicePartner}
              />
            ))}
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <ServicePartner.Skeleton key={index} />
              ))}
          </TableBody>
        </Table>
        {serviceProviders?.length === 0 && !isLoading && (
          <DataNotFound name="Service Partners" />
        )}
      </div>
      <PaginationComp
        page={page}
        pageCount={pageCount}
        setPage={setPage}
        className="mt-8 mb-5"
      />

      {/* Pagination */}
      {/* <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1 to 5 of 25 results
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="font-medium">
            1
          </Button>
          <Button variant="outline" size="icon">
            2
          </Button>
          <Button variant="outline" size="icon">
            3
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default ServiceProviders;
