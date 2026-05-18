"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

import { ServicePartner } from "@/components/service-partner/service-partner";
import DataNotFound from "@/components/shared/DataNotFound";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { TableLoader } from "@/components/loading/table-loader";
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
  search: "",
  status: "all",
  approvalStatus: "all",
  page: 1,
  limit: "10",
  city: "",
};

const ServiceProviders = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const debouncedSearch = useDebounce(params.search, 600);

  const {
    data: cityData,
    isLoading: isCityLoading,
    error: cityError,
    refetch: refetchCities,
  } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  const query = buildQuery({
    search: debouncedSearch,
    cityId: params.city,
    isActive: params.status,
    approvalStatus: params.approvalStatus,
    page: params.page,
    limit: params.limit,
  });

  const { data, isLoading, isFetching, error, refetch } = useApiQuery({
    url: `/serviceProvider/getAllServiceProviders?${query}`,
    queryKeys: [
      "service-provider",
      params.status,
      params.page,
      debouncedSearch,
      params.limit,
      params.approvalStatus,
      params.city,
    ],
  });

  const serviceProviders = data?.data || [];
  const pageCount = data?.pagination?.totalPages || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <H1>Service Partners</H1>
        <Button variant="medico" asChild>
          <Link href="/admin/service-partners/add">
            <PlusIcon />
            Add Service Partner
          </Link>
        </Button>
      </div>

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label htmlFor="partner-search" className="mb-1 block text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="partner-search"
                placeholder="Search service provider..."
                value={params.search}
                onChange={(event) =>
                  updateParams({ search: event.target.value, page: 1 })
                }
                className="w-full bg-white pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <Select
              disabled={isCityLoading}
              value={params.city}
              onValueChange={(value) => updateParams({ city: value, page: 1 })}
            >
              <SelectTrigger className="w-40">
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
            <label className="mb-1 block text-sm font-medium">Approval Status</label>
            <Select
              value={params.approvalStatus}
              onValueChange={(value) =>
                updateParams({ approvalStatus: value, page: 1 })
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Approval status" />
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
            <label className="mb-1 block text-sm font-medium">Status</label>
            <Select
              value={params.status}
              onValueChange={(value) => updateParams({ status: value, page: 1 })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Limit</label>
            <Select
              value={params.limit}
              onValueChange={(value) => updateParams({ limit: value, page: 1 })}
            >
              <SelectTrigger className="w-24">
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

          <Button variant="outline" onClick={resetParams}>
            <RotateCcwIcon />
            Reset
          </Button>
        </div>
      </FilterBar>
      {cityError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Unable to load city filter options.{" "}
          <button type="button" className="underline" onClick={refetchCities}>
            Retry
          </button>
        </div>
      ) : null}

      {error ? (
        <StateView
          type="error"
          title="Unable to load service partners"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}
      <div className="relative table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[8.5rem] whitespace-nowrap">Service Provider ID</TableHead>
              <TableHead>Name</TableHead>
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
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <ServicePartner.Skeleton key={index} />
                ))
              : null}
          </TableBody>
        </Table>
        <TableLoader active={isFetching && !isLoading} rows={5} columns={9} />
        {serviceProviders.length === 0 && !isLoading ? (
          <DataNotFound
            name="Service Partners"
            actionLabel="Add Service Partner"
            actionHref="/admin/service-partners/add"
          />
        ) : null}
      </div>
      <PaginationComp
        page={params.page}
        pageCount={pageCount}
        setPage={(nextPage) => updateParams({ page: nextPage })}
        className="mb-5 mt-8"
      />
    </div>
  );
};

export default ServiceProviders;

