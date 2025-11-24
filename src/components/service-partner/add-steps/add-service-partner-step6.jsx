import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import MultiSelect from "@/components/shared/MultiSelect";
import { useEffect, useState } from "react";

export const AddServicePartnerStep6 = () => {
  const { control, setValue, watch, getValues } = useFormContext();

  const [cities, setCities] = useState([]);
  const selectedCities = watch("serviceCities") || [];
  const languages = watch("languages") || [];

  const { data, isLoading } = useApiQuery({
    url: `/city/getAllCities`,
    queryKeys: ["city"],
  });

  const printData = () => {
    console.log("form values", getValues());
  };

  useEffect(() => {
    if (data) {
      const modifiedCities = data?.data?.map((city) => ({
        label: city?.name,
        value: city?._id,
      }));
      setCities(modifiedCities || []);
    }
  }, [data]);

  const addLanguage = (value) => {
    if (!value.trim()) return;
    setValue("languages", [...languages, value.trim()]);
  };

  const removeLanguage = (index) => {
    console.log("index", index);

    const updated = [...languages];
    console.log("updated", updated);
    updated.splice(index, 1);
    console.log("updated 1", updated);
    setValue("languages", updated);
  };

  return (
    <div className="space-y-6">
      {/* MULTI CITY SELECTION */}
      <FormField
        control={control}
        name="serviceCities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Cities</FormLabel>
            <MultiSelect
              label="Select Cities"
              options={cities}
              value={field.value || []}
              onChange={field.onChange}
              isLoading={isLoading}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* LANGUAGES (TAGS INPUT) */}
      <FormLabel>Languages</FormLabel>
      <div className="border rounded-md p-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {languages.map((lang, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {lang}
              <Button
                onClick={() => removeLanguage(idx)}
                type="button"
                variant="outline"
                size="icon"
                className="size-7 rounded-full"
              >
                <X className="h-3 w-3 cursor-pointer" />
              </Button>
            </Badge>
          ))}
        </div>

        <Input
          placeholder="Type language and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLanguage(e.target.value);
              e.target.value = "";
            }
          }}
        />
      </div>

      {/* ABOUT */}
      <FormField
        control={control}
        name="about"
        render={({ field }) => (
          <FormItem>
            <FormLabel>About</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Write something about the service provider..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* EMERGENCY CONTACT */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="emergencyContact.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact Name</FormLabel>
              <FormControl>
                <Input placeholder="Full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="emergencyContact.relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship</FormLabel>
              <FormControl>
                <Input placeholder="Brother, Father, Friend..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="emergencyContact.mobile"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Emergency Contact Number</FormLabel>
            <FormControl>
              <Input placeholder="10 digit mobile number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* CURRENTLY AVAILABLE */}
      <FormField
        control={control}
        name="isAvailable"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-3">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="font-normal">Currently available</FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
