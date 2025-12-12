import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { AddCommentSchema } from "@/schemas/DoctorSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const AddCommentModal = ({ isModalOpen, setIsModalOpen }) => {
  const params = useParams();
  const form = useForm({
    resolver: zodResolver(AddCommentSchema),
    defaultValues: {
      comment: "",
    },
  });

  const { control, handleSubmit, watch } = form;

  const {
    mutateAsync,
    isPending,
    data: result,
  } = useApiMutation({
    url: `/socialPost/addComment/${params.postId}`,
    method: POST,
    invalidateKey: ["post"],
  });

  const onSubmit = async (values) => {
    await mutateAsync({ text: values.comment });
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
          <DialogTitle>Add Comment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your comment here..."
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
                {isPending ? <Spinner /> : "Comment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
