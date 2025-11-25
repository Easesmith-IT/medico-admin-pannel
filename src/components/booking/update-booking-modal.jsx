import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PATCH, PUT } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { UpdateBookingStatusSchema } from "@/schemas/ServicesSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";

export const UpdateBookingModal = ({ isModalOpen, setIsModalOpen }) => {
  const params = useParams();
  const form = useForm({
    resolver: zodResolver(UpdateBookingStatusSchema),
    defaultValues: {
      status: "",
      reason: "",
    },
  });

  const { control, handleSubmit, watch } = form;

  const {
    mutateAsync,
    isPending,
    data: result,
  } = useApiMutation({
    url: `/admin/bookings/${params.appointmentId}/status`,
    method: PATCH,
    invalidateKey: ["bookings"],
  });

  const onSubmit = async (values) => {
    await mutateAsync(values);
  };

  useEffect(() => {
    if (result) {
      setIsModalOpen(false);
    }
  }, [result]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter Reason"
                      className="resize-none max-h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-4 items-center justify-end">
              <Button variant="medico" type="submit" disabled={isPending}>
                {isPending ? <Spinner /> : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
