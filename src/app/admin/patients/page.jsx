"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { FileOutputIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

import { ExportPatientsModal } from "@/components/patient/export-modal";
import { Patient } from "@/components/patient/patient";
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
import { useListQueryParams } from "@/hooks/use-list-query-params";
import { useDebounce } from "@/hooks/use-debounce";

const defaults = {
  gender: "all",
  bloodGroup: "all",
  status: "all",
  search: "",
  page: 1,
  limit: "10",
};

const PatientsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const debouncedSearch = useDebounce(params.search, 600);

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/admin/patients?isActive=${
      params.status === "all" ? "" : params.status
    }&page=${params.page}&limit=${params.limit}&searchQuery=${encodeURIComponent(
      debouncedSearch
    )}&gender=${
      params.gender === "all" ? "" : encodeURIComponent(params.gender)
    }&bloodGroup=${
      params.bloodGroup === "all" ? "" : encodeURIComponent(params.bloodGroup)
    }`,
    queryKeys: [
      "patients",
      params.status,
      params.page,
      params.limit,
      params.gender,
      params.bloodGroup,
      debouncedSearch,
    ],
  });

  const patients = data?.data?.patients || [];
  const pageCount = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      <H1>Patients</H1>

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label htmlFor="patient-search" className="mb-1 block text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="patient-search"
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
            <label className="mb-1 block text-sm font-medium">Gender</label>
            <Select
              value={params.gender}
              onValueChange={(value) => updateParams({ gender: value, page: 1 })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Blood Group</label>
            <Select
              value={params.bloodGroup}
              onValueChange={(value) =>
                updateParams({ bloodGroup: value, page: 1 })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
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
                <SelectValue placeholder="All" />
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

          <Button variant="medico" onClick={() => setIsModalOpen(true)}>
            <FileOutputIcon />
            Export
          </Button>
        </div>
      </FilterBar>

      {error ? (
        <StateView
          type="error"
          title="Unable to load patients"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[8.5rem] whitespace-nowrap">Patient ID</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient, index) => (
              <Patient key={patient._id || index} patient={patient} />
            ))}

            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Patient.Skeleton key={index} />
                ))
              : null}
          </TableBody>
        </Table>

        {patients.length === 0 && !isLoading ? (
          <DataNotFound name="Patients" />
        ) : null}
      </div>

      <PaginationComp
        page={params.page}
        pageCount={pageCount}
        setPage={(nextPage) => updateParams({ page: nextPage })}
        className="mb-5 mt-8"
      />

      {isModalOpen ? (
        <ExportPatientsModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      ) : null}
    </div>
  );
};

export default PatientsPage;

