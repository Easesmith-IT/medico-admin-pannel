import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
// import { CgSpinner } from 'react-icons/cg'

const Spinner = ({ className, spinnerClassName }) => {
  return (
    <div className={cn("flex justify-center w-full py-5", className)}>
      <Loader className={cn("animate-spin", spinnerClassName)} />
    </div>
  );
};

export default Spinner;
