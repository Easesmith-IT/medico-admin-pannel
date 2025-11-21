"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

import { Service } from "@/components/service/service";
import DataNotFound from "@/components/shared/DataNotFound";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { H1 } from "@/components/typography";
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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { buildQuery } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

const Services = () => {
  const [city, setCity] = useState("");
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [limit, setLimit] = useState("10");

  const handleReset = () => {
    setCity("");
  };

  // const { data, isLoading, error, refetch } = useApiQuery({
  //   url: `/service/services/${city}`,
  //   queryKeys: ["service", city],
  //   options: {
  //     enabled: false,
  //   },
  // });

  const debouncedSearch = useDebounce(search, 1000);

  const query = buildQuery({
    search: debouncedSearch,
    page,
    cityId: city,
    isActive: status,
    limit,
  });

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/service/getAllServices?${query}`,
    queryKeys: ["service", city, debouncedSearch, page, status, limit],
    options: {
      enabled: true,
    },
  });

  const { data: cityData, isLoading: isCityLoading } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  console.log("data", data);

  useEffect(() => {
    if (data) {
      setServices(data?.data?.services || []);
      setPageCount(data?.totalPages || 0);
    }
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [city, search, status, limit]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <H1>Services</H1>
        <Button variant="medico" asChild>
          <Link href={"/admin/services/add"}>
            <PlusIcon />
            Add Service
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="lg:col-span-2">
          <label htmlFor="search" className="text-sm font-medium mb-1 block">
            Search
          </label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 size-4  text-muted-foreground" />
            <Input
              id="search"
              autoComplete="off"
              placeholder="Search service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-lg bg-white"
            />
          </div>
        </div>

        <div className="flex gap-4 items-end flex-wrap">
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
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
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
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcwIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset Filters</p>
            </TooltipContent>
          </Tooltip> */}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Modes</TableHead>
              <TableHead>Cities</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services?.map((service, index) => (
              <Service key={service?._id || index} service={service} />
            ))}

            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <Service.Skeleton key={index} />
              ))}
          </TableBody>
        </Table>

        {services?.length === 0 && !isLoading && (
          <DataNotFound name="Services" />
        )}
      </div>

      <PaginationComp
        page={page}
        pageCount={pageCount}
        setPage={setPage}
        className="mt-8 mb-5"
      />
    </div>
  );
};

export default Services;

// Sample data (from user-provided JSON)
