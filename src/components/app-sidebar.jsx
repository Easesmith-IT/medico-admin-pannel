"use client";

import { motion } from "framer-motion";
import {
  BuildingIcon,
  CalendarCheckIcon,
  FileWarningIcon,
  HospitalIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  SettingsIcon,
  StethoscopeIcon,
  UserCheckIcon,
  UserCogIcon,
  UsersIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
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
      {
        title: "Categories",
        icon: LayoutGridIcon,
        url: "/admin/categories",
      },
      {
        title: "Crash Reports",
        icon: FileWarningIcon,
        url: "/admin/crash-report",
      },
    ],
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-[#1E293B]">
      <SidebarHeader className="px-3 pt-4">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="h-12 gap-x-3 rounded-[14px] px-3 hover:bg-[#12213C]"
          >
            <Link href="/" prefetch>
              <Image
                src="/logos/medico-logo.svg"
                width={28}
                height={28}
                alt="Medico"
              />
              <span className="text-sm font-semibold tracking-[-0.01em] text-white">
                Medico Admin
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-4">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#64748B]">
              {group.title}
            </p>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, index) => (
                  <motion.li
                    key={item.title}
                    className="group/menu-item relative list-none"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.16, delay: index * 0.02, ease: "easeOut" }}
                  >
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={
                        item.url === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.url)
                      }
                      asChild
                      className="h-11 gap-x-3 rounded-[12px] px-3 text-[14px] text-[#CBD5E1] transition-all hover:bg-[#12213C] hover:text-white data-[active=true]:bg-[#1E3A8A]/35 data-[active=true]:text-[#DBEAFE] data-[active=true]:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.45)]"
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </motion.li>
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
