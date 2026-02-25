"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import { BackLink } from "@/components/shared/back-link";
import { H2 } from "@/components/typography";
import { CategoryDetailsSkeleton } from "@/components/category/category-details-skeleton";

const CategoryDetailsPage = () => {
  const params = useParams();
  const { data, isLoading } = useApiQuery({
    url: `/items/category/${params.categoryId}`,
    queryKeys: ["category", params.categoryId],
  });

  console.log("data", data);
  let category = data?.data?.category;

  // Find the selected category from list

  const totalValue = category?.items?.reduce(
    (acc, item) => acc + item.unitPrice,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Category Info */}
      <BackLink href="/admin/categories">
        <H2>Category Details</H2>
      </BackLink>

      {isLoading ? (
        <CategoryDetailsSkeleton />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{category.name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <p>
                <strong>Type:</strong> {category.type}
              </p>
              <p>
                <strong>Description:</strong> {category.description}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <Badge variant={category.isActive ? "success" : "destructive"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </p>

              <p>
                <strong>Created At:</strong>{" "}
                {new Date(category.createdAt).toLocaleString()}
              </p>

              <p>
                <strong>Total Items:</strong> {category.items.length}
              </p>

              <p>
                <strong>Total Value:</strong> ₹ {totalValue}
              </p>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Unit Price (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {category.items.map((item, index) => (
                    <TableRow key={item._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>₹ {item.unitPrice}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.isActive ? "success" : "destructive"}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailsPage;
