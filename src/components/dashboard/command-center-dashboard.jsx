"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIcon,
  AlertTriangleIcon,
  BellIcon,
  CalendarDaysIcon,
  Clock3Icon,
  DownloadIcon,
  FilterIcon,
  LineChartIcon,
  PlayIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  UserRoundIcon,
  UsersIcon,
  WalletIcon,
  WifiIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { StateView } from "@/components/shared/state-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GlassCard } from "@/components/ui/GlassCard";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useListQueryParams } from "@/hooks/use-list-query-params";
import { axiosInstance } from "@/lib/axiosInstance";
import { getCurrentAdminUser, normalizeRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { motion as appMotion } from "@/styles/motion";

const toInputDate = (date) => {
  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
};

const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 29);

const defaults = {
  fromDate: toInputDate(thirtyDaysAgo),
  toDate: toInputDate(today),
  grain: "day",
  cityId: "",
  serviceId: "",
};

const buildQuery = (params) => {
  const query = new URLSearchParams();
  if (params.fromDate) query.set("fromDate", params.fromDate);
  if (params.toDate) query.set("toDate", params.toDate);
  if (params.grain) query.set("grain", params.grain);
  if (params.cityId) query.set("cityId", params.cityId);
  if (params.serviceId) query.set("serviceId", params.serviceId);
  return query.toString();
};

const formatCurrency = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const parseFilename = (contentDisposition, fallback) => {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i);
  const value = decodeURIComponent(match?.[1] || match?.[2] || "").trim();
  return value || fallback;
};

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

const buildRelativeTime = (value) => {
  if (!value) return "Updated now";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (minutes < 1) return "Updated now";
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
};

const getSeverityBadge = (severity) => {
  switch (severity) {
    case "high":
      return "destructive";
    case "medium":
      return "pending";
    default:
      return "secondary";
  }
};

const getHealthTone = (status) => {
  switch (status) {
    case "healthy":
      return "approved";
    case "warning":
      return "pending";
    default:
      return "rejected";
  }
};

const CounterText = ({ value, formatValue, className }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value || 0);
    if (!Number.isFinite(target)) {
      setDisplay(0);
      return;
    }

    const duration = 550;
    const start = performance.now();
    let rafId;

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return <span className={className}>{formatValue(display)}</span>;
};

const DashboardKpiCard = ({ metric, trendRows, index }) => {
  const trendPoints = useMemo(() => {
    if (!trendRows.length) return [];
    const key = metric.trendKey;
    return trendRows
      .map((row) => Number(row[key] || 0))
      .slice(-12);
  }, [metric.trendKey, trendRows]);

  return (
    <motion.article
      {...appMotion.fadeUp}
      transition={{ ...appMotion.fadeUp.transition, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      className="rounded-[18px] border border-white/70 bg-gradient-to-br from-white/95 via-white/85 to-[#f8fbff] p-4 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_24px_rgb(15_23_42_/_0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{metric.label}</p>
          {metric.isCurrency ? (
            <CounterText
              value={metric.rawValue}
              formatValue={(val) => formatCurrency(val)}
              className="text-[30px] font-bold tracking-[-0.03em] text-[#0F172A]"
            />
          ) : (
            <CounterText
              value={metric.rawValue}
              formatValue={(val) => Math.round(val).toLocaleString("en-IN")}
              className="text-[30px] font-bold tracking-[-0.03em] text-[#0F172A]"
            />
          )}
          <p className="text-xs text-[#475569]">{metric.delta}</p>
        </div>
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
          <metric.icon className="size-5" />
        </span>
      </div>
      <div className="mt-3 flex h-8 items-end gap-1.5">
        {trendPoints.length
          ? trendPoints.map((point, pointIndex) => {
            const max = Math.max(...trendPoints, 1);
            const barHeight = Math.max((point / max) * 30, 4);
            return (
              <span
                key={`${metric.key}-${pointIndex}`}
                className="w-full rounded-full bg-gradient-to-t from-[#bfdbfe] to-[#2563eb]/80"
                style={{ height: `${barHeight}px` }}
              />
            );
          })
          : Array.from({ length: 12 }).map((_, placeholderIndex) => (
            <span key={`${metric.key}-empty-${placeholderIndex}`} className="h-2 w-full rounded-full bg-[#e2e8f0]" />
          ))}
      </div>
    </motion.article>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-3">
    <div>
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p> : null}
    </div>
    {action}
  </div>
);

const ScheduleDialog = ({
  open,
  onClose,
  mode,
  initial,
  options,
  fallbackFilters,
  onSubmit,
  isPending,
}) => {
  const [form, setForm] = useState({
    name: "",
    frequency: "weekly",
    format: "csv",
    active: true,
    fromDate: fallbackFilters.fromDate,
    toDate: fallbackFilters.toDate,
    grain: fallbackFilters.grain,
    cityId: fallbackFilters.cityId,
    serviceId: fallbackFilters.serviceId,
  });

  useEffect(() => {
    if (!open) return;
    const sourceFilters = initial?.filters || {};
    setForm({
      name: initial?.name || "",
      frequency: initial?.frequency || "weekly",
      format: initial?.format || "csv",
      active: initial?.active ?? true,
      fromDate: sourceFilters.fromDate ? toInputDate(sourceFilters.fromDate) : fallbackFilters.fromDate,
      toDate: sourceFilters.toDate ? toInputDate(sourceFilters.toDate) : fallbackFilters.toDate,
      grain: sourceFilters.grain || fallbackFilters.grain || "day",
      cityId: sourceFilters.cityId || fallbackFilters.cityId || "",
      serviceId: sourceFilters.serviceId || fallbackFilters.serviceId || "",
    });
  }, [open, initial, fallbackFilters]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Schedule name is required");
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      reportType: "command-center",
      frequency: form.frequency,
      format: form.format,
      active: form.active,
      filters: {
        fromDate: form.fromDate,
        toDate: form.toDate,
        grain: form.grain,
        cityId: form.cityId || undefined,
        serviceId: form.serviceId || undefined,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Report Schedule" : "Create Report Schedule"}</DialogTitle>
          <DialogDescription>
            Configure recurring command-center snapshots for operational reporting.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Schedule Name</label>
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Weekly Operations Snapshot"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Frequency</label>
            <Select
              value={form.frequency}
              onValueChange={(value) => setForm((prev) => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Format</label>
            <Select
              value={form.format}
              onValueChange={(value) => setForm((prev) => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">From Date</label>
            <Input
              type="date"
              value={form.fromDate}
              onChange={(event) => setForm((prev) => ({ ...prev, fromDate: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">To Date</label>
            <Input
              type="date"
              value={form.toDate}
              onChange={(event) => setForm((prev) => ({ ...prev, toDate: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Trend Grain</label>
            <Select
              value={form.grain}
              onValueChange={(value) => setForm((prev) => ({ ...prev, grain: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Grain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <Select
              value={form.cityId || "all"}
              onValueChange={(value) => setForm((prev) => ({ ...prev, cityId: value === "all" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {(options?.cities || []).map((city) => (
                  <SelectItem key={city._id} value={city._id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Service</label>
            <Select
              value={form.serviceId || "all"}
              onValueChange={(value) => setForm((prev) => ({ ...prev, serviceId: value === "all" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {(options?.services || []).map((service) => (
                  <SelectItem key={service._id} value={service._id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <Select
              value={form.active ? "active" : "paused"}
              onValueChange={(value) => setForm((prev) => ({ ...prev, active: value === "active" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Saving..." : mode === "edit" ? "Update Schedule" : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CommandCenterDashboard = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const queryClient = useQueryClient();
  const currentUser = getCurrentAdminUser();
  const role = normalizeRole(currentUser?.role);
  const canMutateSchedules = role === "superadmin" || role === "subadmin";

  const [commandSearch, setCommandSearch] = useState("");
  const [scheduleDialog, setScheduleDialog] = useState({
    open: false,
    mode: "create",
    schedule: null,
  });

  const query = useMemo(
    () => buildQuery(params),
    [params.fromDate, params.toDate, params.grain, params.cityId, params.serviceId]
  );

  const reportQuery = useApiQuery({
    url: `/admin/reports/command-center?${query}`,
    queryKeys: ["dashboard-command-center", query],
  });

  const optionsQuery = useApiQuery({
    url: "/admin/reports/filter-options",
    queryKeys: ["dashboard-command-center-options"],
  });

  const schedulesQuery = useApiQuery({
    url: "/admin/reports/schedules?page=1&limit=20",
    queryKeys: ["dashboard-schedules"],
  });

  const runsQuery = useApiQuery({
    url: "/admin/reports/runs?page=1&limit=20",
    queryKeys: ["dashboard-report-runs"],
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/admin/reports/schedules", payload);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Schedule created");
      queryClient.invalidateQueries({ queryKey: ["dashboard-schedules"], exact: false });
      setScheduleDialog({ open: false, mode: "create", schedule: null });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error.message),
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ scheduleId, payload }) => {
      const response = await axiosInstance.patch(`/admin/reports/schedules/${scheduleId}`, payload);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Schedule updated");
      queryClient.invalidateQueries({ queryKey: ["dashboard-schedules"], exact: false });
      setScheduleDialog({ open: false, mode: "create", schedule: null });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error.message),
  });

  const runScheduleMutation = useMutation({
    mutationFn: async (scheduleId) => {
      const response = await axiosInstance.post(`/admin/reports/schedules/${scheduleId}/run`);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Schedule executed");
      queryClient.invalidateQueries({ queryKey: ["dashboard-schedules"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard-report-runs"], exact: false });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error.message),
  });

  const runDueMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/admin/reports/schedules/run-due");
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Due schedules executed");
      queryClient.invalidateQueries({ queryKey: ["dashboard-schedules"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard-report-runs"], exact: false });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error.message),
  });

  const commandCenter = reportQuery.data?.data;
  const options = optionsQuery.data?.data || { cities: [], services: [] };

  const trendRows = useMemo(() => {
    if (!commandCenter?.trends?.labels?.length) return [];
    const users = commandCenter.trends.series?.users || [];
    const doctors = commandCenter.trends.series?.doctors || [];
    const appointments = commandCenter.trends.series?.appointments || [];
    const disputes = commandCenter.trends.series?.disputes || [];
    const revenue = commandCenter.trends.series?.revenue || [];
    return commandCenter.trends.labels.map((label, index) => ({
      label,
      users: users[index]?.value || 0,
      doctors: doctors[index]?.value || 0,
      appointments: appointments[index]?.value || 0,
      disputes: disputes[index]?.value || 0,
      revenue: revenue[index]?.value || 0,
    }));
  }, [commandCenter]);

  const metrics = useMemo(() => {
    if (!commandCenter) return [];
    return [
      {
        key: "users",
        label: "Users",
        rawValue: commandCenter.kpis?.users?.value ?? 0,
        delta: `+${commandCenter.kpis?.users?.periodNew ?? 0} new in selected window`,
        icon: UsersIcon,
        trendKey: "users",
        isCurrency: false,
      },
      {
        key: "doctors",
        label: "Doctors",
        rawValue: commandCenter.kpis?.doctors?.value ?? 0,
        delta: `+${commandCenter.kpis?.doctors?.periodNew ?? 0} new in selected window`,
        icon: UserRoundIcon,
        trendKey: "doctors",
        isCurrency: false,
      },
      {
        key: "appointments",
        label: "Appointments",
        rawValue: commandCenter.kpis?.appointments?.value ?? 0,
        delta: "Total activity for current filters",
        icon: CalendarDaysIcon,
        trendKey: "appointments",
        isCurrency: false,
      },
      {
        key: "revenue",
        label: "Revenue",
        rawValue: commandCenter.kpis?.revenue?.value ?? 0,
        delta: "Collected amount in this window",
        icon: WalletIcon,
        trendKey: "revenue",
        isCurrency: true,
      },
      {
        key: "disputes",
        label: "Disputes",
        rawValue: commandCenter.kpis?.disputes?.value ?? 0,
        delta: "Raised issues in this window",
        icon: ShieldAlertIcon,
        trendKey: "disputes",
        isCurrency: false,
      },
      {
        key: "providers",
        label: "Providers",
        rawValue: (commandCenter.kpis?.doctors?.value ?? 0) + (commandCenter.finance?.settlementPendingCount ?? 0),
        delta: "Provider participation signal",
        icon: ActivityIcon,
        trendKey: "doctors",
        isCurrency: false,
      },
    ];
  }, [commandCenter]);

  const heroStats = useMemo(() => {
    if (!commandCenter) return [];
    return [
      {
        id: "appointments-today",
        label: "Appointments Today",
        value: commandCenter.trends?.series?.appointments?.at(-1)?.value ?? 0,
      },
      {
        id: "pending-approval",
        label: "Pending Approvals",
        value: Math.max(
          (commandCenter.funnel?.registration || 0) - (commandCenter.funnel?.approval || 0),
          0,
        ),
      },
      {
        id: "unresolved-crashes",
        label: "Unresolved Crashes",
        value: commandCenter.support?.unresolvedCrashes || 0,
      },
      {
        id: "revenue-pulse",
        label: "Revenue Pulse",
        value: formatCurrency(commandCenter.kpis?.revenue?.value || 0),
      },
    ];
  }, [commandCenter]);

  const recommendationGroups = useMemo(() => {
    if (!commandCenter) return [];

    const groups = [
      {
        category: "Verification",
        items: [
          {
            id: "verification-gap",
            title: "Approvals pending review",
            severity: Math.max((commandCenter.funnel?.registration || 0) - (commandCenter.funnel?.approval || 0), 0) > 10 ? "high" : "medium",
            count: Math.max((commandCenter.funnel?.registration || 0) - (commandCenter.funnel?.approval || 0), 0),
            cta: "Review queue",
            note: buildRelativeTime(commandCenter.filtersApplied?.toDate),
          },
        ],
      },
      {
        category: "Appointments",
        items: [
          {
            id: "cancellations",
            title: "Cancellation requests need action",
            severity: (commandCenter.support?.cancellationRequests || 0) > 8 ? "high" : "medium",
            count: commandCenter.support?.cancellationRequests || 0,
            cta: "Open appointments",
            note: buildRelativeTime(commandCenter.filtersApplied?.toDate),
          },
        ],
      },
      {
        category: "Finance",
        items: [
          {
            id: "outstanding",
            title: "Outstanding dues detected",
            severity: (commandCenter.finance?.outstanding || 0) > 0 ? "high" : "low",
            count: formatCurrency(commandCenter.finance?.outstanding || 0),
            cta: "Open payments",
            note: buildRelativeTime(commandCenter.filtersApplied?.toDate),
          },
        ],
      },
      {
        category: "Risk",
        items: [
          {
            id: "open-disputes",
            title: "Open disputes in progress",
            severity: (commandCenter.support?.openDisputes || 0) > 0 ? "high" : "low",
            count: commandCenter.support?.openDisputes || 0,
            cta: "Resolve disputes",
            note: buildRelativeTime(commandCenter.filtersApplied?.toDate),
          },
          {
            id: "crash-risk",
            title: "Unresolved crashes require triage",
            severity: (commandCenter.support?.unresolvedCrashes || 0) > 0 ? "high" : "low",
            count: commandCenter.support?.unresolvedCrashes || 0,
            cta: "Open crash reports",
            note: buildRelativeTime(commandCenter.filtersApplied?.toDate),
          },
        ],
      },
      {
        category: "Coverage",
        items: [
          {
            id: "provider-capacity",
            title: "Provider capacity watch",
            severity: (commandCenter.kpis?.appointments?.value || 0) > (commandCenter.kpis?.doctors?.value || 1) * 25 ? "medium" : "low",
            count: `${(commandCenter.kpis?.doctors?.value || 0).toLocaleString("en-IN")} active providers`,
            cta: "Inspect providers",
            note: buildRelativeTime(commandCenter.filtersApplied?.toDate),
          },
        ],
      },
    ];

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (typeof item.count === "number") return item.count > 0;
          return String(item.count || "").trim() !== "";
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [commandCenter]);

  const liveOperations = useMemo(() => {
    if (!commandCenter) return [];
    return [
      {
        id: "active-appointments",
        title: "Active appointment throughput",
        value: commandCenter.kpis?.appointments?.value || 0,
        tone: "normal",
        icon: CalendarDaysIcon,
        detail: "Running activity in selected range",
      },
      {
        id: "pending-approvals",
        title: "Pending approvals",
        value: Math.max((commandCenter.funnel?.registration || 0) - (commandCenter.funnel?.approval || 0), 0),
        tone: "warning",
        icon: Clock3Icon,
        detail: "Waiting for admin action",
      },
      {
        id: "failed-payments",
        title: "Payment dispute pressure",
        value: commandCenter.support?.openDisputes || 0,
        tone: (commandCenter.support?.openDisputes || 0) > 0 ? "danger" : "normal",
        icon: WalletIcon,
        detail: "Open payment issues",
      },
      {
        id: "unresolved-crashes",
        title: "Crash reports unresolved",
        value: commandCenter.support?.unresolvedCrashes || 0,
        tone: (commandCenter.support?.unresolvedCrashes || 0) > 0 ? "danger" : "normal",
        icon: AlertTriangleIcon,
        detail: "Product stability queue",
      },
      {
        id: "refund-requests",
        title: "Refund load",
        value: commandCenter.finance?.refunded || 0,
        tone: (commandCenter.finance?.refunded || 0) > 0 ? "warning" : "normal",
        icon: ShieldAlertIcon,
        detail: "Total refunded in this range",
        isCurrency: true,
      },
    ];
  }, [commandCenter]);

  const systemHealth = useMemo(() => {
    if (!commandCenter) return [];
    const unresolvedCrashes = commandCenter.support?.unresolvedCrashes || 0;
    const openDisputes = commandCenter.support?.openDisputes || 0;
    const scheduleData = schedulesQuery.data?.data || [];
    const runData = runsQuery.data?.data || [];
    const failedRuns = runData.filter((run) => run.status === "failed").length;

    return [
      {
        id: "api",
        label: "API Health",
        status: unresolvedCrashes === 0 ? "healthy" : "warning",
        value: unresolvedCrashes === 0 ? "Stable" : `${unresolvedCrashes} unresolved events`,
      },
      {
        id: "payments",
        label: "Payment Gateway",
        status: openDisputes === 0 ? "healthy" : "warning",
        value: openDisputes === 0 ? "Healthy" : `${openDisputes} open disputes`,
      },
      {
        id: "cron",
        label: "Cron Jobs",
        status: failedRuns === 0 ? "healthy" : "warning",
        value: `${scheduleData.filter((row) => row.active).length} active schedules`,
      },
      {
        id: "uptime",
        label: "System Uptime",
        status: unresolvedCrashes > 8 ? "critical" : "healthy",
        value: unresolvedCrashes > 8 ? "Degraded" : "Nominal",
      },
      {
        id: "queue",
        label: "Worker Queue",
        status: failedRuns > 0 ? "warning" : "healthy",
        value: `${runData.filter((row) => row.status === "running").length} running`,
      },
      {
        id: "notifications",
        label: "Notification Delivery",
        status: (commandCenter.support?.cancellationRequests || 0) > 30 ? "warning" : "healthy",
        value: "Monitored",
      },
    ];
  }, [commandCenter, runsQuery.data?.data, schedulesQuery.data?.data]);

  const activityTimeline = useMemo(() => {
    if (!commandCenter) return [];

    return [
      {
        id: "event-1",
        title: "Command center refreshed",
        description: `Filters applied (${params.grain}) for ${params.fromDate} to ${params.toDate}`,
        time: buildRelativeTime(commandCenter.filtersApplied?.toDate || params.toDate),
        status: "neutral",
      },
      {
        id: "event-2",
        title: "Dispute posture updated",
        description: `${commandCenter.support?.openDisputes || 0} open disputes in current period`,
        time: buildRelativeTime(commandCenter.filtersApplied?.toDate),
        status: (commandCenter.support?.openDisputes || 0) > 0 ? "warn" : "good",
      },
      {
        id: "event-3",
        title: "Finance rollup captured",
        description: `GMV ${formatCurrency(commandCenter.finance?.gmv || 0)} | Refunded ${formatCurrency(commandCenter.finance?.refunded || 0)}`,
        time: buildRelativeTime(commandCenter.filtersApplied?.toDate),
        status: "good",
      },
      {
        id: "event-4",
        title: "Support queue snapshot",
        description: `${commandCenter.support?.cancellationRequests || 0} cancellations and ${commandCenter.support?.unresolvedCrashes || 0} unresolved crashes`,
        time: buildRelativeTime(commandCenter.filtersApplied?.toDate),
        status: (commandCenter.support?.unresolvedCrashes || 0) > 0 ? "warn" : "neutral",
      },
    ];
  }, [commandCenter, params.fromDate, params.grain, params.toDate]);

  const filteredLiveOps = useMemo(() => {
    if (!commandSearch.trim()) return liveOperations;
    const lookup = commandSearch.toLowerCase();
    return liveOperations.filter((item) =>
      `${item.title} ${item.detail}`.toLowerCase().includes(lookup),
    );
  }, [commandSearch, liveOperations]);

  const exportReport = async (format = "csv") => {
    try {
      const response = await axiosInstance.get(
        `/admin/reports/command-center/export?${query}&format=${format}`,
        { responseType: "blob" }
      );
      const fallback = `command-center-${Date.now()}.${format}`;
      const filename = parseFilename(response.headers["content-disposition"], fallback);
      downloadBlob(response.data, filename);
      toast.success("Dashboard export generated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const downloadRun = async (runId) => {
    try {
      const response = await axiosInstance.get(`/admin/reports/runs/${runId}/download`, {
        responseType: "blob",
      });
      const fallback = `report-run-${runId}.csv`;
      const filename = parseFilename(response.headers["content-disposition"], fallback);
      downloadBlob(response.data, filename);
      toast.success("Report downloaded");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleSaveSchedule = async (payload) => {
    if (scheduleDialog.mode === "edit" && scheduleDialog.schedule?._id) {
      await updateScheduleMutation.mutateAsync({
        scheduleId: scheduleDialog.schedule._id,
        payload,
      });
      return;
    }
    await createScheduleMutation.mutateAsync(payload);
  };

  const now = new Date();
  const currentDate = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const currentTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.section
        {...appMotion.fadeUp}
        className="sticky top-2 z-30 rounded-[18px] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_14px_36px_rgb(15_23_42_/_0.08)] backdrop-blur-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full min-w-0 max-w-[320px] items-center gap-2 rounded-xl border border-[#dbe4f8] bg-white/90 px-3 md:w-auto">
            <SearchIcon className="size-4 text-[#64748B]" />
            <Input
              value={commandSearch}
              onChange={(event) => setCommandSearch(event.target.value)}
              placeholder="Search operations"
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportReport("json")}>
              <DownloadIcon className="size-4" />
              Export JSON
            </Button>
            <Button variant="medico" size="sm" onClick={() => exportReport("csv")}>
              <DownloadIcon className="size-4" />
              Export CSV
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <BellIcon className="size-4" />
            </Button>
            <div className="rounded-xl border border-[#e2e8f0] bg-white/80 px-3 py-1.5 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">Command Clock</p>
              <p className="text-xs font-semibold text-[#0F172A]">{currentDate} | {currentTime}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">From Date</label>
            <Input type="date" value={params.fromDate} onChange={(event) => updateParams({ fromDate: event.target.value })} className="h-9" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">To Date</label>
            <Input type="date" value={params.toDate} onChange={(event) => updateParams({ toDate: event.target.value })} className="h-9" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">Trend Grain</label>
            <Select value={params.grain} onValueChange={(value) => updateParams({ grain: value })}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Trend grain" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">City</label>
            <Select value={params.cityId || "all"} onValueChange={(value) => updateParams({ cityId: value === "all" ? "" : value })}>
              <SelectTrigger className="h-9" disabled={optionsQuery.isLoading}><SelectValue placeholder="All cities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {(options.cities || []).map((city) => (
                  <SelectItem key={city._id} value={city._id}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">Service</label>
            <Select value={params.serviceId || "all"} onValueChange={(value) => updateParams({ serviceId: value === "all" ? "" : value })}>
              <SelectTrigger className="h-9" disabled={optionsQuery.isLoading}><SelectValue placeholder="All services" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {(options.services || []).map((service) => (
                  <SelectItem key={service._id} value={service._id}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {optionsQuery.error ? (
          <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Unable to load city/service filters.{" "}
            <button type="button" className="underline" onClick={optionsQuery.refetch}>
              Retry
            </button>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetParams}>
            <FilterIcon className="size-4" />
            Reset filters
          </Button>
          <Button variant="outline" size="sm" onClick={reportQuery.refetch}>
            <RefreshCwIcon className="size-4" />
            Refresh snapshot
          </Button>
        </div>
      </motion.section>

      {reportQuery.error ? (
        <StateView type="error" title="Unable to load command center" description={reportQuery.error.message} actionLabel="Retry" onAction={reportQuery.refetch} />
      ) : null}
      {reportQuery.isLoading ? <StateView type="loading" rows={8} /> : null}

      {!reportQuery.isLoading && !reportQuery.error && commandCenter ? (
        <>
          <motion.section
            {...appMotion.sectionReveal}
            className="relative overflow-hidden rounded-[30px] border border-[#18305c] bg-gradient-to-br from-[#0f172a] via-[#16284a] to-[#1d4ed8] px-5 py-6 text-white shadow-[0_24px_58px_rgb(15_23_42_/_0.34)] md:px-7"
          >
            <div className="pointer-events-none absolute -right-20 top-0 size-64 rounded-full bg-[#60a5fa]/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-[#1d4ed8]/30 blur-3xl" />
            <div className="relative grid gap-5 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="h-8 px-3 text-xs font-semibold">System Health: {(commandCenter.support?.unresolvedCrashes || 0) > 0 ? "Watch" : "Stable"}</Badge>
                  <Badge variant="paid" className="h-8 px-3 text-xs font-semibold">Revenue Pulse Active</Badge>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#bfdbfe]">Medico Healthcare Operations Dashboard</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-4xl">Medico Dashboard</h2>
                  <p className="mt-2 max-w-2xl text-sm text-[#dbeafe]">Unified operational intelligence across patient flow, approvals, finance health, and dispute pressure.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {heroStats.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/25 bg-white/10 px-3.5 py-3 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#bfdbfe]">{item.label}</p>
                      <p className="mt-1 text-xl font-semibold text-white">{typeof item.value === "number" ? item.value.toLocaleString("en-IN") : item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#bfdbfe]">Quick Command Actions</p>
                <div className="mt-3 grid gap-2">
                  <Button variant="heroLight" className="w-full justify-start" onClick={() => exportReport("csv")}>
                    <DownloadIcon className="size-4" />
                    Export command report
                  </Button>
                  {canMutateSchedules ? (
                    <Button variant="heroGhost" className="w-full justify-start" onClick={() => setScheduleDialog({ open: true, mode: "create", schedule: null })}>
                      <Clock3Icon className="size-4" />
                      Create schedule
                    </Button>
                  ) : null}
                  {canMutateSchedules ? (
                    <Button variant="heroGhost" className="w-full justify-start" onClick={() => runDueMutation.mutate()} disabled={runDueMutation.isPending}>
                      <PlayIcon className="size-4" />
                      Run due schedules
                    </Button>
                  ) : null}
                  <Button variant="heroGhost" className="w-full justify-start" onClick={reportQuery.refetch}>
                    <RefreshCwIcon className="size-4" />
                    Sync latest data
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="space-y-3">
            <SectionHeader
              title="Operational Recommendations"
              subtitle="Priority alerts grouped by verification, finance, risk, and care operations"
            />
            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {recommendationGroups.map((group) => (
                <GlassCard key={group.category} className="space-y-2 border-l-4 border-l-[#2563eb]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#0F172A]">{group.category}</p>
                    <Badge variant="secondary" className="h-7 px-2.5 text-[10px]">{group.items.length} alerts</Badge>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div key={item.id} className="rounded-xl border border-[#e2e8f0] bg-white/90 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-[#1e293b]">{item.title}</p>
                          <Badge variant={getSeverityBadge(item.severity)} className="h-7 px-2.5 text-[10px] uppercase">{item.severity}</Badge>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-[#64748B]">
                          <span>{typeof item.count === "number" ? item.count.toLocaleString("en-IN") : item.count}</span>
                          <span>{item.note}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-2 h-8 px-2.5 text-xs">
                          {item.cta}
                        </Button>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="KPI Analytics Grid" subtitle="Operational metrics with trend pulse and contextual delta" />
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric, index) => (
                <DashboardKpiCard key={metric.key} metric={metric} trendRows={trendRows} index={index} />
              ))}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-4">
              <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <Card className="rounded-[20px] border-[#dbe4f8] bg-white/92 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)]">
                  <CardHeader className="pb-2">
                    <SectionHeader title={`Operations Trend (${commandCenter.trends?.grain || "day"})`} subtitle="Users, doctors, appointments and disputes" />
                  </CardHeader>
                  <CardContent className="h-[300px] pb-5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendRows}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f8" />
                        <XAxis dataKey="label" hide={trendRows.length > 20} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="appointments" fill="#2563eb" name="Appointments" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="users" fill="#0ea5e9" name="Users" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="doctors" fill="#14b8a6" name="Doctors" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="disputes" fill="#f97316" name="Disputes" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-[20px] border-[#dbe4f8] bg-white/92 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)]">
                  <CardHeader className="pb-2">
                    <SectionHeader title="Revenue Trend" subtitle="Finance pulse for selected period" />
                  </CardHeader>
                  <CardContent className="h-[300px] pb-5">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendRows}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f8" />
                        <XAxis dataKey="label" hide={trendRows.length > 20} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.48} name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
                <GlassCard className="space-y-3">
                  <SectionHeader title="Live Operations" subtitle="Real-time operational posture from current report window" />
                  <div className="space-y-2">
                    {filteredLiveOps.map((item) => {
                      const toneClass =
                        item.tone === "danger"
                          ? "border-l-[#ef4444]"
                          : item.tone === "warning"
                            ? "border-l-[#f59e0b]"
                            : "border-l-[#10b981]";

                      return (
                        <div key={item.id} className={cn("rounded-xl border border-[#e2e8f0] border-l-4 bg-white/90 px-3 py-2.5", toneClass)}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <item.icon className="size-4 text-[#2563eb]" />
                              <p className="text-sm font-medium text-[#1e293b]">{item.title}</p>
                            </div>
                            <p className="text-sm font-semibold text-[#0f172a]">
                              {item.isCurrency ? formatCurrency(item.value) : Number(item.value || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-[#64748B]">{item.detail}</p>
                        </div>
                      );
                    })}
                    {!filteredLiveOps.length ? (
                      <div className="rounded-xl border border-dashed border-[#bfdbfe] bg-[#eff6ff]/70 px-4 py-5 text-center">
                        <p className="text-sm font-semibold text-[#1e3a8a]">No operations match current search</p>
                        <p className="mt-1 text-xs text-[#64748b]">Adjust command search or filters.</p>
                      </div>
                    ) : null}
                  </div>
                </GlassCard>

                <GlassCard className="space-y-3">
                  <SectionHeader title="Operational Intelligence" subtitle="Funnel, support and finance quick signals" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                      <span>Registration to Approval</span>
                      <span className="font-semibold text-[#0f172a]">{commandCenter.funnel?.registrationToApprovalRate || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                      <span>Approval to First Booking</span>
                      <span className="font-semibold text-[#0f172a]">{commandCenter.funnel?.approvalToFirstBookingRate || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                      <span>Open Disputes</span>
                      <span className="font-semibold text-[#ef4444]">{commandCenter.support?.openDisputes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                      <span>Settlement Pending</span>
                      <span className="font-semibold text-[#f59e0b]">{commandCenter.finance?.settlementPendingCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                      <span>Outstanding Amount</span>
                      <span className="font-semibold text-[#ef4444]">{formatCurrency(commandCenter.finance?.outstanding || 0)}</span>
                    </div>
                  </div>
                </GlassCard>
              </section>

              <section className="space-y-4">
                <SectionHeader
                  title="Report Center"
                  subtitle="Create recurring report schedules, run due jobs and download execution outputs"
                  action={
                    <div className="flex gap-2">
                      {canMutateSchedules ? (
                        <Button variant="outline" size="sm" onClick={() => runDueMutation.mutate()} disabled={runDueMutation.isPending}>
                          <PlayIcon className="size-4" />
                          Run Due
                        </Button>
                      ) : null}
                      {canMutateSchedules ? (
                        <Button variant="medico" size="sm" onClick={() => setScheduleDialog({ open: true, mode: "create", schedule: null })}>
                          Create Schedule
                        </Button>
                      ) : null}
                    </div>
                  }
                />

                <Card className="rounded-[20px] border-[#dbe4f8] bg-white/92 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)]">
                  <CardHeader><CardTitle className="text-base">Schedules</CardTitle></CardHeader>
                  <CardContent className="table-wrapper">
                    <div className="table-container">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Next Run</TableHead>
                            <TableHead>Last Run</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedulesQuery.isLoading
                            ? Array.from({ length: 5 }).map((_, index) => (
                              <TableRow key={`schedule-loading-${index}`}>
                                <TableCell colSpan={6}>
                                  <Skeleton className="h-6 w-full" />
                                </TableCell>
                              </TableRow>
                            ))
                            : null}
                          {schedulesQuery.error ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                                  <span>Unable to load schedules.</span>
                                  <Button size="sm" variant="outline" onClick={schedulesQuery.refetch}>
                                    Retry
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                          {!schedulesQuery.isLoading && !schedulesQuery.error
                            ? (schedulesQuery.data?.data || []).map((schedule) => (
                              <TableRow key={schedule._id}>
                                <TableCell className="font-medium">{schedule.name}</TableCell>
                                <TableCell className="capitalize">{schedule.frequency}</TableCell>
                                <TableCell>
                                  <Badge variant={schedule.active ? "approved" : "inactive"} className="h-7 px-2.5 text-[10px] uppercase">
                                    {schedule.active ? "Active" : "Paused"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDateTime(schedule.nextRunAt)}</TableCell>
                                <TableCell>{formatDateTime(schedule.lastRunAt)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {canMutateSchedules ? (
                                      <Button size="sm" variant="outline" onClick={() => setScheduleDialog({ open: true, mode: "edit", schedule })}>Edit</Button>
                                    ) : null}
                                    {canMutateSchedules ? (
                                      <Button size="sm" variant="outline" onClick={() => runScheduleMutation.mutate(schedule._id)} disabled={runScheduleMutation.isPending}>Run</Button>
                                    ) : null}
                                    {canMutateSchedules ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateScheduleMutation.mutate({ scheduleId: schedule._id, payload: { active: !schedule.active } })}
                                        disabled={updateScheduleMutation.isPending}
                                      >
                                        {schedule.active ? "Pause" : "Activate"}
                                      </Button>
                                    ) : null}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                            : null}
                          {!schedulesQuery.isLoading && !schedulesQuery.error && (schedulesQuery.data?.data || []).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                                  <LineChartIcon className="size-8 text-[#93c5fd]" />
                                  <p className="text-sm font-semibold text-[#1e3a8a]">No schedules configured</p>
                                  <p className="text-xs text-[#64748b]">Create a recurring command-center export to automate reporting.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[20px] border-[#dbe4f8] bg-white/92 shadow-[0_14px_34px_rgb(15_23_42_/_0.08)]">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ActivityIcon className="size-4" />Run History</CardTitle></CardHeader>
                  <CardContent className="table-wrapper">
                    <div className="table-container">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Started</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Format</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {runsQuery.isLoading
                            ? Array.from({ length: 5 }).map((_, index) => (
                              <TableRow key={`run-loading-${index}`}>
                                <TableCell colSpan={6}>
                                  <Skeleton className="h-6 w-full" />
                                </TableCell>
                              </TableRow>
                            ))
                            : null}
                          {runsQuery.error ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                                  <span>Unable to load report runs.</span>
                                  <Button size="sm" variant="outline" onClick={runsQuery.refetch}>
                                    Retry
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                          {!runsQuery.isLoading && !runsQuery.error
                            ? (runsQuery.data?.data || []).map((run) => (
                              <TableRow key={run._id}>
                                <TableCell>{formatDateTime(run.startedAt)}</TableCell>
                                <TableCell>{run.scheduleId?.name || "Ad-hoc"}</TableCell>
                                <TableCell>
                                  <Badge variant={run.status === "completed" ? "approved" : run.status === "failed" ? "rejected" : "pending"} className="h-7 px-2.5 text-[10px] uppercase">
                                    {run.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="uppercase">{run.format || "-"}</TableCell>
                                <TableCell>{run.outputSizeBytes ? `${Math.max((run.outputSizeBytes / 1024).toFixed(1), 0)} KB` : "-"}</TableCell>
                                <TableCell className="text-right">
                                  {run.status === "completed" ? (
                                    <Button size="sm" variant="outline" onClick={() => downloadRun(run._id)}>
                                      <DownloadIcon className="size-4" />
                                      Download
                                    </Button>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                            : null}
                          {!runsQuery.isLoading && !runsQuery.error && (runsQuery.data?.data || []).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                                  <ActivityIcon className="size-8 text-[#93c5fd]" />
                                  <p className="text-sm font-semibold text-[#1e3a8a]">No report runs yet</p>
                                  <p className="text-xs text-[#64748b]">Run a schedule to generate your first downloadable artifact.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-3">
                <SectionHeader title="Activity Timeline" subtitle="Operational events captured from the current reporting cycle" />
                <GlassCard>
                  <div className="space-y-3">
                    {activityTimeline.map((event, index) => (
                      <div key={event.id} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
                        <div className="relative flex justify-center">
                          <span
                            className={cn(
                              "mt-1 inline-flex size-3 rounded-full",
                              event.status === "warn"
                                ? "bg-[#f59e0b]"
                                : event.status === "good"
                                  ? "bg-[#10b981]"
                                  : "bg-[#2563eb]",
                            )}
                          />
                          {index < activityTimeline.length - 1 ? (
                            <span className="absolute top-5 h-[calc(100%-8px)] w-px bg-[#dbe4f8]" />
                          ) : null}
                        </div>
                        <div className="rounded-xl border border-[#e2e8f0] bg-white/90 px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#1e293b]">{event.title}</p>
                            <span className="text-[11px] text-[#64748B]">{event.time}</span>
                          </div>
                          <p className="mt-1 text-xs text-[#64748B]">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </section>
            </div>

            <aside className="min-w-0 space-y-4">
              <div className="sticky top-[calc(var(--app-header-height)+6rem)] space-y-4">
                <GlassCard className="space-y-3">
                  <SectionHeader title="System Health" subtitle="Infrastructure and financial stability indicators" />
                  <div className="space-y-2">
                    {systemHealth.map((item) => (
                      <div key={item.id} className="rounded-xl border border-[#e2e8f0] bg-white/90 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#475569]">{item.label}</p>
                          <Badge variant={getHealthTone(item.status)} className="h-7 px-2.5 text-[10px] uppercase">
                            {item.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm font-medium text-[#0f172a]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="space-y-3">
                  <SectionHeader title="Finance Rollup" subtitle="GMV, collections and settlement pressure" />
                  <div className="space-y-2">
                    <div className="rounded-xl bg-white/85 px-3 py-2">
                      <p className="text-xs text-[#64748B]">GMV</p>
                      <p className="text-lg font-semibold text-[#0f172a]">{formatCurrency(commandCenter.finance?.gmv || 0)}</p>
                    </div>
                    <div className="rounded-xl bg-white/85 px-3 py-2">
                      <p className="text-xs text-[#64748B]">Paid</p>
                      <p className="text-lg font-semibold text-[#10b981]">{formatCurrency(commandCenter.finance?.paid || 0)}</p>
                    </div>
                    <div className="rounded-xl bg-white/85 px-3 py-2">
                      <p className="text-xs text-[#64748B]">Refunded</p>
                      <p className="text-lg font-semibold text-[#8b5cf6]">{formatCurrency(commandCenter.finance?.refunded || 0)}</p>
                    </div>
                    <div className="rounded-xl bg-white/85 px-3 py-2">
                      <p className="text-xs text-[#64748B]">Settlement Pending</p>
                      <p className="text-lg font-semibold text-[#f59e0b]">{commandCenter.finance?.settlementPendingCount || 0}</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="space-y-3">
                  <SectionHeader title="Smart Insights" subtitle="Operational narrative from current data" />
                  <ul className="space-y-2 text-sm text-[#334155]">
                    <li className="rounded-xl bg-white/85 px-3 py-2">{(commandCenter.support?.openDisputes || 0) === 0 ? "No active disputes in current cycle" : `${commandCenter.support?.openDisputes || 0} disputes need resolution attention`}</li>
                    <li className="rounded-xl bg-white/85 px-3 py-2">{(commandCenter.finance?.outstanding || 0) > 0 ? `Outstanding dues are ${formatCurrency(commandCenter.finance?.outstanding || 0)}` : "Outstanding dues are fully settled"}</li>
                    <li className="rounded-xl bg-white/85 px-3 py-2">{(commandCenter.support?.unresolvedCrashes || 0) > 0 ? "Product stability risk detected from crash queue" : "Crash queue is under control"}</li>
                    <li className="rounded-xl bg-white/85 px-3 py-2">Registration funnel conversion at {commandCenter.funnel?.registrationToApprovalRate || 0}%.</li>
                  </ul>
                </GlassCard>

                <GlassCard className="space-y-2">
                  <div className="flex items-center gap-2">
                    <WifiIcon className="size-4 text-[#2563eb]" />
                    <p className="text-sm font-semibold text-[#0f172a]">Live Session</p>
                  </div>
                  <p className="text-xs text-[#64748B]">Data window: {params.fromDate} to {params.toDate}</p>
                  <p className="text-xs text-[#64748B]">Last refresh: {buildRelativeTime(commandCenter.filtersApplied?.toDate || params.toDate)}</p>
                </GlassCard>
              </div>
            </aside>
          </div>
        </>
      ) : null}

      <ScheduleDialog
        open={scheduleDialog.open}
        onClose={() => setScheduleDialog({ open: false, mode: "create", schedule: null })}
        mode={scheduleDialog.mode}
        initial={scheduleDialog.schedule}
        options={options}
        fallbackFilters={params}
        onSubmit={handleSaveSchedule}
        isPending={createScheduleMutation.isPending || updateScheduleMutation.isPending}
      />
    </div>
  );
};
