import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export const BackLink = ({ children, href }) => {
  return (
    <div className="flex gap-2 items-center">
      <Button asChild variant="outline" size="icon" className="rounded-full">
        <Link href={href}>
          <ArrowLeft />
        </Link>
      </Button>
      <div>{children}</div>
    </div>
  );
};
