"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const toCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

export function ServiceSelectorWorkspace({ control, services = [], selectedService, providerCount = 0 }) {
  const [open, setOpen] = useState(false);

  const normalized = useMemo(
    () =>
      services.map((service) => ({
        ...service,
        popularityScore: Math.max(55, 55 + (Number(service.basePrice || 0) % 40)),
      })),
    [services]
  );

  return (
    <Card className="rounded-2xl border border-[#DBEAFE] bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <CardHeader>
        <CardTitle className="text-base text-[#0F172A]">Service Selection Workspace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Service</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" role="combobox" className="h-11 w-full justify-between rounded-xl">
                      {selectedService?.name || "Search and select service"}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[420px] max-w-[92vw] p-0" align="start">
                  <Command>
                    <div className="border-b border-[#E2E8F0] p-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <CommandInput placeholder="Search by service name or category" className="h-10 rounded-xl border border-[#E2E8F0] pl-9" />
                      </div>
                    </div>
                    <CommandList className="max-h-[320px] p-2">
                      <CommandEmpty>No services found.</CommandEmpty>
                      <CommandGroup className="space-y-2">
                        {normalized.map((service) => {
                          const selected = field.value === service._id;
                          return (
                            <CommandItem
                              key={service._id}
                              value={`${service.name} ${service.category}`}
                              className="cursor-pointer rounded-xl p-0"
                              onSelect={() => {
                                field.onChange(service._id);
                                setOpen(false);
                              }}
                            >
                              <div className={cn("w-full rounded-xl border p-3", selected ? "border-[#93C5FD] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white") }>
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-[#0F172A]">{service.name}</p>
                                    <p className="text-xs text-[#64748B]">{service.category || "General"}</p>
                                  </div>
                                  <Check className={cn("h-4 w-4", selected ? "opacity-100 text-[#2563EB]" : "opacity-0")} />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#334155]">
                                  <span>Duration: {service.defaultDuration || 30} mins</span>
                                  <span>Base: {toCurrency(service.basePrice)}</span>
                                  <span>Coverage: {(service.cities || []).length} cities</span>
                                  <span>Popularity: {service.popularityScore}%</span>
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedService ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-[#DBEAFE] text-[#1D4ED8]">{selectedService.category}</Badge>
              <Badge className="rounded-full border border-[#CBD5E1] bg-white text-[#334155]">
                Duration {selectedService.defaultDuration || 30}m
              </Badge>
              <Badge className="rounded-full border border-[#CBD5E1] bg-white text-[#334155]">
                Estimated {toCurrency(selectedService.basePrice)}
              </Badge>
              <Badge className="rounded-full border border-[#CBD5E1] bg-white text-[#334155]">
                Modes {(selectedService.modes || []).join(" / ") || "Home Service"}
              </Badge>
              <Badge className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
                <Users className="mr-1 h-3 w-3" />
                Providers {providerCount}
              </Badge>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
