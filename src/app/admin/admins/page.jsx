"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

import { Admin } from "@/components/admin/admin";
import DataNotFound from "@/components/shared/DataNotFound";
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
  page: 1,
  limit: "10",
  status: "all",
  search: "",
};

const Admins = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const debouncedSearch = useDebounce(params.search, 600);

  const query = buildQuery({
    page: params.page,
    limit: params.limit,
    status: params.status,
    search: debouncedSearch,
  });

  const { data, isLoading, isFetching, error, refetch } = useApiQuery({
    url: `/admin/subadmins?${query}`,
    queryKeys: ["admin", params.page, params.limit, params.status, debouncedSearch],
  });

  const pageCount = data?.pagination?.pages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <H1>Admins</H1>
        <Button asChild variant="medico">
          <Link href="/admin/admins/add">
            <PlusIcon />
            Add
          </Link>
        </Button>
      </div>

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label htmlFor="admin-search" className="mb-1 block text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="admin-search"
                placeholder="Search admin..."
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
              value={params.status}
              onValueChange={(value) => updateParams({ status: value, page: 1 })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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

      {error ? (
        <StateView
          type="error"
          title="Unable to load admins"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}
      {isFetching && !isLoading ? (
        <p className="text-sm text-muted-foreground">Refreshing admins...</p>
      ) : null}

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[8.5rem] whitespace-nowrap">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((admin, index) => (
              <Admin key={admin?._id || index} admin={admin} />
            ))}

            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Admin.Skeleton key={index} />
                ))
              : null}
          </TableBody>
        </Table>

        {data?.data?.length === 0 && !isLoading ? (
          <DataNotFound name="Admins" actionLabel="Add Admin" actionHref="/admin/admins/add" />
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

export default Admins;
