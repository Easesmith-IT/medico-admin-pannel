import DatePicker from "@/components/shared/DatePicker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/useApiQuery";
import { P } from "@/components/typography";

export const AddServicePartnerStep3 = () => {
  const { control } = useFormContext();

  const servicesFieldArray = useFieldArray({ control, name: "services" });

  const { data, isLoading, error, refetch } = useApiQuery({
    url: `/service/getAllServices`,
    queryKeys: ["service"],
  });

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualification</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="registrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="registrationCouncil"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Council</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="yearsOfExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of experience</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Services</h4>
          <Button
            size="sm"
            type="button"
            onClick={() =>
              servicesFieldArray.append({
                serviceId: "",
                serviceName: "",
                experienceYears: 0,
                specialization: "",
              })
            }
          >
            Add
          </Button>
        </div>
        {error ? (
          <p className="mb-3 text-sm text-red-600">
            Unable to load services.{" "}
            <button type="button" className="underline" onClick={refetch}>
              Retry
            </button>
          </p>
        ) : null}

        {servicesFieldArray.fields.map((item, idx) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-end mb-2">
            <div className="col-span-3">
              <FormField
                control={control}
                name={`services.${idx}.serviceId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Id</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select service id" />
                        </SelectTrigger>
                        <SelectContent>
                          {data?.data?.services?.map((service) => (
                            <SelectItem value={service._id}>
                              {service.name}
                            </SelectItem>
                          ))}

                          {data?.data?.services?.length === 0 && (
                            <p className="text-muted-foreground text-sm font-medium">
                              No services found
                            </p>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-4">
              <FormField
                control={control}
                name={`services.${idx}.serviceName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1">
              <FormField
                control={control}
                name={`services.${idx}.experienceYears`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-3">
              <FormField
                control={control}
                name={`services.${idx}.specialization`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1">
              <Button
                size="sm"
                variant="destructive"
                type="button"
                onClick={() => servicesFieldArray.remove(idx)}
                className="w-full"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
