"use client";

import { Check, ChevronsUpDown, MapPin, Phone, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

export function CustomCombobox({
  items,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  labelKey = "label",
  valueKey = "value",
  search,
  setSearch,
  className,
  loading = false,
  disabled = false,
  onOpenChange,
  variant = "default",
  dropdownClassName,
}) {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((i) => String(i[valueKey]) === value);
  const selectedLabel = selectedItem?.[labelKey] ?? "";

  const getInitials = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "PT";
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  };

  const renderPatientItem = (item, isSelected) => {
    const patientName = item.fullName || item[labelKey] || "Unknown Patient";
    const patientIdentifier = item.patientId || item._id || "";
    const patientPhone = item.phone || "Phone not provided";
    const patientLocation = item.city || item.address || "";

    return (
      <div
        className={cn(
          "group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 transition-all duration-200",
          isSelected
            ? "border-blue-200 bg-blue-50/80 shadow-sm"
            : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
        )}
      >
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0EA5E9] text-sm font-semibold text-white shadow-sm">
          {getInitials(patientName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[#0F172A]">
              {patientName}
            </p>
            {isSelected ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
            ) : null}
          </div>

          <p className="mt-0.5 text-xs font-medium tracking-wide text-[#64748B]">
            {patientIdentifier}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {patientPhone}
            </span>
            {patientLocation ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {patientLocation}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        onOpenChange?.(nextOpen);
      }}
      modal={false}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-12 w-[200px] justify-between rounded-xl border-[#D8DEE8] bg-white text-left text-base font-medium text-[#0F172A] hover:bg-white",
            className
          )}
          disabled={disabled}
        >
          {selectedLabel || placeholder}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-[420px] overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white p-0 shadow-[0_14px_40px_rgba(15,23,42,0.12)]",
          dropdownClassName
        )}
      >
        <Command shouldFilter={false}>
          <div className="sticky top-0 z-10 border-b border-[#EEF2F7] bg-white/95 px-3 py-3 backdrop-blur">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder={searchPlaceholder}
                className="h-10 rounded-xl border border-[#D8DEE8] bg-[#F8FAFC] pl-9 text-sm"
              />
            </div>
          </div>

          <CommandList
            key={items.length}
            className="patient-selector-scroll max-h-[320px] px-2 py-2"
          >
            {loading && (
              <div className="flex w-full items-center justify-center py-6">
                <Spinner />
              </div>
            )}

            {!loading && items.length === 0 && (
              <CommandEmpty className="py-10 text-center">
                <p className="text-sm font-medium text-[#0F172A]">
                  No patients found
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  Try searching by name, phone, or patient ID.
                </p>
              </CommandEmpty>
            )}

            <CommandGroup className="space-y-1">
              {items.map((item, idx) => {
                const val = String(item[valueKey]);
                const lbl = String(item[labelKey] || "");
                const isSelected = value === val;

                return (
                  <CommandItem
                    key={idx}
                    value={val}
                    className="cursor-pointer rounded-2xl px-0 py-0 aria-selected:bg-transparent"
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {variant === "patient"
                      ? renderPatientItem(item, isSelected)
                      : (
                        <div className="flex w-full items-center justify-between rounded-xl px-3 py-2">
                          <span className="truncate">{lbl}</span>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                      )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
