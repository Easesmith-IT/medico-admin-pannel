"use client";

import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export function AddressSelectionGrid({ control, addresses = [], patientId }) {
  return (
    <div className="rounded-2xl border border-[#DBEAFE] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <p className="text-base font-semibold text-[#0F172A]">Address & Delivery Context</p>
      <p className="mb-3 text-sm text-[#64748B]">Compact tiles optimized for serviceability and audit context.</p>

      <FormField
        control={control}
        name="addressId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select address</FormLabel>
            <FormControl>
              <div className="grid gap-2 md:grid-cols-2">
                {addresses.map((address) => {
                  const selected = field.value === address.value;
                  return (
                    <button
                      type="button"
                      key={address.key}
                      onClick={() => field.onChange(address.value)}
                      className={cn(
                        "relative rounded-xl border px-3 py-2 text-left transition-all",
                        selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#BFDBFE]"
                      )}
                    >
                      {selected ? <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-[#2563EB]" /> : null}
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">{address.label || "Address"}</p>
                      <p className="text-sm font-medium text-[#0F172A]">{address.street}</p>
                      <p className="text-xs text-[#334155]">{address.city}, {address.state} - {address.pincode}</p>
                      <div className="mt-1 flex gap-1">
                        {address.isDefault ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">Default</span> : null}
                        <span className="rounded-full border border-[#CBD5E1] bg-white px-2 py-0.5 text-[10px] text-[#334155]">Serviceable</span>
                      </div>
                    </button>
                  );
                })}

                <Link
                  href={patientId ? `/admin/patients/${patientId}` : "/admin/patients"}
                  className="flex min-h-[92px] items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-xs font-medium text-[#334155] hover:bg-[#F1F5F9]"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add New Address
                </Link>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
