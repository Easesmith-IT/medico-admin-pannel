"use client";

import { Doctor } from "@/components/doctor/doctor";
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

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [limit, setLimit] = useState(10);

  const handleReset = () => {
    setStatus("all");
    setSearchQuery("");
  };

  const { data, isLoading, error } = useApiQuery({
    url: `/admin/doctors?status=${
      status === "all" ? "" : status
    }&page=${page}&limit=${limit}&search=${searchQuery}`,
    queryKeys: ["doctors", status, page, searchQuery, limit],
  });

  console.log("data", data);

  useEffect(() => {
    if (data) {
      setDoctors(data?.data?.doctors || []);
      setPageCount(data?.totalPages || 0);
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <H1>Doctors</H1>
        <Button asChild variant="medico">
          <Link href="/admin/doctors/add">
            <PlusIcon />
            <span>Add Doctor</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Search Input */}
        <div></div>
        <div className="grow hidden">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1 h-5 w-5 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select onValueChange={(value) => setStatus(value)} value={status}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
              <TableHead>Specialization</TableHead>
              <TableHead>Current Workplace</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <Doctor key={doctor._id || doctor.id} doctor={doctor} />
            ))}
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <Doctor.Skeleton key={index} />
              ))}
          </TableBody>
        </Table>
        {doctors?.length === 0 && !isLoading && <DataNotFound name="Doctors" />}
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

export default Doctors;
