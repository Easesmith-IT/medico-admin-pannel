import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import React from "react";

const DataNotFound = ({ name, className, actionLabel, actionHref }) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-3 px-4 py-10 text-center text-sm text-[#6B7280]",
        className
      )}
    >
      <p>{name} not found.</p>
      {actionLabel && actionHref ? (
        <Button asChild size="sm" variant="outline">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
};

export default DataNotFound;
