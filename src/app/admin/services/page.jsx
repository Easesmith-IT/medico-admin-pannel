"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

import { Service } from "@/components/service/service";
import DataNotFound from "@/components/shared/DataNotFound";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { StateView } from "@/components/shared/state-view";
import { ListPageHeader } from "@/components/layout/ListPageHeader";
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
  city: "",
  search: "",
  status: "all",
  limit: "10",
  page: 1,
};

const Services = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const debouncedSearch = useDebounce(params.search, 600);

  const query = buildQuery({
    search: debouncedSearch,
    page: params.page,
    cityId: params.city,
    isActive: params.status,
    limit: params.limit,
  });

  const { data, isLoading, isFetching, error, refetch } = useApiQuery({
    url: `/service/getAllServices?${query}`,
    queryKeys: [
      "service",
      params.city,
      debouncedSearch,
      params.page,
      params.status,
      params.limit,
    ],
    options: {
      enabled: true,
    },
  });

  const {
    data: cityData,
    isLoading: isCityLoading,
    error: cityError,
    refetch: refetchCities,
  } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  const services = data?.data?.services || [];
  const pageCount = data?.data?.pagination?.pages || 1;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Services"
        actions={
          <Button variant="medico" asChild>
            <Link href="/admin/services/add">
              <PlusIcon />
              <span>Add Service</span>
            </Link>
          </Button>
        }
      />
      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label
              htmlFor="service-search"
              className="mb-1 block text-sm font-medium"
            >
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="service-search"
                autoComplete="off"
                placeholder="Search service..."
                value={params.search}
                onChange={(event) =>
                  updateParams({ search: event.target.value, page: 1 })
                }
                className="bg-white pl-9"
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
            <label className="mb-1 block text-sm font-medium">Status</label>
            <Select
              value={params.status}
              onValueChange={(value) =>
                updateParams({ status: value, page: 1 })
              }
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
          title="Unable to load services"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}
      {isFetching && !isLoading ? (
        <p className="text-sm text-muted-foreground">Refreshing services...</p>
      ) : null}

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[8.5rem] whitespace-nowrap">
                ID
              </TableHead>
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
            {services.map((service, index) => (
              <Service key={service?._id || index} service={service} />
            ))}

            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Service.Skeleton key={index} />
                ))
              : null}
          </TableBody>
        </Table>

        {services.length === 0 && !isLoading ? (
          <DataNotFound
            name="Services"
            actionLabel="Add Service"
            actionHref="/admin/services/add"
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

export default Services;
