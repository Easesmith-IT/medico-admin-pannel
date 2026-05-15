import {
  AlertTriangle,
  BriefcaseMedical,
  Building2,
  CalendarDays,
  ClipboardList,
  FileClock,
  LayoutDashboard,
  Lock,
  MapPin,
  ShieldUser,
  Stethoscope,
  Tags,
  UserCircle,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

export const ADMIN_NAVIGATION_SECTIONS = [
  {
    id: "main",
    title: "Main",
    collapsible: false,
    defaultOpen: true,
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "care-operations",
    title: "Care Operations",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        title: "Appointments",
        href: "/admin/appointments",
        icon: CalendarDays,
      },
      {
        title: "Treatments",
        href: "/admin/treatments",
        icon: ClipboardList,
      },
      {
        title: "Services",
        href: "/admin/services",
        icon: Stethoscope,
      },
      {
        title: "Doctors",
        href: "/admin/doctors",
        icon: UserRound,
      },
      {
        title: "Patients",
        href: "/admin/patients",
        icon: Users,
      },
      {
        title: "Service Partners",
        href: "/admin/service-partners",
        icon: BriefcaseMedical,
      },
      {
        title: "Hospitals",
        href: "/admin/hospitals",
        icon: Building2,
      },
    ],
  },
  {
    id: "financials",
    title: "Financials",
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        title: "Payments",
        href: "/admin/payments",
        icon: Wallet,
      },
    ],
  },
  {
    id: "platform-management",
    title: "Platform Management",
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        title: "Categories",
        href: "/admin/categories",
        icon: Tags,
      },
      {
        title: "Cities",
        href: "/admin/cities",
        icon: MapPin,
      },
    ],
  },
  {
    id: "administration",
    title: "Administration",
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        title: "Admins",
        href: "/admin/admins",
        icon: ShieldUser,
      },
      {
        title: "Audit Logs",
        href: "/admin/governance/audit-logs",
        icon: FileClock,
      },
      {
        title: "Security",
        href: "/admin/security/sessions",
        icon: Lock,
        match: ["/admin/security"],
      },
      {
        title: "Crash Reports",
        href: "/admin/crash-report",
        icon: AlertTriangle,
      },
    ],
  },
];

export const ADMIN_ACCOUNT_SECTION = {
  id: "account",
  title: "Account",
  item: {
    title: "Profile",
    href: "/admin/profile",
    icon: UserCircle,
  },
};

export const ADMIN_QUICK_ACTION = {
  title: "New Appointment",
  href: "/admin/appointments/add",
};
