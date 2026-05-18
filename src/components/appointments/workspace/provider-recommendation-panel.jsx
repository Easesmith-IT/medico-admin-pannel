"use client";

import { Sparkles, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const initials = (value = "Provider") =>
  String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("") || "SP";

export function ProviderRecommendationPanel({
  control,
  providers = [],
  recommendedProviderId,
  onAutoAssign,
}) {
  return (
    <div className="rounded-2xl border border-[#DBEAFE] bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-[#0F172A]">Provider Matching Panel</p>
          <p className="text-sm text-[#64748B]">Operational fit and assignment intelligence.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAutoAssign}>
          <Sparkles className="h-4 w-4" />
          Auto Assign Best Provider
        </Button>
      </div>

      <FormField
        control={control}
        name="servicePartnerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select provider</FormLabel>
            <FormControl>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {providers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">
                    No providers available for selected service/city.
                  </div>
                ) : (
                  providers.map((provider) => {
                    const selected = field.value === provider._id;
                    const recommended = provider._id === recommendedProviderId;
                    return (
                      <motion.button
                        key={provider._id}
                        type="button"
                        whileHover={{ y: -2 }}
                        onClick={() => field.onChange(selected ? "" : provider._id)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-all",
                          selected
                            ? "border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_2px_rgba(37,99,235,0.2)]"
                            : "border-[#E2E8F0] bg-white"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Avatar className="h-10 w-10 border border-[#BFDBFE]">
                            <AvatarImage src={provider?.documents?.profilePhoto || ""} />
                            <AvatarFallback className="bg-[#DBEAFE] text-[#1D4ED8]">
                              {initials(`${provider.firstName || ""} ${provider.lastName || ""}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#0F172A]">
                              {provider.firstName} {provider.lastName}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {provider?.currentAddress?.city || "City unavailable"}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1 text-xs">
                              <Badge className="rounded-full border border-[#CBD5E1] bg-white text-[#334155]">
                                <Star className="mr-1 h-3 w-3" />
                                {provider?.rating?.average?.toFixed?.(1) || 0}
                              </Badge>
                              <Badge className="rounded-full border border-[#CBD5E1] bg-white text-[#334155]">
                                <Users className="mr-1 h-3 w-3" />
                                load {provider.syntheticLoad}
                              </Badge>
                              {recommended ? (
                                <Badge className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">Recommended</Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
