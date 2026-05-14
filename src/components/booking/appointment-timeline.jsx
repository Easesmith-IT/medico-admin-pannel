"use client";

import { Activity, CalendarClock, CheckCircle2, CircleDollarSign, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const eventIconMap = {
  booking_created: CalendarClock,
  booking_approved: CheckCircle2,
  payment_received: CircleDollarSign,
  refund_update: RefreshCcw,
  visit_started: Activity,
  visit_completed: CheckCircle2,
  webhook: Activity,
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export const AppointmentTimeline = ({ events = [] }) => {
  return (
    <Card className="border-white/40 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-[#64748b]">No timeline events available.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => {
              const Icon = eventIconMap[event?.type] || Activity;
              return (
                <motion.div
                  key={`${event?.type || "event"}-${index}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-lg bg-slate-100 p-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-700" />
                    </span>
                    <p className="text-sm font-semibold text-[#0f172a]">{event?.title || "Event"}</p>
                  </div>
                  <p className="text-xs text-[#475569]">{event?.description || "-"}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>{formatDateTime(event?.timestamp)}</span>
                    <span>{event?.actor || "System"}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
