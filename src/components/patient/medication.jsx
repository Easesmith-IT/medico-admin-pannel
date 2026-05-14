import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useApiMutation } from "@/hooks/useApiMutation";
import { DELETE } from "@/constants/apiMethods";
import { useParams } from "next/navigation";
import { Spinner } from "../ui/spinner";
import { useEffect } from "react";

export const Medication = ({ item }) => {
  const params = useParams();

  const {
    mutateAsync,
    isPending,
    data: result,
  } = useApiMutation({
    url: `/admin/patient/${params.patientId}/medications?medication=${item}`,
    method: DELETE,
    invalidateKey: ["patients", params.patientId],
  });

  const removeMedication = async () => {
    await mutateAsync();
  };

  useEffect(() => {
    if (result) {
    }
  }, [result]);
  return (
    <div className="flex items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2">
      <p className="text-sm font-medium text-foreground">{item}</p>
      <Button
        onClick={removeMedication}
        variant="destructive"
        size="icon"
        className="size-7 rounded-full"
        disabled={isPending}
      >
        {isPending ? <Spinner /> : <XIcon />}
      </Button>
    </div>
  );
};
