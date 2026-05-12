"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheckIcon,
  FileWarningIcon,
  HospitalIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  MapPinnedIcon,
  SearchIcon,
  SettingsIcon,
  StethoscopeIcon,
  UserCheckIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

const quickRoutes = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboardIcon },
  { label: "Admins", href: "/admin/admins", icon: UserCheckIcon },
  { label: "Doctors", href: "/admin/doctors", icon: StethoscopeIcon },
  { label: "Patients", href: "/admin/patients", icon: UsersIcon },
  {
    label: "Service Partners",
    href: "/admin/service-partners",
    icon: UserCogIcon,
  },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarCheckIcon },
  { label: "Services", href: "/admin/services", icon: SettingsIcon },
  { label: "Cities", href: "/admin/cities", icon: MapPinnedIcon },
  { label: "Hospitals", href: "/admin/hospitals", icon: HospitalIcon },
  { label: "Categories", href: "/admin/categories", icon: LayoutGridIcon },
  { label: "Crash Reports", href: "/admin/crash-report", icon: FileWarningIcon },
];

export const CommandPalette = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const down = (event) => {
      const isMetaK = (event.ctrlKey || event.metaKey) && event.key === "k";
      if (!isMetaK) {
        return;
      }

      event.preventDefault();
      setIsOpen((previous) => !previous);
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const routes = useMemo(
    () => quickRoutes.filter((route) => route.href !== pathname),
    [pathname]
  );

  const onSelect = (href) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        className="hidden h-10 w-60 items-center justify-between rounded-[12px] text-[#64748B] md:flex"
        onClick={() => setIsOpen(true)}
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="size-4" />
          <span>Search pages...</span>
        </span>
        <CommandShortcut>Ctrl+K</CommandShortcut>
      </Button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Type a page name..." />
        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {routes.map((route) => {
              const Icon = route.icon;
              return (
                <CommandItem key={route.href} onSelect={() => onSelect(route.href)}>
                  <Icon className="size-4" />
                  <span>{route.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
