"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

import { Doctor } from "@/components/doctor/doctor";
import DataNotFound from "@/components/shared/DataNotFound";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
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
import { useDebounce } from "@/hooks/use-debounce";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useListQueryParams } from "@/hooks/use-list-query-params";
import { StateView } from "@/components/shared/state-view";

const defaults = {
  search: "",
  status: "all",
  page: 1,
  limit: "10",
};

const Doctors = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const debouncedSearch = useDebounce(params.search, 600);

  const { data, isLoading, isFetching, error, refetch } = useApiQuery({
    url: `/admin/doctors?status=${
      params.status === "all" ? "" : params.status
    }&page=${params.page}&limit=${params.limit}&search=${encodeURIComponent(
      debouncedSearch,
    )}`,
    queryKeys: [
      "doctors",
      params.status,
      params.page,
      debouncedSearch,
      params.limit,
    ],
  });

  const doctors = data?.data?.doctors || [];
  const pageCount = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Doctors"
        actions={
          <Button asChild variant="medico">
            <Link href="/admin/doctors/add">
              <PlusIcon />
              <span>Add Doctor</span>
            </Link>
          </Button>
        }
      />

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label
              htmlFor="doctor-search"
              className="mb-1 block text-sm font-medium"
            >
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="doctor-search"
                placeholder="Search by name, email, phone..."
                value={params.search}
                onChange={(event) =>
                  updateParams({ search: event.target.value, page: 1 })
                }
                className="bg-white pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <Select
              onValueChange={(value) =>
                updateParams({ status: value, page: 1 })
              }
              value={params.status}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Limit</label>
            <Select
              value={params.limit}
              onValueChange={(value) => updateParams({ limit: value, page: 1 })}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Limit" />
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

      {error ? (
        <StateView
          type="error"
          title="Unable to load doctors"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}
      {isFetching && !isLoading ? (
        <p className="text-sm text-muted-foreground">Refreshing doctors...</p>
      ) : null}

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[8.5rem] whitespace-nowrap">
                Doctor ID
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <Doctor key={doctor._id || doctor.id} doctor={doctor} />
            ))}

            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Doctor.Skeleton key={index} />
                ))
              : null}
          </TableBody>
        </Table>

        {doctors.length === 0 && !isLoading ? (
          <DataNotFound
            name="Doctors"
            actionLabel="Add Doctor"
            actionHref="/admin/doctors/add"
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

export default Doctors;
