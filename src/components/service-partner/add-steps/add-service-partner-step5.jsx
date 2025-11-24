import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldArray, useFormContext } from "react-hook-form";

export const AddServicePartnerStep5 = () => {
  const { control, getValues } = useFormContext();

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const {
    fields: timeSlotFields,
    append: addSlot,
    remove: removeSlot,
  } = useFieldArray({ control, name: "availability.timeSlots" });

  return (
    <div>
      {/* BANK DETAILS */}
      <div className="">
        <h2 className="text-xl font-semibold mb-2">Bank Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="bankDetails.accountHolderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="bankDetails.accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="bankDetails.ifscCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="bankDetails.bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="bankDetails.branchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Name (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="bankDetails.upiId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UPI ID (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* AVAILABILITY */}
      <div className="mt-5">
        <h2 className="text-xl font-semibold mb-2">Availability</h2>

        {/* DAYS */}
        <div className="space-y-3">
          <FormLabel>Available Days</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {daysOfWeek.map((day) => (
              <FormField
                key={day}
                control={control}
                name="availability.days"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(day)}
                        onCheckedChange={(checked) => {
                          const value = field.value || [];
                          if (checked) field.onChange([...value, day]);
                          else field.onChange(value.filter((d) => d !== day));
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">{day}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* 24x7 */}
        <FormField
          control={control}
          name="availability.available24x7"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 mt-5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Available 24 × 7</FormLabel>
            </FormItem>
          )}
        />

        {/* TIME SLOTS */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Time Slots</FormLabel>
            <Button
              type="button"
              variant="outline"
              onClick={() => addSlot({ startTime: "", endTime: "" })}
            >
              Add Slot
            </Button>
          </div>

          {timeSlotFields.length === 0 && (
            <p className="text-sm text-gray-500">No time slots added yet.</p>
          )}

          {timeSlotFields.map((slot, i) => (
            <div
              key={slot.id}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-xl"
            >
              <FormField
                control={control}
                name={`availability.timeSlots.${i}.startTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`availability.timeSlots.${i}.endTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="destructive"
                onClick={() => removeSlot(i)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
