"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

import { City } from "@/components/city/city";
import DataNotFound from "@/components/shared/DataNotFound";
import { FilterBar } from "@/components/shared/filter-bar";
import { StateView } from "@/components/shared/state-view";
import { ListPageHeader } from "@/components/layout/ListPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const defaults = {
  search: "",
};

const Cities = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const debouncedSearch = useDebounce(params.search, 400);

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  const cities = data?.data || [];
  const filteredCities = cities.filter((city) =>
    `${city?.name || ""}`.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Cities"
        actions={
          <Button asChild variant="medico">
            <Link href="/admin/cities/add">
              <PlusIcon />
              <span>Add City</span>
            </Link>
          </Button>
        }
      />

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label
              htmlFor="city-search"
              className="mb-1 block text-sm font-medium"
            >
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="city-search"
                placeholder="Search city..."
                value={params.search}
                onChange={(event) =>
                  updateParams({ search: event.target.value })
                }
                className="bg-white pl-9"
              />
            </div>
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
          title="Unable to load cities"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[8.5rem] whitespace-nowrap">
                ID
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Polygon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCities.map((city, index) => (
              <City key={city?._id || index} city={city} />
            ))}

            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <City.Skeleton key={index} />
                ))
              : null}
          </TableBody>
        </Table>

        {filteredCities.length === 0 && !isLoading ? (
          <DataNotFound
            name="Cities"
            actionLabel="Add City"
            actionHref="/admin/cities/add"
          />
        ) : null}
      </div>
    </div>
  );
};

export default Cities;
