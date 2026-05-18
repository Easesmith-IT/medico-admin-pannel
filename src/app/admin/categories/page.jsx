"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

import { Category } from "@/components/category/category";
import DataNotFound from "@/components/shared/DataNotFound";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { StateView } from "@/components/shared/state-view";
import { ListPageHeader } from "@/components/layout/ListPageHeader";
import { TableLoader } from "@/components/loading/table-loader";
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
import { buildQuery } from "@/lib/utils";

const defaults = {
  search: "",
  page: 1,
  limit: "10",
};

const CategoriesPage = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const debouncedSearch = useDebounce(params.search, 600);

  const query = buildQuery({
    page: params.page,
    limit: params.limit,
    search: debouncedSearch,
  });

  const { data, isLoading, isFetching, error, refetch } = useApiQuery({
    url: `/items/getAllCategories?${query}`,
    queryKeys: ["category", debouncedSearch, params.page, params.limit],
  });

  const categories = data?.data?.categories || [];
  const pageCount = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Categories"
        actions={
          <Button asChild variant="medico">
            <Link href="/admin/categories/add">
              <PlusIcon />
              <span>Add Category</span>
            </Link>
          </Button>
        }
      />

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label
              htmlFor="category-search"
              className="mb-1 block text-sm font-medium"
            >
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="category-search"
                placeholder="Search category..."
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
        </div>
      </FilterBar>

      {error ? (
        <StateView
          type="error"
          title="Unable to load categories"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}
      <div className="relative table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[8.5rem] whitespace-nowrap">
                ID
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => (
              <Category key={category?._id || index} category={category} />
            ))}

            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Category.Skeleton key={index} />
                ))
              : null}
          </TableBody>
        </Table>
        <TableLoader active={isFetching && !isLoading} rows={5} columns={6} />
        {categories.length === 0 && !isLoading ? (
          <DataNotFound
            name="Categories"
            actionLabel="Add Category"
            actionHref="/admin/categories/add"
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

export default CategoriesPage;
