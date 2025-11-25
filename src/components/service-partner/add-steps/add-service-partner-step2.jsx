import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export const AddServicePartnerStep2 = () => {
  const { control, watch, setValue, getValues } = useFormContext();

  const sameAsCurrent = watch("permanentAddress.sameAsCurrent");

  const street = watch("currentAddress.street");
  const locality = watch("currentAddress.locality");
  const city = watch("currentAddress.city");
  const state = watch("currentAddress.state");
  const country = watch("currentAddress.country");
  const pincode = watch("currentAddress.pincode");
  const landmark = watch("currentAddress.landmark");

  console.log("sameAsCurrent", sameAsCurrent);

  // useEffect(() => {
  //   if (sameAsCurrent) {
  //     setValue("permanentAddress.street", getValues("currentAddress.street"));
  //     setValue(
  //       "permanentAddress.locality",
  //       getValues("currentAddress.locality")
  //     );
  //     setValue("permanentAddress.city", getValues("currentAddress.city"));
  //     setValue("permanentAddress.state", getValues("currentAddress.state"));
  //     setValue("permanentAddress.country", getValues("currentAddress.country"));
  //     setValue("permanentAddress.pincode", getValues("currentAddress.pincode"));
  //     setValue(
  //       "permanentAddress.landmark",
  //       getValues("currentAddress.landmark")
  //     );
  //   }
  // }, [sameAsCurrent]);

  useEffect(() => {
    if (sameAsCurrent) {
      setValue("permanentAddress.street", street);
      setValue("permanentAddress.locality", locality);
      setValue("permanentAddress.city", city);
      setValue("permanentAddress.state", state);
      setValue("permanentAddress.country", country);
      setValue("permanentAddress.pincode", pincode);
      setValue("permanentAddress.landmark", landmark);
    }
  }, [
    sameAsCurrent,
    street,
    locality,
    city,
    state,
    country,
    pincode,
    landmark,
  ]);

  return (
    <div>
      <h3 className="text-sm font-medium mb-4">Current Address</h3>
      <div className="grid grid-cols-3 gap-2">
        <FormField
          control={control}
          name="currentAddress.street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="currentAddress.locality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Locality</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="currentAddress.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="currentAddress.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="currentAddress.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="currentAddress.landmark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Landmark</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="currentAddress.pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pincode</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-sm font-medium mt-6 mb-4">Permanent Address</h3>
      <FormField
        control={control}
        name="permanentAddress.sameAsCurrent"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
              />
            </FormControl>
            <FormLabel>Same as current address</FormLabel>
          </FormItem>
        )}
      />
      <div className="grid grid-cols-3 gap-5 mt-4">
        <FormField
          control={control}
          name="permanentAddress.street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input disabled={sameAsCurrent} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="permanentAddress.locality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Locality</FormLabel>
              <FormControl>
                <Input disabled={sameAsCurrent} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="permanentAddress.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input disabled={sameAsCurrent} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="permanentAddress.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input disabled={sameAsCurrent} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="permanentAddress.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input disabled={sameAsCurrent} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="permanentAddress.landmark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Landmark</FormLabel>
              <FormControl>
                <Input disabled={sameAsCurrent} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="permanentAddress.pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pincode</FormLabel>
              <FormControl>
                <Input disabled={sameAsCurrent} type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-sm font-medium mt-6 mb-4">Work Address (optional)</h3>
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={control}
          name="workAddress.clinicName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic / Work place</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="workAddress.street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="workAddress.locality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Locality</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="workAddress.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="workAddress.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="workAddress.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="workAddress.landmark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Landmark</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="workAddress.pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pincode</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
