import { H1 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

const Admins = () => {
  return (
    <div>
      <div className="flex justify-between items-center gap-5">
        <H1>Admins</H1>
        <Button asChild variant="medico">
          <Link href={"/admin/admins/add"}>
            <PlusIcon />
            Add
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Admins;
