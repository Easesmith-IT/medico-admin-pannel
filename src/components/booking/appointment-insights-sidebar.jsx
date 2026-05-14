"use client";

import { AlertTriangle, BarChart3, ClipboardList, Gauge, Lightbulb, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const metric = (value, fallback = "-") =>
  value === null || value === undefined || value === "" ? fallback : value;

export const AppointmentInsightsSidebar = ({
  bookingStatus,
  analytics = {},
  treatmentFlow = {},
  paymentLedger,
  quickActions = [],
  smartInsights = [],
  onQuickAction,
}) => {
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Card className="border-white/40 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4 text-[#2563eb]" />
            Appointment Risk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-[#334155]">
            Status: <span className="font-semibold text-[#0f172a]">{metric(bookingStatus)}</span>
          </p>
          <p className="text-[#334155]">
            Overdue:{" "}
            <span className={analytics?.isOverdue ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>
              {analytics?.isOverdue ? "Yes" : "No"}
            </span>
          </p>
          <p className="text-[#334155]">
            Treatment expiry risk:{" "}
            <span
              className={
                analytics?.treatmentNearExpiry
                  ? "font-semibold text-amber-600"
                  : "font-semibold text-emerald-600"
              }
            >
              {analytics?.treatmentNearExpiry ? "Near expiry" : "Stable"}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/40 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-[#2563eb]" />
            Payment Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-[#334155]">
            Ledger Status:{" "}
            <span className="font-semibold text-[#0f172a]">
              {metric(paymentLedger?.paymentStatus || analytics?.paymentStatus)}
            </span>
          </p>
          <p className="text-[#334155]">
            Pending:{" "}
            <span className="font-semibold text-[#0f172a]">
              {metric(analytics?.pendingAmount)}
            </span>
          </p>
          <p className="text-[#334155]">
            Refunded:{" "}
            <span className="font-semibold text-[#0f172a]">
              {metric(analytics?.totalRefunded)}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/40 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ClipboardList className="h-4 w-4 text-[#2563eb]" />
            Treatment Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-[#334155]">
            Sessions:{" "}
            <span className="font-semibold text-[#0f172a]">
              {metric(treatmentFlow?.sessionProgress, 0)} / {metric(treatmentFlow?.totalSessions, 1)}
            </span>
          </p>
          <Progress value={Number(analytics?.completionPercentage || 0)} />
          <p className="text-xs text-[#64748b]">{metric(analytics?.completionPercentage, 0)}% completed</p>
        </CardContent>
      </Card>

      <Card className="border-white/40 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-[#2563eb]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.length === 0 ? (
            <p className="text-sm text-[#64748b]">No quick actions available.</p>
          ) : (
            quickActions.map((item, index) => (
              <Button
                key={`${item?.key || "action"}-${index}`}
                variant="outline"
                className="h-8 w-full justify-start"
                onClick={() => onQuickAction?.(item)}
              >
                {item?.cta || "Open"}
              </Button>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-white/40 bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-[#2563eb]" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {smartInsights.length === 0 ? (
            <p className="text-sm text-[#64748b]">No insights generated yet.</p>
          ) : (
            smartInsights.map((insight, index) => (
              <div key={`${insight}-${index}`} className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-[#334155]">
                {insight}
              </div>
            ))
          )}
          {analytics?.isOverdue ? (
            <Badge className="mt-1 border border-red-200 bg-red-50 text-red-700">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Overdue follow-up required
            </Badge>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
