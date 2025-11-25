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
import { AddCitySchema } from "@/schemas/CitySchema";
import { useForm } from "react-hook-form";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { POST, PUT } from "@/constants/apiMethods";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useEffect } from "react";
import { Input } from "../ui/input";

export const AddCityModal = ({ isModalOpen, setIsModalOpen, city = "" }) => {
  const form = useForm({
    resolver: zodResolver(AddCitySchema),
    defaultValues: {
      name: city?.name || "",
      latitude: city?.latitude || "",
      longitude: city?.longitude || "",
    },
  });

  const { control, handleSubmit, watch } = form;

  const {
    mutateAsync: submitForm,
    isPending: isSubmitFormLoading,
    data: result,
  } = useApiMutation({
    url: "/city/admin/cities",
    method: POST,
    invalidateKey: ["city"],
  });

  const { mutateAsync, isPending, data } = useApiMutation({
    url: `/city/admin/cities/${city?._id}`,
    method: PUT,
    invalidateKey: ["city"],
  });

  const onSubmit = async (values) => {
    if (city) {
      await mutateAsync(values);
    } else {
      await submitForm(values);
    }
  };

  useEffect(() => {
    if (result || data) {
      console.log("result", result);
      setIsModalOpen(false);
    }
  }, [result, data]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{city ? "Update" : "Add"} City</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Start Date */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Latitude */}
            <FormField
              control={control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter latitude"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Longitude */}
            <FormField
              control={control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter longitude"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-4 items-center justify-end">
              <Button
                variant="medico"
                type="submit"
                disabled={isSubmitFormLoading || isPending}
              >
                {isSubmitFormLoading || isPending ? (
                  <Spinner />
                ) : city ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
