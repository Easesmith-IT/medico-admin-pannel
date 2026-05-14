"use client";

import { AlertTriangle, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const severityTone = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const severityIcon = {
  high: AlertTriangle,
  medium: Clock3,
  low: CheckCircle2,
};

export const AppointmentRecommendations = ({
  items = [],
  onTriggerAction,
}) => {
  return (
    <Card className="border-white/40 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-[#2563eb]" />
          Recommended Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-[#64748b]">No operational recommendations right now.</p>
        ) : null}

        {items.map((item, index) => {
          const severity = String(item?.severity || "medium").toLowerCase();
          const ToneIcon = severityIcon[severity] || Clock3;

          return (
            <motion.div
              key={`${item?.key || "recommendation"}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 rounded-lg bg-slate-100 p-1">
                    <ToneIcon className="h-3.5 w-3.5 text-slate-700" />
                  </span>
                  <p className="text-sm text-[#0f172a]">{item?.message || "Operational recommendation available."}</p>
                </div>
                <Badge className={severityTone[severity] || severityTone.medium}>
                  {severity}
                </Badge>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onTriggerAction?.(item)}
                className="h-8 rounded-lg"
              >
                {item?.cta || "Open"}
              </Button>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
