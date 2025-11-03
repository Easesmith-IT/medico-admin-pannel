"use client";

import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PaginationComp({ pageCount, page, setPage, className }) {
  const totalPageCount = pageCount;

  const renderPageNumbers = () => {
    const items = [];
    const maxVisiblePages = totalPageCount < 5 ? totalPageCount : 5;
    console.log("maxVisiblePages", maxVisiblePages);

    if (totalPageCount <= maxVisiblePages) {
      for (let i = 1; i <= totalPageCount; i++) {
        items.push(
          <PaginationItem className="cursor-pointer" key={i}>
            <PaginationLink
              className={cn(
                "border border-input! size-10 rounded-full",
                page === i && "text-white bg-main! hover:bg-main"
              )}
              isActive={page === i}
              onClick={() => setPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem className="cursor-pointer" key={1}>
          <PaginationLink isActive={page === 1} onClick={() => setPage(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        items.push(
          <PaginationItem className="cursor-pointer" key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPageCount - 1, page + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem className="cursor-pointer" key={i}>
            <PaginationLink isActive={page === i} onClick={() => setPage(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPageCount - 2) {
        items.push(
          <PaginationItem className="cursor-pointer" key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem className="cursor-pointer" key={totalPageCount}>
          <PaginationLink
            isActive={page === totalPageCount}
            onClick={() => setPage(totalPageCount)}
          >
            {totalPageCount}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const handlePrevious = () => {
    if (page <= 1) {
      return;
    }
    setPage((prev) => prev - 1);
  };
  const handleNext = () => {
    if (page >= pageCount) {
      return;
    }
    setPage((prev) => prev + 1);
  };

  if(pageCount === 0){
    return null
  }

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-center gap-3 w-full",
        className
      )}
    >
      <Pagination>
        <PaginationContent className="gap-3">
          <PaginationItem className="cursor-pointer">
            <PaginationPrevious
              onClick={handlePrevious}
              className="border size-10 rounded-full bg-white"
              to=""
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem className="cursor-pointer">
            <PaginationNext
              onClick={handleNext}
              className="border size-10 rounded-full bg-white"
              to=""
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
