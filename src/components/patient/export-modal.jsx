"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DatePicker from "../shared/DatePicker";
import { dateRangeSchema } from "@/schemas/PatientSchema";

export const ExportPatientsModal = ({ isModalOpen, setIsModalOpen }) => {
  const [url, setUrl] = useState("");

  const form = useForm({
    resolver: zodResolver(dateRangeSchema),
    defaultValues: {
      startDate: null,
      endDate: null,
      format: "pdf",
    },
  });

  const { control, handleSubmit, watch } = form;
  const format = watch("format");

  const fromDate = watch("startDate");
  const toDate = watch("endDate");

  // API hook (disabled by default until triggered)
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useApiQuery({
    url: `/admin/patients/export?from=${fromDate || ""}&to=${
      toDate || ""
    }&format=${format}`,
    queryKeys: ["export-patients", fromDate, toDate, format],
    options: { enabled: false },
    axiosOptions: { responseType: "blob" },
  });

  const onSubmit = () => {
    setUrl("");
    refetch();
  };

  // handle blob and create download URL
  useEffect(() => {
    if (result instanceof Blob) {
      const downloadUrl = URL.createObjectURL(result);
      setUrl(downloadUrl);
    }
  }, [result]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Export Patient Records</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Start Date */}
            <FormField
              control={control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Date</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={{ after: new Date() }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Export Format */}
            
            <FormField
              control={control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Format</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-4 items-center">
              <Button variant="medico" type="submit" disabled={isLoading}>
                {isLoading ? "Exporting..." : "Export"}
              </Button>

              {url && (
                <a href={url} download={`patients.${format}`}>
                  <Button type="button" variant="secondary">
                    Download {format.toUpperCase()}
                  </Button>
                </a>
              )}
            </div>
            {error ? (
              <p className="text-sm text-red-600">
                Unable to export patients. Please try again.
              </p>
            ) : null}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
