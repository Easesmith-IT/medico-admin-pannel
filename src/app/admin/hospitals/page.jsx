"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo } from "react";
import { RotateCcwIcon, SearchIcon } from "lucide-react";

import { Hospital } from "@/components/hospital/hospital";
import DataNotFound from "@/components/shared/DataNotFound";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
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
import { useListQueryParams } from "@/hooks/use-list-query-params";

const hospitalsData = [
  {
    clinicName: "Bright Smile Dental",
    clinicReceptionNumber: "9876543210",
    clinicConsultationFees: "500",
    numberOfDentalChairs: "3",
    clinicOwnership: "Dr. Mehta",
    propertyOwnership: "Owned",
    selectedHolidays: [{ day: "Sunday" }],
    address: "A-12 MG Road",
    area: "Andheri West",
    nearbyLandmark: "Infinity Mall",
    pincode: "400053",
    city: "Mumbai",
    state: "Maharashtra",
    longitude: "72.834",
    latitude: "19.119",
    defaultClinic: true,
    status: "active",
  },
  {
    clinicName: "ToothCare Clinic",
    clinicReceptionNumber: "9123456789",
    clinicConsultationFees: "400",
    numberOfDentalChairs: "2",
    clinicOwnership: "Dr. Patel",
    propertyOwnership: "Rented",
    selectedHolidays: [{ day: "Monday" }],
    address: "23/4 Park Street",
    area: "Salt Lake",
    nearbyLandmark: "City Centre Mall",
    pincode: "700064",
    city: "Kolkata",
    state: "West Bengal",
    longitude: "88.394",
    latitude: "22.572",
    defaultClinic: false,
    status: "inactive",
  },
];

const defaults = {
  search: "",
  status: "all",
  page: 1,
  limit: "10",
};

const HospitalPage = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);

  const filteredHospitals = useMemo(() => {
    const searchText = params.search.trim().toLowerCase();

    return hospitalsData.filter((hospital) => {
      const matchesStatus =
        params.status === "all" || hospital.status === params.status;

      const matchesSearch =
        searchText.length === 0 ||
        [
          hospital.clinicName,
          hospital.clinicReceptionNumber,
          hospital.city,
          hospital.area,
          hospital.clinicOwnership,
          hospital.propertyOwnership,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchText);

      return matchesStatus && matchesSearch;
    });
  }, [params.search, params.status]);

  const pageCount = Math.ceil(filteredHospitals.length / Number(params.limit));

  useEffect(() => {
    if (pageCount === 0 && params.page !== 1) {
      updateParams({ page: 1 });
      return;
    }

    if (pageCount > 0 && params.page > pageCount) {
      updateParams({ page: pageCount });
    }
  }, [pageCount, params.page, updateParams]);

  const paginatedHospitals = useMemo(() => {
    const limit = Number(params.limit);
    const start = (params.page - 1) * limit;
    return filteredHospitals.slice(start, start + limit);
  }, [filteredHospitals, params.page, params.limit]);

  return (
    <div className="space-y-6">
      <H1>Hospitals</H1>

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label htmlFor="hospital-search" className="mb-1 block text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="hospital-search"
                placeholder="Search by clinic, city, phone..."
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

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinic</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Ownership</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedHospitals.map((hospital, index) => (
              <Hospital key={hospital?._id || index} hospital={hospital} />
            ))}
          </TableBody>
        </Table>

        {paginatedHospitals.length === 0 ? <DataNotFound name="Hospitals" /> : null}
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

export default HospitalPage;
