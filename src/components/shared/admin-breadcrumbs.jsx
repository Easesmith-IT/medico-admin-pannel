"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS = {
  admin: "Admin",
  dashboard: "Dashboard",
  "analytics-command-center": "Dashboard",
  admins: "Admins",
  appointments: "Appointments",
  treatments: "Treatments",
  categories: "Categories",
  cities: "Cities",
  "crash-report": "Crash Report",
  doctors: "Doctors",
  hospitals: "Hospitals",
  patients: "Patients",
  payments: "Payments",
  "service-partners": "Service Partners",
  services: "Services",
  add: "Add",
  update: "Update",
  bookings: "Bookings",
  social: "Social",
  security: "Security",
  sessions: "Sessions",
  profile: "Profile",
  governance: "Governance",
  "audit-logs": "Audit Logs",
  mfa: "MFA",
  edit: "Edit",
};

const looksLikeMongoId = (value = "") => /^[a-f0-9]{24}$/i.test(value);

const toLabel = (segment = "") => {
  if (!segment) return "";
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  if (looksLikeMongoId(segment)) return `#${segment.slice(0, 6).toUpperCase()}`;
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const AdminBreadcrumbs = () => {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== "admin");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin/dashboard">Admin</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = `/admin/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = toLabel(segment);

          return (
            <Fragment key={`${segment}-${index}`}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
