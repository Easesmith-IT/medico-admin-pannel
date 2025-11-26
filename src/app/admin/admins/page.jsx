"use client";

import { Admin } from "@/components/admin/admin";
import DataNotFound from "@/components/shared/DataNotFound";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { PlusIcon, RotateCcwIcon, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiQuery } from "@/hooks/useApiQuery";
import { buildQuery } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Admins = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const handleReset = () => {
    setStatus("all");
    setPage(1);
    setLimit("10");
    setSearch("");
  };

  const query = buildQuery({
    page,
    limit,
    status,
    search,
  });

  const { data, isLoading } = useApiQuery({
    url: `/admin/subadmins?${query}`,
    queryKeys: ["admin", page, limit, status, search],
  });

  console.log("data", data);

  useEffect(() => {
    if (data?.data) {
      setPageCount(data?.pagination?.pages || 1);
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-5">
        <H1>Admins</H1>
        <Button asChild variant="medico">
          <Link href={"/admin/admins/add"}>
            <PlusIcon />
            Add
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center gap-5">
        <div>
          <label htmlFor="search" className="text-sm font-medium mb-1 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4  text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search admin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-lg bg-white"
            />
          </div>
        </div>

        <div className="flex gap-5 items-end">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((admin, index) => (
              <Admin key={admin?._id || index} admin={admin} />
            ))}

            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <Admin.Skeleton key={index} />
              ))}
          </TableBody>
        </Table>

        {data?.data?.length === 0 && !isLoading && (
          <DataNotFound name="Admins" />
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

export default Admins;
