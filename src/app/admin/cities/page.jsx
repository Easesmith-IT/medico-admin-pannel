"use client";

import { City } from "@/components/city/city";
import DataNotFound from "@/components/shared/DataNotFound";
import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiQuery } from "@/hooks/useApiQuery";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  useEffect(() => {
    if (data) {
      setCities(data?.data || []);
    }
  }, [data]);

  console.log("data", data);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <H1>Cities</H1>
        <Button asChild variant="medico">
          <Link href="/admin/cities/add">
            <PlusIcon />
            Add City
          </Link>
        </Button>
      </div>

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">ID</TableHead>
              <TableHead>Name</TableHead>
              {/* <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead> */}
              <TableHead>Polygon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((city, index) => (
              <City key={city?._id || index} city={city} />
            ))}

            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <City.Skeleton key={index} />
              ))}
          </TableBody>
        </Table>

        {data?.data?.length === 0 && !isLoading && (
          <DataNotFound name="Cities" />
        )}
      </div>
    </div>
  );
};

export default Cities;
