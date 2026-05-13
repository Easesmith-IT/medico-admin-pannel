"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileImage,
  Gauge,
  ImageIcon,
  IndianRupee,
  MapPin,
  Settings2,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DELETE, PATCH } from "@/constants/apiMethods";
import { appointmentStatusColors } from "@/constants/status";
import { useApiMutation } from "@/hooks/useApiMutation";
import { getDisplayEmail, getDisplayName } from "@/lib/display";
import { cn, customId } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SECTION_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "pricing", label: "Pricing" },
  { id: "scheduling", label: "Scheduling" },
  { id: "coverage", label: "Coverage" },
  { id: "providers", label: "Providers" },
  { id: "doctors", label: "Doctors" },
  { id: "bookings", label: "Bookings" },
  { id: "media", label: "Media" },
  { id: "activity", label: "Activity" },
  { id: "metadata", label: "Metadata" },
];

const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-200 text-slate-700 ring-slate-300",
};

const CATEGORY_STYLE = {
  consultation: {
    icon: Stethoscope,
    chip: "bg-sky-500/20 text-sky-100 ring-sky-300/45",
  },
  nursing: {
    icon: Activity,
    chip: "bg-emerald-500/20 text-emerald-100 ring-emerald-300/45",
  },
  equipment: {
    icon: Settings2,
    chip: "bg-amber-500/20 text-amber-100 ring-amber-300/45",
  },
};

const TREND_COLORS = ["#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const toSentence = (value = "") => {
  if (!value) return "Not available";
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value = 0, currency = "INR", digits = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
  }).format(toNumber(value));

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const initialsFromName = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase() || "SV";

const AnimatedValue = ({
  value = 0,
  prefix = "",
  suffix = "",
  fractionDigits = 0,
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = toNumber(value);
    const duration = 650;
    const started = performance.now();
    let frameId = null;

    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const nextValue = target * progress;
      setDisplay(nextValue);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })}
      {suffix}
    </span>
  );
};

const extractArray = (value) => (Array.isArray(value) ? value : []);

const normalizeLinkedDoctors = (service) =>
  extractArray(
    service?.linkedDoctors ||
      service?.relationships?.doctors ||
      service?.doctors ||
      service?.doctorLinks
  );

const normalizeLinkedProviders = (service) =>
  extractArray(
    service?.linkedProviders ||
      service?.relationships?.providers ||
      service?.providers ||
      service?.servicePartners
  );

const normalizeRecentBookings = (service) =>
  extractArray(
    service?.recentBookings ||
      service?.bookings ||
      service?.bookingHistory ||
      service?.relationships?.bookings
  );

const normalizeTimeline = (service, bookings = []) => {
  const backendTimeline = extractArray(service?.timeline);
  if (backendTimeline.length > 0) return backendTimeline;

  const generated = [];

  if (service?.createdAt) {
    generated.push({
      type: "created",
      title: "Service created",
      description: "Service profile entered operations workspace.",
      timestamp: service.createdAt,
      actor: service?.createdBy || null,
    });
  }

  if (service?.updatedAt && service?.updatedAt !== service?.createdAt) {
    generated.push({
      type: "updated",
      title: "Configuration updated",
      description: "Service operational configuration changed.",
      timestamp: service.updatedAt,
      actor: service?.createdBy || null,
    });
  }

  if (extractArray(service?.cities).length > 0) {
    generated.push({
      type: "coverage",
      title: "Coverage expanded",
      description: `${service.cities.length} city coverage configured.`,
      timestamp: service?.updatedAt || service?.createdAt,
      actor: null,
    });
  }

  if (bookings.length > 0) {
    generated.push({
      type: "booking",
      title: "Bookings flowing",
      description: `${bookings.length} recent service booking records available.`,
      timestamp:
        bookings[0]?.createdAt ||
        bookings[0]?.appointmentDate ||
        service?.updatedAt ||
        service?.createdAt,
      actor: null,
    });
  }

  return generated
    .filter((item) => item?.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const normalizeStatusDistribution = (service, bookings = []) => {
  const source =
    service?.bookingTrends?.statusDistribution ||
    service?.statusDistribution ||
    service?.analytics?.statusDistribution;

  if (Array.isArray(source) && source.length > 0) {
    return source.map((item) => ({
      status: item.status || item.name || "Unknown",
      count: toNumber(item.count ?? item.value),
    }));
  }

  if (source && typeof source === "object") {
    return Object.entries(source).map(([status, count]) => ({
      status,
      count: toNumber(count),
    }));
  }

  const statusMap = {};
  bookings.forEach((booking) => {
    const status = booking?.status || "Unknown";
    statusMap[status] = toNumber(statusMap[status]) + 1;
  });

  return Object.entries(statusMap).map(([status, count]) => ({
    status,
    count: toNumber(count),
  }));
};

const normalizeTrendData = (service, bookings = []) => {
  const source =
    service?.bookingTrends?.trend ||
    service?.bookingTrends?.revenueTrend ||
    service?.bookingTrends?.bookingsTrend ||
    service?.revenueTrends;

  if (Array.isArray(source) && source.length > 0) {
    return source.map((item, index) => ({
      period: item.period || item.month || item.label || `P${index + 1}`,
      bookings: toNumber(item.bookings ?? item.count),
      revenue: toNumber(item.revenue ?? item.amount),
    }));
  }

  if (bookings.length === 0) return [];

  const grouped = {};
  bookings.forEach((booking) => {
    const dateKey = booking?.appointmentDate || booking?.createdAt;
    const date = dateKey ? new Date(dateKey) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const monthKey = date.toLocaleDateString("en-IN", { month: "short" });
    if (!grouped[monthKey]) grouped[monthKey] = { bookings: 0, revenue: 0 };
    grouped[monthKey].bookings += 1;
    grouped[monthKey].revenue += toNumber(booking?.pricing?.totalAmount || booking?.amount);
  });

  return Object.entries(grouped).map(([period, values]) => ({
    period,
    bookings: values.bookings,
    revenue: values.revenue,
  }));
};

const normalizeAnalytics = (service, doctors = [], providers = [], bookings = []) => {
  const analytics = service?.analytics || {};
  const now = new Date();

  const monthRevenueFromBookings = bookings
    .filter((item) => {
      const time = item?.appointmentDate || item?.createdAt;
      if (!time) return false;
      const date = new Date(time);
      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    })
    .reduce(
      (sum, item) => sum + toNumber(item?.pricing?.totalAmount || item?.amount),
      0
    );

  const avgRatingFallback = (() => {
    const doctorRatings = doctors
      .map((item) => toNumber(item?.averageRating || item?.rating?.average || item?.rating))
      .filter((value) => value > 0);
    const providerRatings = providers
      .map((item) => toNumber(item?.rating?.average || item?.averageRating || item?.rating))
      .filter((value) => value > 0);
    const allRatings = [...doctorRatings, ...providerRatings];
    if (allRatings.length === 0) return 0;
    return allRatings.reduce((sum, value) => sum + value, 0) / allRatings.length;
  })();

  return {
    totalBookings: toNumber(analytics.totalBookings || bookings.length),
    monthlyRevenue: toNumber(analytics.monthlyRevenue || monthRevenueFromBookings),
    avgRating: toNumber(analytics.avgRating || avgRatingFallback),
    activeProvidersCount: toNumber(
      analytics.activeProvidersCount ||
        providers.filter((item) => item?.isActive !== false).length
    ),
    linkedDoctorsCount: toNumber(
      analytics.linkedDoctorsCount || doctors.length
    ),
    citiesCovered: toNumber(analytics.citiesCovered || extractArray(service?.cities).length),
  };
};

const buildInsights = ({
  bookings,
  trendData,
  statusDistribution,
  service,
  analytics,
  providers,
}) => {
  const insights = [];
  const weekendBookings = bookings.filter((booking) => {
    const raw = booking?.appointmentDate || booking?.createdAt;
    const date = raw ? new Date(raw) : null;
    if (!date || Number.isNaN(date.getTime())) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  }).length;

  if (weekendBookings > 0) {
    insights.push(`Weekend demand signal: ${weekendBookings} recent weekend booking(s).`);
  }

  const durationCandidates = bookings
    .map((booking) => toNumber(booking?.duration))
    .filter((duration) => duration > 0);
  if (durationCandidates.length > 0) {
    const durationCount = {};
    durationCandidates.forEach((duration) => {
      durationCount[duration] = toNumber(durationCount[duration]) + 1;
    });
    const dominantDuration = Object.entries(durationCount).sort((a, b) => b[1] - a[1])[0];
    if (dominantDuration) {
      insights.push(`Most booked duration observed: ${dominantDuration[0]} mins.`);
    }
  }

  const topCity = (() => {
    const cityCount = {};
    bookings.forEach((booking) => {
      const city =
        booking?.bookingCity ||
        booking?.city?.name ||
        booking?.provider?.city?.[0] ||
        booking?.provider?.city;
      if (!city) return;
      cityCount[city] = toNumber(cityCount[city]) + 1;
    });
    return Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0];
  })();
  if (topCity) {
    insights.push(`Top operating city in recent flow: ${topCity[0]}.`);
  }

  if (analytics.monthlyRevenue > 0) {
    insights.push(
      `This month revenue run-rate: ${formatCurrency(analytics.monthlyRevenue)}.`
    );
  }

  const completedStatus = statusDistribution.find(
    (item) => String(item.status).toLowerCase() === "completed"
  );
  if (completedStatus?.count > 0) {
    insights.push(`Completed bookings recorded: ${completedStatus.count}.`);
  }

  const fastGrowthPeriod = [...trendData]
    .filter((item) => item.bookings > 0)
    .sort((a, b) => b.bookings - a.bookings)[0];
  if (fastGrowthPeriod) {
    insights.push(`Peak booking period in trend: ${fastGrowthPeriod.period}.`);
  }

  if (service?.slotConfig?.equipmentBooking?.enabled) {
    const activeEquipmentProviders = providers.filter((provider) =>
      extractArray(provider?.services).some((srv) =>
        String(srv?.serviceId?._id || srv?.serviceId || srv?._id) === String(service?._id)
      )
    ).length;
    insights.push(
      `Equipment mode enabled with ${activeEquipmentProviders} partner capability link(s).`
    );
  }

  if (insights.length === 0) {
    insights.push("No major trend available yet. Activity intelligence will grow with bookings.");
  }

  return insights.slice(0, 6);
};

const getHeroBadges = (service) => {
  const badges = [];

  if (extractArray(service?.modes).includes("Home Service")) badges.push("Home Service");
  if (String(service?.paymentMode || "").toLowerCase() === "prepaid") badges.push("Prepaid");
  if (String(service?.category || "").toLowerCase() === "equipment") badges.push("Equipment");
  if (toNumber(service?.defaultDuration) > 0) badges.push(`${toNumber(service?.defaultDuration)} mins`);
  badges.push(service?.isActive ? "Active" : "Inactive");
  if (service?.slotConfig?.nursingSlots?.available24x7 || service?.slotConfig?.equipmentBooking?.available24x7) {
    badges.push("24x7");
  }

  return badges.slice(0, 6);
};

const SectionShell = ({ id, title, subtitle, children }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.18 }}
    transition={{ duration: 0.28, ease: "easeOut" }}
    className="min-w-0 scroll-mt-44 rounded-[28px] bg-[rgba(255,255,255,0.86)] p-6 shadow-[0_18px_44px_rgb(15_23_42_/_0.08)] ring-1 ring-white/65 backdrop-blur-sm sm:p-8"
  >
    <div className="mb-5">
      <h2 className="text-xl font-semibold tracking-tight text-[#0f172a]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p> : null}
    </div>
    {children}
  </motion.section>
);

const WorkspaceHeader = ({
  service,
  onToggleActive,
  onEdit,
  onDelete,
  isBusy,
}) => {
  const statusClass = service?.isActive ? STATUS_COLORS.active : STATUS_COLORS.inactive;

  return (
    <div className="sticky top-[calc(var(--app-header-height)+12px)] z-30 rounded-[24px] border border-white/60 bg-white/72 p-4 shadow-[0_14px_30px_rgb(15_23_42_/_0.08)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Link
              href="/admin/services"
              className="inline-flex items-center gap-1 text-[#1d4ed8] hover:text-[#1e40af]"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <span>/</span>
            <span>Services</span>
            <span>/</span>
            <span className="text-[#0f172a]">{service?.name || "Service"}</span>
          </div>
          <h1 className="text-lg font-semibold text-[#0f172a]">{service?.name || "Service"}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-[#dbeafe] px-3 py-1 text-xs text-[#1d4ed8]">
              {toSentence(service?.category)}
            </Badge>
            <Badge className={cn("rounded-full px-3 py-1 text-xs ring-1", statusClass)}>
              {service?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl bg-white/85 p-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#dbe4f8] bg-white"
            onClick={onEdit}
          >
            Edit
          </Button>
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4f8] bg-white px-3 py-1.5">
            <Switch
              checked={Boolean(service?.isActive)}
              onCheckedChange={onToggleActive}
              disabled={isBusy}
              className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300"
            />
            <span className="text-xs font-semibold text-[#0f172a]">
              {service?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="h-9 rounded-xl"
            onClick={onDelete}
            disabled={isBusy}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const ServiceHero = ({ service, analytics, linkedDoctors, linkedProviders }) => {
  const categoryInfo =
    CATEGORY_STYLE[String(service?.category || "").toLowerCase()] || CATEGORY_STYLE.consultation;
  const CategoryIcon = categoryInfo.icon;
  const heroBadges = getHeroBadges(service);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#111f4d] to-[#1e3a8a] p-7 text-white shadow-[0_30px_64px_rgb(15_23_42_/_0.4)] sm:p-9"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#38bdf8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-[#10b981]/15 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="space-y-3">
          <div className="rounded-[28px] bg-white/10 p-2 backdrop-blur">
            {service?.image ? (
              <img
                src={service.image}
                alt={service?.name || "Service"}
                className="h-28 w-28 rounded-[22px] object-cover shadow-[0_14px_24px_rgb(15_23_42_/_0.35)]"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#1d4ed8] to-[#0ea5e9] text-2xl font-semibold shadow-[0_14px_24px_rgb(15_23_42_/_0.35)]">
                {initialsFromName(service?.name)}
              </div>
            )}
          </div>
          <Badge className={cn("rounded-full border-0 px-3 py-1 text-xs ring-1", categoryInfo.chip)}>
            <CategoryIcon className="size-3.5" />
            {toSentence(service?.category)}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-white">
              {service?.name || "Healthcare Service"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
              {service?.description ||
                "Operational service record with live scheduling, provider linkages, and booking intelligence."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {heroBadges.map((badge) => (
              <Badge
                key={badge}
                className="rounded-full border-0 bg-white/14 px-3 py-1.5 text-xs text-slate-100 ring-1 ring-white/20"
              >
                {badge}
              </Badge>
            ))}
          </div>

          <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <p className="inline-flex items-center gap-2">
              <IndianRupee className="size-4 text-slate-300" />
              {formatCurrency(service?.basePrice || 0)}
            </p>
            <p className="inline-flex items-center gap-2">
              <Clock3 className="size-4 text-slate-300" />
              {toNumber(service?.defaultDuration) > 0
                ? `${toNumber(service?.defaultDuration)} mins`
                : service?.formattedDuration || "Duration flexible"}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-slate-300" />
              {extractArray(service?.cities).length} cities
            </p>
            <p className="inline-flex items-center gap-2">
              <Users className="size-4 text-slate-300" />
              {linkedProviders.length} partners
            </p>
          </div>
        </div>

        <div className="grid min-w-[230px] gap-3 self-start sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl bg-white/14 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.1em] text-slate-300">Bookings</p>
            <p className="mt-2 text-2xl font-semibold">{analytics.totalBookings}</p>
          </div>
          <div className="rounded-2xl bg-white/14 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.1em] text-slate-300">Monthly Revenue</p>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(analytics.monthlyRevenue)}</p>
          </div>
          <div className="rounded-2xl bg-white/14 p-4 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.1em] text-slate-300">Doctor Links</p>
            <p className="mt-2 text-2xl font-semibold">{linkedDoctors.length}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const AnalyticsStrip = ({ analytics }) => {
  const cards = [
    {
      label: "Total Bookings",
      value: analytics.totalBookings,
      icon: CalendarClock,
      type: "count",
    },
    {
      label: "Active Providers",
      value: analytics.activeProvidersCount,
      icon: Users,
      type: "count",
    },
    {
      label: "Linked Doctors",
      value: analytics.linkedDoctorsCount,
      icon: User,
      type: "count",
    },
    {
      label: "Monthly Revenue",
      value: analytics.monthlyRevenue,
      icon: CircleDollarSign,
      type: "currency",
    },
    {
      label: "Cities Covered",
      value: analytics.citiesCovered,
      icon: MapPin,
      type: "count",
    },
    {
      label: "Avg Rating",
      value: analytics.avgRating,
      icon: TrendingUp,
      type: "rating",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.05 }}
      className="rounded-[24px] bg-white/74 p-3 shadow-[0_16px_40px_rgb(15_23_42_/_0.08)] ring-1 ring-white/65 backdrop-blur-xl"
    >
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              whileHover={{ y: -3 }}
              key={item.label}
              className="rounded-2xl bg-white px-4 py-3 shadow-[0_10px_24px_rgb(15_23_42_/_0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-[#0f172a]">
                    {item.type === "currency" ? (
                      formatCurrency(item.value)
                    ) : item.type === "rating" ? (
                      <AnimatedValue value={item.value} fractionDigits={1} />
                    ) : (
                      <AnimatedValue value={item.value} />
                    )}
                  </p>
                </div>
                <div className="rounded-xl bg-[#eff6ff] p-2.5 text-[#2563eb]">
                  <Icon className="size-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

const StickySectionNav = ({ activeSection, onNavigate }) => (
  <div className="sticky top-[calc(var(--app-header-height)+102px)] z-20 hidden overflow-x-auto rounded-2xl bg-white/85 p-2 shadow-[0_10px_28px_rgb(15_23_42_/_0.08)] ring-1 ring-white/70 backdrop-blur xl:block">
    <div className="flex min-w-max items-center gap-2">
      {SECTION_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
            activeSection === item.id
              ? "bg-[#2563eb] text-white shadow-[0_8px_16px_rgb(37_99_235_/_0.28)]"
              : "bg-[#f8fafc] text-[#475569] hover:bg-[#e2e8f0]"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
);

const PricingSection = ({ service }) => {
  const basePrice = toNumber(service?.basePrice);
  const equipment = toNumber(service?.equipmentCharges);
  const tax = toNumber(service?.taxPercentage);
  const subtotal = basePrice + equipment;
  const estimatedTotal = subtotal + subtotal * (tax / 100);

  const cards = [
    { label: "Base Price", value: basePrice, tone: "text-[#0f172a]" },
    { label: "Equipment Charges", value: equipment, tone: "text-[#0f172a]" },
    { label: "Tax %", value: tax, suffix: "%", tone: "text-[#0f172a]" },
    { label: "Estimated Total", value: estimatedTotal, tone: "text-[#1d4ed8]" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_8px_20px_rgb(15_23_42_/_0.04)]",
            card.label === "Estimated Total" && "bg-[#eff6ff]"
          )}
        >
          <p className="text-xs uppercase tracking-[0.08em] text-[#94a3b8]">{card.label}</p>
          <p className={cn("mt-3 text-2xl font-bold", card.tone)}>
            {card.suffix ? (
              <AnimatedValue value={card.value} suffix={card.suffix} />
            ) : (
              formatCurrency(card.value)
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

const SchedulingSection = ({ service, trendData }) => {
  const durations = extractArray(service?.durationOptions)
    .map((item) => toNumber(item))
    .filter((item) => item > 0);
  const defaultDuration = toNumber(service?.defaultDuration);

  const chartData =
    durations.length > 0
      ? durations.map((duration, index) => ({
          label: `${duration}m`,
          value: Math.max(1, durations.length - index),
        }))
      : trendData.slice(0, 4).map((item) => ({
          label: item.period,
          value: Math.max(1, item.bookings),
        }));

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Duration Intelligence</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {durations.length > 0 ? (
            durations.map((duration) => (
              <Badge
                key={duration}
                variant={duration === defaultDuration ? "default" : "secondary"}
                className="rounded-full px-3 py-1"
              >
                {duration} mins
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="rounded-full px-3 py-1">
              No flexible duration configured
            </Badge>
          )}
        </div>
        <div className="mt-5 space-y-3">
          <div className="rounded-xl bg-[#f8fafc] p-3">
            <p className="text-xs text-[#64748b]">Default Duration</p>
            <p className="mt-1 text-lg font-semibold text-[#0f172a]">
              {defaultDuration > 0 ? `${defaultDuration} mins` : "Not set"}
            </p>
          </div>
          <div className="rounded-xl bg-[#f8fafc] p-3">
            <p className="text-xs text-[#64748b]">Slot Compatibility</p>
            <p className="mt-1 text-sm text-[#334155]">
              {service?.slotConfig?.consultationSlots?.enabled
                ? "Consultation slots enabled for scheduling."
                : "Consultation slots are disabled."}
            </p>
            <p className="mt-1 text-sm text-[#334155]">
              {service?.slotConfig?.nursingSlots?.enabled
                ? "Nursing scheduling supports shift strategy."
                : "Nursing scheduling is inactive."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Scheduling Bars</p>
        <div className="mt-3 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const SlotConfigSection = ({ service }) => {
  const consultation = service?.slotConfig?.consultationSlots || {};
  const nursing = service?.slotConfig?.nursingSlots || {};
  const equipment = service?.slotConfig?.equipmentBooking || {};

  const cards = [
    {
      key: "consultation",
      title: "Consultation Slots",
      enabled: consultation?.enabled,
      rows: [
        { label: "Window", value: `${consultation?.startTime || "--"} - ${consultation?.endTime || "--"}` },
        { label: "Slot Duration", value: consultation?.slotDuration ? `${consultation.slotDuration} mins` : "Not set" },
      ],
    },
    {
      key: "nursing",
      title: "Nursing Scheduling",
      enabled: nursing?.enabled,
      rows: [
        {
          label: "Shift Types",
          value:
            extractArray(nursing?.shiftTypes).length > 0
              ? extractArray(nursing.shiftTypes).join(", ")
              : "Not configured",
        },
        {
          label: "Duration Window",
          value:
            nursing?.minDuration && nursing?.maxDuration
              ? `${nursing.minDuration} - ${nursing.maxDuration} mins`
              : "Not configured",
        },
        { label: "24x7", value: nursing?.available24x7 ? "Enabled" : "Disabled" },
      ],
    },
    {
      key: "equipment",
      title: "Equipment Booking",
      enabled: equipment?.enabled,
      rows: [
        {
          label: "Duration Window",
          value:
            equipment?.minDuration && equipment?.maxDuration
              ? `${equipment.minDuration} - ${equipment.maxDuration} mins`
              : "Not configured",
        },
        { label: "24x7", value: equipment?.available24x7 ? "Enabled" : "Disabled" },
      ],
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_8px_20px_rgb(15_23_42_/_0.04)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0f172a]">{item.title}</p>
            <Badge
              variant={item.enabled ? "success" : "destructive"}
              className="rounded-full px-2.5 py-1 text-[11px]"
            >
              {item.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            {item.rows.map((row) => (
              <div key={row.label} className="rounded-xl bg-[#f8fafc] p-2.5">
                <p className="text-xs text-[#64748b]">{row.label}</p>
                <p className="mt-0.5 font-medium text-[#0f172a]">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const CoverageSection = ({ cities = [] }) => (
  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#0f172a]">City Coverage Grid</p>
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {cities.length} Active Regions
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-sm text-[#64748b]">
            No cities configured for this service yet.
          </div>
        ) : (
          cities.map((city, index) => (
            <motion.div
              whileHover={{ y: -2 }}
              key={`${city?._id || city?.name || "city"}-${index}`}
              className="rounded-xl border border-[#e2e8f0] bg-white p-3 shadow-[0_8px_18px_rgb(15_23_42_/_0.04)]"
            >
              <p className="text-sm font-semibold capitalize text-[#0f172a]">
                {city?.name || "City"}
              </p>
              <p className="mt-1 text-xs text-[#64748b]">
                Lat {city?.latitude ?? "--"} / Lng {city?.longitude ?? "--"}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>

    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <p className="text-sm font-semibold text-[#0f172a]">Coverage Preview</p>
      <div className="mt-3 flex h-[220px] items-center justify-center rounded-xl bg-gradient-to-br from-[#dbeafe] via-[#ecfeff] to-[#dcfce7]">
        <div className="relative h-36 w-44 rounded-2xl border border-[#bfdbfe] bg-white/70 shadow-[0_14px_28px_rgb(15_23_42_/_0.06)]">
          {cities.slice(0, 6).map((city, idx) => (
            <span
              key={`${city?._id || idx}`}
              className="absolute inline-flex size-3 rounded-full bg-[#2563eb] ring-2 ring-white"
              style={{
                top: `${16 + (idx % 3) * 34}px`,
                left: `${18 + Math.floor(idx / 3) * 74}px`,
              }}
            />
          ))}
          <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white p-2 text-center text-xs text-[#475569]">
            Region nodes based on assigned cities
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DoctorCards = ({ doctors = [] }) => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {doctors.length === 0 ? (
      <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-sm text-[#64748b]">
        No doctor linkages returned for this service.
      </div>
    ) : (
      doctors.map((doctor, index) => {
        const doctorName = getDisplayName(doctor, { fallback: "Doctor" });
        const rating = toNumber(
          doctor?.averageRating || doctor?.rating?.average || doctor?.rating
        );
        return (
          <motion.div
            whileHover={{ y: -3 }}
            key={`${doctor?._id || doctor?.id || doctorName}-${index}`}
            className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.05)]"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarImage src={doctor?.profilePhoto || doctor?.image || ""} alt={doctorName} />
                <AvatarFallback>{initialsFromName(doctorName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0f172a]">{doctorName}</p>
                <p className="truncate text-xs text-[#64748b]">
                  {doctor?.specialization || doctor?.designation || "Specialist"}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[#f8fafc] p-2">
                <p className="text-[#64748b]">Consultation Fee</p>
                <p className="font-semibold text-[#0f172a]">
                  {formatCurrency(doctor?.consultationFees || 0)}
                </p>
              </div>
              <div className="rounded-lg bg-[#f8fafc] p-2">
                <p className="text-[#64748b]">Rating</p>
                <p className="font-semibold text-[#0f172a]">{rating.toFixed(1)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge
                variant={doctor?.isActive === false ? "destructive" : "success"}
                className="rounded-full px-2.5 py-1 text-[11px]"
              >
                {doctor?.isActive === false ? "Inactive" : "Active"}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="h-8 rounded-lg">
                  <Link href={`/admin/doctors/${doctor?._id || doctor?.id || ""}`}>View Doctor</Link>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg">
                  Open Profile
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })
    )}
  </div>
);

const ProviderCards = ({ providers = [] }) => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {providers.length === 0 ? (
      <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-sm text-[#64748b]">
        No linked service partners found for this service.
      </div>
    ) : (
      providers.map((provider, index) => {
        const providerName = getDisplayName(provider, { fallback: "Service Partner" });
        const rating = toNumber(
          provider?.rating?.average || provider?.averageRating || provider?.rating
        );
        const cityName =
          extractArray(provider?.serviceCities)?.[0]?.name ||
          extractArray(provider?.city)?.[0] ||
          "City not listed";

        return (
          <motion.div
            whileHover={{ y: -3 }}
            key={`${provider?._id || provider?.id || providerName}-${index}`}
            className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_10px_24px_rgb(15_23_42_/_0.05)]"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarImage src={provider?.profilePhoto || ""} alt={providerName} />
                <AvatarFallback>{initialsFromName(providerName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0f172a]">{providerName}</p>
                <p className="truncate text-xs text-[#64748b]">
                  {toSentence(provider?.approvalStatus || "Pending")}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[#f8fafc] p-2">
                <p className="text-[#64748b]">Experience</p>
                <p className="font-semibold text-[#0f172a]">
                  {toNumber(provider?.experienceYears || provider?.experience || 0)} yrs
                </p>
              </div>
              <div className="rounded-lg bg-[#f8fafc] p-2">
                <p className="text-[#64748b]">Rating</p>
                <p className="font-semibold text-[#0f172a]">{rating.toFixed(1)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-[#64748b]">{cityName}</p>
              <Badge
                variant={provider?.isActive === false ? "destructive" : "success"}
                className="rounded-full px-2.5 py-1 text-[11px]"
              >
                {provider?.isActive === false ? "Inactive" : "Active"}
              </Badge>
            </div>
          </motion.div>
        );
      })
    )}
  </div>
);

const BookingsSection = ({
  bookings = [],
  trendData = [],
  statusDistribution = [],
}) => {
  const resolvedStatusData =
    statusDistribution.length > 0
      ? statusDistribution
      : [{ status: "No Data", count: 1 }];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
          <p className="text-sm font-semibold text-[#0f172a]">Booking Trend</p>
          <div className="mt-3 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="service-booking-trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#service-booking-trend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
          <p className="text-sm font-semibold text-[#0f172a]">Status Distribution</p>
          <div className="mt-3 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolvedStatusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={50}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {resolvedStatusData.map((entry, index) => (
                    <Cell
                      key={`${entry.status}-${index}`}
                      fill={TREND_COLORS[index % TREND_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {resolvedStatusData.map((row, index) => (
              <div
                key={`${row.status}-${index}`}
                className="flex items-center gap-2 rounded-full bg-[#f8fafc] px-3 py-1 text-xs text-[#334155]"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: TREND_COLORS[index % TREND_COLORS.length] }}
                />
                {row.status}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
        <div className="overflow-x-auto" data-slot="table-container">
          <Table>
            <TableHeader className="bg-[#f8fafc]">
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-[#64748b]">
                    No booking rows found for this service.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.slice(0, 10).map((booking, index) => {
                  const patient = booking?.patient || booking?.patientId || {};
                  const provider = booking?.provider || booking?.servicePartner || booking?.providerId || {};
                  const city =
                    booking?.bookingCity ||
                    booking?.city?.name ||
                    extractArray(provider?.city)?.[0] ||
                    "-";
                  const status = booking?.status || "Pending";
                  const amount = toNumber(
                    booking?.pricing?.totalAmount ||
                      booking?.amount ||
                      booking?.payment?.totalAmount
                  );

                  return (
                    <TableRow key={`${booking?._id || booking?.id || index}-${index}`}>
                      <TableCell>{customId(String(booking?._id || booking?.id || index), "BKG")}</TableCell>
                      <TableCell>{getDisplayName(patient, { fallback: "-" })}</TableCell>
                      <TableCell>{getDisplayName(provider, { fallback: "-" })}</TableCell>
                      <TableCell>{city || "-"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                      <TableCell>{formatDate(booking?.appointmentDate || booking?.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px]",
                            appointmentStatusColors[status] ||
                              "border border-[#dbeafe] bg-[#eff6ff] text-[#1d4ed8]"
                          )}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const MediaSection = ({ service }) => {
  const categoryInfo =
    CATEGORY_STYLE[String(service?.category || "").toLowerCase()] || CATEGORY_STYLE.consultation;
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-[#0f172a]">Service Image</p>
        {service?.image ? (
          <img
            src={service.image}
            alt={service?.name || "Service image"}
            className="h-44 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-[#dbeafe] to-[#ecfeff]">
            <div className="text-center">
              <FileImage className="mx-auto size-8 text-[#2563eb]" />
              <p className="mt-2 text-sm text-[#334155]">Smart visual fallback</p>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-[#0f172a]">Service Icon</p>
        {service?.icon ? (
          <img
            src={service.icon}
            alt={service?.name || "Service icon"}
            className="h-44 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-[#dbeafe] to-[#ecfeff]">
            <div className="text-center">
              <CategoryIcon className="mx-auto size-8 text-[#2563eb]" />
              <p className="mt-2 text-sm text-[#334155]">Category fallback icon</p>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-[#0f172a]">Media Library</p>
        <div className="flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
          <div className="text-center">
            <ImageIcon className="mx-auto size-8 text-[#64748b]" />
            <p className="mt-2 text-sm text-[#475569]">
              Additional media can be attached through edit workflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityTimeline = ({ timeline = [] }) => {
  const getIcon = (type) => {
    const lower = String(type || "").toLowerCase();
    if (lower.includes("price")) return CircleDollarSign;
    if (lower.includes("booking")) return CalendarClock;
    if (lower.includes("provider")) return Users;
    if (lower.includes("city")) return MapPin;
    if (lower.includes("status")) return Gauge;
    return Sparkles;
  };

  return (
    <div className="relative space-y-4 pl-2">
      <div className="absolute bottom-0 left-[17px] top-1 w-px bg-[#e2e8f0]" />
      {timeline.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-sm text-[#64748b]">
          Timeline events will surface as operations updates occur.
        </div>
      ) : (
        timeline.map((event, index) => {
          const Icon = getIcon(event?.type);
          return (
            <motion.div
              key={`${event?.type || "event"}-${index}-${event?.timestamp || index}`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.24 }}
              className="relative ml-7 rounded-2xl border border-[#e2e8f0] bg-white p-4"
            >
              <div className="absolute -left-[30px] top-5 flex size-6 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#2563eb]">
                <Icon className="size-3.5" />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">
                    {event?.title || "Operational event"}
                  </p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {event?.description || "Service event captured."}
                  </p>
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    Actor: {getDisplayName(event?.actor, { fallback: "System" })}
                  </p>
                </div>
                <p className="text-xs text-[#64748b]">{formatDateTime(event?.timestamp)}</p>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

const MetadataSection = ({ service }) => {
  const creator = service?.createdBy || {};
  const creatorName = getDisplayName(creator, { fallback: "Admin User" });
  const creatorEmail = getDisplayEmail(creator, "Not available");
  const creatorRole = creator?.userModel || creator?.role || "Admin";

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Creator Profile</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={creator?.profilePhoto || ""} alt={creatorName} />
            <AvatarFallback>{initialsFromName(creatorName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">{creatorName}</p>
            <p className="text-xs text-[#64748b]">{creatorEmail}</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-[#f8fafc] p-3 text-xs text-[#334155]">
          <p>Role: {toSentence(creatorRole)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
          <p className="text-xs text-[#64748b]">Created At</p>
          <p className="mt-1 text-sm font-semibold text-[#0f172a]">
            {formatDateTime(service?.createdAt)}
          </p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
          <p className="text-xs text-[#64748b]">Updated At</p>
          <p className="mt-1 text-sm font-semibold text-[#0f172a]">
            {formatDateTime(service?.updatedAt)}
          </p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
          <p className="text-xs text-[#64748b]">Category</p>
          <p className="mt-1 text-sm font-semibold text-[#0f172a]">
            {toSentence(service?.category)}
          </p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
          <p className="text-xs text-[#64748b]">Payment Mode</p>
          <p className="mt-1 text-sm font-semibold text-[#0f172a]">
            {service?.paymentMode || "Both"}
          </p>
        </div>
      </div>
    </div>
  );
};

const IntelligenceSidebar = ({
  service,
  analytics,
  statusDistribution,
  insights,
  onEdit,
  onToggleActive,
  isBusy,
}) => {
  const completed = toNumber(
    statusDistribution.find(
      (item) => String(item.status).toLowerCase() === "completed"
    )?.count
  );

  const pending = toNumber(
    statusDistribution
      .filter((item) => String(item.status).toLowerCase() !== "completed")
      .reduce((sum, item) => sum + toNumber(item.count), 0)
  );

  const healthLabel = service?.isActive ? "Healthy" : "Needs Activation";

  return (
    <div className="space-y-4 xl:sticky xl:top-[calc(var(--app-header-height)+1rem)]">
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Service Health</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-[#64748b]">Current State</p>
          <Badge variant={service?.isActive ? "success" : "destructive"}>{healthLabel}</Badge>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#e2e8f0]">
          <div
            className={cn(
              "h-full rounded-full",
              service?.isActive ? "bg-emerald-500" : "bg-amber-500"
            )}
            style={{ width: service?.isActive ? "85%" : "45%" }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Revenue Snapshot</p>
        <p className="mt-2 text-2xl font-bold text-[#0f172a]">
          {formatCurrency(analytics.monthlyRevenue)}
        </p>
        <p className="text-xs text-[#64748b]">
          Monthly operational billing trend
        </p>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Coverage Stats</p>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-[#64748b]">Cities</p>
            <p className="font-semibold text-[#0f172a]">{analytics.citiesCovered}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#64748b]">Providers</p>
            <p className="font-semibold text-[#0f172a]">{analytics.activeProvidersCount}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#64748b]">Doctors</p>
            <p className="font-semibold text-[#0f172a]">{analytics.linkedDoctorsCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Booking Performance</p>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-[#64748b]">Total</p>
            <p className="font-semibold text-[#0f172a]">{analytics.totalBookings}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#64748b]">Completed</p>
            <p className="font-semibold text-[#0f172a]">{completed}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#64748b]">Pending/Other</p>
            <p className="font-semibold text-[#0f172a]">{pending}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Quick Actions</p>
        <div className="mt-3 grid gap-2">
          <Button onClick={onEdit} variant="medico" className="justify-start rounded-xl">
            <Settings2 className="size-4" />
            Edit Service
          </Button>
          <Button variant="outline" className="justify-start rounded-xl" asChild>
            <Link href="/admin/appointments">
              <CalendarClock className="size-4" />
              View Bookings
            </Link>
          </Button>
          <Button
            variant="outline"
            className="justify-start rounded-xl"
            onClick={() => onToggleActive(!service?.isActive)}
            disabled={isBusy}
          >
            {service?.isActive ? (
              <>
                <XCircle className="size-4" />
                Set Inactive
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Activate Service
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
        <p className="text-sm font-semibold text-[#0f172a]">Insights</p>
        <div className="mt-3 space-y-2">
          {insights.map((insight) => (
            <div
              key={insight}
              className="rounded-xl bg-[#f8fafc] p-3 text-xs leading-relaxed text-[#334155]"
            >
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DeleteServiceDialog = ({ open, onOpenChange, onConfirm, isSubmitting }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="rounded-2xl">
      <DialogHeader>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogDescription>
          This will permanently remove the service from admin operations.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const ServiceDetailsWorkspace = ({ service, onRefetch }) => {
  const router = useRouter();
  const [serviceState, setServiceState] = useState(service);
  const [activeSection, setActiveSection] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setServiceState(service);
  }, [service]);

  const linkedDoctors = useMemo(
    () => normalizeLinkedDoctors(serviceState),
    [serviceState]
  );
  const linkedProviders = useMemo(
    () => normalizeLinkedProviders(serviceState),
    [serviceState]
  );
  const recentBookings = useMemo(
    () =>
      normalizeRecentBookings(serviceState).sort(
        (a, b) =>
          new Date(b?.appointmentDate || b?.createdAt || 0).getTime() -
          new Date(a?.appointmentDate || a?.createdAt || 0).getTime()
      ),
    [serviceState]
  );
  const trendData = useMemo(
    () => normalizeTrendData(serviceState, recentBookings),
    [serviceState, recentBookings]
  );
  const statusDistribution = useMemo(
    () => normalizeStatusDistribution(serviceState, recentBookings),
    [serviceState, recentBookings]
  );
  const analytics = useMemo(
    () =>
      normalizeAnalytics(
        serviceState,
        linkedDoctors,
        linkedProviders,
        recentBookings
      ),
    [serviceState, linkedDoctors, linkedProviders, recentBookings]
  );
  const timeline = useMemo(
    () => normalizeTimeline(serviceState, recentBookings),
    [serviceState, recentBookings]
  );
  const insights = useMemo(
    () =>
      buildInsights({
        bookings: recentBookings,
        trendData,
        statusDistribution,
        service: serviceState,
        analytics,
        providers: linkedProviders,
      }),
    [recentBookings, trendData, statusDistribution, serviceState, analytics, linkedProviders]
  );

  const { mutateAsync: toggleServiceStatus, isPending: isToggling } = useApiMutation({
    url: `/service/${serviceState?._id}/toggle-status`,
    method: PATCH,
    invalidateKey: ["service"],
  });

  const { mutateAsync: deleteService, isPending: isDeleting } = useApiMutation({
    url: `/service/service/${serviceState?._id}`,
    method: DELETE,
    invalidateKey: ["service"],
  });

  const isBusy = isToggling || isDeleting;

  const refetchIfNeeded = () => {
    if (typeof onRefetch === "function") onRefetch();
  };

  const handleToggleActive = async (checked) => {
    const previous = serviceState;
    setServiceState((prev) => ({ ...prev, isActive: Boolean(checked) }));
    try {
      await toggleServiceStatus();
      refetchIfNeeded();
    } catch (error) {
      setServiceState(previous);
      throw error;
    }
  };

  const handleDeleteService = async () => {
    await deleteService();
    setIsDeleteDialogOpen(false);
    router.push("/admin/services");
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.12, 0.35, 0.6],
      }
    );

    SECTION_ITEMS.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [serviceState?._id]);

  const onNavigate = (id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sections = [
    {
      id: "overview",
      title: "Operational Overview",
      subtitle: "Service summary, usage signals, and booking intelligence context",
      content: (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-[#0f172a]">Service Summary</p>
            <p className="mt-2 text-sm leading-relaxed text-[#334155]">
              {serviceState?.description ||
                "Service description is not available. Update this service to improve operational context for teams."}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f8fafc] p-3">
                <p className="text-xs text-[#64748b]">Category</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  {toSentence(serviceState?.category)}
                </p>
              </div>
              <div className="rounded-xl bg-[#f8fafc] p-3">
                <p className="text-xs text-[#64748b]">Modes</p>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  {extractArray(serviceState?.modes).join(", ") || "Not configured"}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
            <p className="text-sm font-semibold text-[#0f172a]">Usage Snapshot</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-[#64748b]">Bookings</p>
                <p className="font-semibold text-[#0f172a]">{analytics.totalBookings}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#64748b]">Partners</p>
                <p className="font-semibold text-[#0f172a]">{linkedProviders.length}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#64748b]">Doctors</p>
                <p className="font-semibold text-[#0f172a]">{linkedDoctors.length}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#64748b]">Rating</p>
                <p className="font-semibold text-[#0f172a]">{analytics.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "pricing",
      title: "Pricing Intelligence",
      subtitle: "Financial hierarchy for base, equipment, tax, and estimated total",
      content: <PricingSection service={serviceState} />,
    },
    {
      id: "scheduling",
      title: "Scheduling & Slot Configuration",
      subtitle: "Duration visualization, slot bars, and operational scheduling controls",
      content: (
        <div className="space-y-4">
          <SchedulingSection service={serviceState} trendData={trendData} />
          <SlotConfigSection service={serviceState} />
        </div>
      ),
    },
    {
      id: "coverage",
      title: "Coverage Workspace",
      subtitle: "City-level operations coverage and region overview",
      content: <CoverageSection cities={extractArray(serviceState?.cities)} />,
    },
    {
      id: "providers",
      title: "Linked Service Providers",
      subtitle: "Service partners mapped to this service capability",
      content: <ProviderCards providers={linkedProviders} />,
    },
    {
      id: "doctors",
      title: "Linked Doctors",
      subtitle: "Clinical network associated with this service",
      content: <DoctorCards doctors={linkedDoctors} />,
    },
    {
      id: "bookings",
      title: "Bookings Intelligence",
      subtitle: "Trend chart, status distribution, and recent appointment rows",
      content: (
        <BookingsSection
          bookings={recentBookings}
          trendData={trendData}
          statusDistribution={statusDistribution}
        />
      ),
    },
    {
      id: "media",
      title: "Media Workspace",
      subtitle: "Primary image, icon, and media fallback visuals",
      content: <MediaSection service={serviceState} />,
    },
    {
      id: "activity",
      title: "Activity Timeline",
      subtitle: "Service lifecycle events and operational changes",
      content: <ActivityTimeline timeline={timeline} />,
    },
    {
      id: "metadata",
      title: "Metadata & Ownership",
      subtitle: "Creator profile, role context, and lifecycle timestamps",
      content: <MetadataSection service={serviceState} />,
    },
  ];

  return (
    <div className="min-w-0 overflow-visible space-y-5 pb-8">
      <WorkspaceHeader
        service={serviceState}
        onToggleActive={handleToggleActive}
        onEdit={() => router.push(`/admin/services/${serviceState?._id}/update`)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        isBusy={isBusy}
      />

      <ServiceHero
        service={serviceState}
        analytics={analytics}
        linkedDoctors={linkedDoctors}
        linkedProviders={linkedProviders}
      />

      <AnalyticsStrip analytics={analytics} />

      <StickySectionNav activeSection={activeSection} onNavigate={onNavigate} />

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="hidden min-w-0 space-y-5 lg:block">
          {sections.map((section) => (
            <SectionShell
              key={section.id}
              id={section.id}
              title={section.title}
              subtitle={section.subtitle}
            >
              {section.content}
            </SectionShell>
          ))}
        </div>

        <div className="min-w-0 space-y-4 lg:hidden">
          <Accordion
            type="single"
            collapsible
            className="rounded-[24px] bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_16px_34px_rgb(15_23_42_/_0.08)]"
          >
            {sections.map((section) => (
              <AccordionItem
                key={`mobile-${section.id}`}
                value={section.id}
                className="border-b border-[#e5edf9] last:border-b-0"
              >
                <AccordionTrigger className="text-left text-[#0f172a] hover:no-underline">
                  <span className="text-sm font-semibold">{section.title}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">{section.content}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="min-w-0 xl:col-span-1">
          <IntelligenceSidebar
            service={serviceState}
            analytics={analytics}
            statusDistribution={statusDistribution}
            insights={insights}
            onEdit={() => router.push(`/admin/services/${serviceState?._id}/update`)}
            onToggleActive={handleToggleActive}
            isBusy={isBusy}
          />
        </div>
      </div>

      <DeleteServiceDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteService}
        isSubmitting={isDeleting}
      />

      {isBusy ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-full bg-[#0f172a] px-4 py-2 text-xs font-medium text-white shadow-[0_18px_32px_rgb(15_23_42_/_0.35)]">
          Syncing service workspace...
        </div>
      ) : null}
    </div>
  );
};
