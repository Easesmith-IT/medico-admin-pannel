"use client";

import {
  BuildingIcon,
  CalendarCheckIcon,
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  HospitalIcon,
  KeyIcon,
  LayoutDashboard,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldCheckIcon,
  StarIcon,
  StethoscopeIcon,
  UserCheckIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const menuItems = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboardIcon,
        url: "/admin/dashboard",
      },
      {
        title: "Admins",
        icon: UserCheckIcon,
        url: "/admin/admins",
      },
      {
        title: "Cities",
        icon: BuildingIcon,
        url: "/admin/cities",
      },
      {
        title: "Doctors",
        icon: StethoscopeIcon,
        url: "/admin/doctors",
      },
      {
        title: "Patients",
        icon: UsersIcon,
        url: "/admin/patients",
      },
      {
        title: "Service Partners",
        icon: UserCogIcon,
        url: "/admin/service-partners",
      },
      {
        title: "Hospitals",
        icon: HospitalIcon,
        url: "/admin/hospitals",
      },
      {
        title: "Services",
        icon: SettingsIcon,
        url: "/admin/services",
      },
      {
        title: "Appointments",
        icon: CalendarCheckIcon,
        url: "/admin/appointments",
      },
    ],
  },
];

export const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
            <Link href="/" prefetch>
              <Image
                src="/logos/medico-logo.svg"
                width={30}
                height={30}
                alt="Medico"
              />
              <span className="font-semibold text-sm">Medico Admin</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={
                        item.url === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.url)
                      }
                      asChild
                      className="gap-x-4 h-10 px-4"
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Upgrade to Pro"
              className="gap-x-4 h-10 px-4"
              onClick={() => {}}
            >
              <StarIcon className="size-4" />
              <span>Upgrade to Pro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Billing Portal"
              className="gap-x-4 h-10 px-4"
              onClick={() => {}}
            >
              <CreditCardIcon className="size-4" />
              <span>Billing Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="gap-x-4 h-10 px-4"
              onClick={() =>{}}
            >
              <LogOutIcon className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
};
