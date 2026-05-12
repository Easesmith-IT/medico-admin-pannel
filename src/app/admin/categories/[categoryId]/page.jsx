"use client";

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
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { CategoryDetailsSkeleton } from "@/components/category/category-details-skeleton";

const CategoryDetailsPage = () => {
  const params = useParams();

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/items/category/${params.categoryId}`,
    queryKeys: ["category", params.categoryId],
  });

  const category = data?.data?.category;
  const items = category?.items || [];

  const totalValue =
    items.reduce((accumulator, item) => accumulator + item.unitPrice, 0) || 0;

  return (
    <div className="space-y-6">
      <BackLink href="/admin/categories">
        <H1>Category Details</H1>
      </BackLink>

      {isLoading ? <CategoryDetailsSkeleton /> : null}

      {!isLoading && error ? (
        <StateView
          type="error"
          title="Unable to load category details"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}

      {!isLoading && !error && !category ? (
        <StateView
          type="empty"
          title="Category not found"
          description="The requested category record is not available."
          actionLabel="Back to categories"
          actionHref="/admin/categories"
        />
      ) : null}

      {!isLoading && !error && category ? (
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
                {category.createdAt
                  ? new Date(category.createdAt).toLocaleString()
                  : "Not available"}
              </p>

              <p>
                <strong>Total Items:</strong> {items.length}
              </p>

              <p>
                <strong>Total Value:</strong> ₹ {totalValue}
              </p>
            </CardContent>
          </Card>

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
                  {items.map((item, index) => (
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
      ) : null}
    </div>
  );
};

export default CategoryDetailsPage;
