"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ADMIN_ACCOUNT_SECTION,
  ADMIN_NAVIGATION_SECTIONS,
  ADMIN_QUICK_ACTION,
} from "@/components/navigation/admin-navigation";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { POST } from "@/constants/apiMethods";
import { useApiMutation } from "@/hooks/useApiMutation";
import { getDisplayEmail, getDisplayName } from "@/lib/display";
import { removeAuthCookies } from "@/lib/cookies";
import { readCookie } from "@/lib/readCookie";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const isPathMatch = (pathname, href) =>
  pathname === href || pathname.startsWith(`${href}/`);

const isPathActive = (pathname, item) => {
  if (isPathMatch(pathname, item.href)) {
    return true;
  }

  if (Array.isArray(item.match)) {
    return item.match.some((href) => isPathMatch(pathname, href));
  }

  return false;
};

const getInitialSectionState = () => {
  const initial = {};
  for (const section of ADMIN_NAVIGATION_SECTIONS) {
    initial[section.id] = section.defaultOpen;
  }
  return initial;
};

const getInitials = (name) => {
  if (!name || name === "-") return "AD";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "AD";
};

const SectionLabel = ({ title }) => (
  <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7E8CA8]">
    {title}
  </p>
);

const SidebarNavItem = ({
  item,
  sectionTitle,
  isActive,
  iconOnly,
  onNavigate,
}) => {
  const ItemIcon = item.icon;

  return (
    <motion.li
      layout
      key={item.href}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      whileHover={{ y: -1 }}
      className="list-none"
    >
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={{
          children: (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">
                {item.title}
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#93C5FD]">
                {sectionTitle}
              </span>
            </div>
          ),
          className: "border border-[#1E3A8A] bg-[#0A1224]",
        }}
        className={cn(
          "group relative h-11 gap-3 overflow-hidden rounded-xl px-3 text-[13px] text-[#AFC0DA] transition-all duration-200",
          "hover:bg-[#162640] hover:text-[#E2E8F0] hover:shadow-[0_6px_20px_rgba(15,23,42,0.34)]",
          "focus-visible:ring-2 focus-visible:ring-[#60A5FA] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B1427]",
          "data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#1D4ED8]/55 data-[active=true]:to-[#2563EB]/15",
          "data-[active=true]:font-semibold data-[active=true]:text-[#F8FBFF] data-[active=true]:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.55),0_8px_22px_rgba(15,23,42,0.42)]",
          iconOnly && "justify-center px-2",
        )}
      >
        <Link
          href={item.href}
          prefetch
          aria-label={`${sectionTitle} - ${item.title}`}
          className="relative flex w-full items-center gap-3"
          onClick={onNavigate}
        >
          {isActive ? (
            <motion.span
              layoutId="sidebar-active-rail"
              className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-[#7DD3FC] shadow-[0_0_16px_rgba(125,211,252,0.9)]"
            />
          ) : null}
          <ItemIcon
            className={cn(
              "size-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
              isActive ? "text-[#93C5FD]" : "text-[#8FA8CF]",
            )}
          />
          {!iconOnly ? <span className="truncate">{item.title}</span> : null}
        </Link>
      </SidebarMenuButton>
    </motion.li>
  );
};

const DesktopNavigation = ({ pathname, iconOnly }) => {
  const [openSections, setOpenSections] = useState(getInitialSectionState);

  const activeBySection = useMemo(() => {
    const result = {};
    for (const section of ADMIN_NAVIGATION_SECTIONS) {
      result[section.id] = section.items.some((item) =>
        isPathActive(pathname, item),
      );
    }
    return result;
  }, [pathname]);

  useEffect(() => {
    setOpenSections((current) => {
      const next = { ...current };
      for (const section of ADMIN_NAVIGATION_SECTIONS) {
        if (activeBySection[section.id]) {
          next[section.id] = true;
        }
      }
      return next;
    });
  }, [activeBySection]);

  const toggleSection = useCallback((sectionId) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }, []);

  return (
    <div className="space-y-1 pb-2">
      {ADMIN_NAVIGATION_SECTIONS.map((section, sectionIndex) => {
        const sectionOpen = openSections[section.id] ?? section.defaultOpen;
        const sectionActive = activeBySection[section.id];

        return (
          <SidebarGroup
            key={section.id}
            className={cn(
              "rounded-2xl px-1.5 py-1 transition-colors",
              sectionIndex > 0 && !iconOnly && "mt-3",
              sectionActive &&
                "bg-white/[0.03] ring-1 ring-inset ring-[#1E3A8A]/45",
            )}
          >
            {!iconOnly ? (
              <div className="mb-1.5 flex items-center justify-between px-1">
                <SectionLabel title={section.title} />
                {section.collapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-label={`Toggle ${section.title}`}
                    aria-expanded={sectionOpen}
                    className={cn(
                      "flex size-6 items-center justify-center rounded-md text-[#7A8CAB] transition-colors hover:bg-[#162640] hover:text-[#D2E2F7]",
                      sectionActive && "text-[#93C5FD]",
                    )}
                  >
                    <motion.span
                      animate={{ rotate: sectionOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="size-4" />
                    </motion.span>
                  </button>
                ) : null}
              </div>
            ) : null}

            <AnimatePresence initial={false}>
              {iconOnly || !section.collapsible || sectionOpen ? (
                <motion.div
                  key={`${section.id}-content`}
                  initial={iconOnly ? false : { height: 0, opacity: 0 }}
                  animate={iconOnly ? false : { height: "auto", opacity: 1 }}
                  exit={iconOnly ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <SidebarGroupContent>
                    <SidebarMenu
                      className={cn("gap-1", iconOnly && "items-center")}
                    >
                      {section.items.map((item) => (
                        <SidebarNavItem
                          key={item.href}
                          item={item}
                          sectionTitle={section.title}
                          isActive={isPathActive(pathname, item)}
                          iconOnly={iconOnly}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </SidebarGroup>
        );
      })}
    </div>
  );
};

const MobileNavigation = ({ pathname, onNavigate }) => {
  const defaultOpenSections = useMemo(
    () =>
      ADMIN_NAVIGATION_SECTIONS.filter((section) => section.defaultOpen).map(
        (section) => section.id,
      ),
    [],
  );

  return (
    <div className="space-y-2 pb-2">
      <Accordion
        type="multiple"
        defaultValue={defaultOpenSections}
        className="w-full"
      >
        {ADMIN_NAVIGATION_SECTIONS.map((section) => {
          const sectionActive = section.items.some((item) =>
            isPathActive(pathname, item),
          );

          if (!section.collapsible) {
            return (
              <div key={section.id} className="space-y-2 px-1.5 py-1.5">
                <SectionLabel title={section.title} />
                <SidebarMenu className="gap-1">
                  {section.items.map((item) => (
                    <SidebarNavItem
                      key={item.href}
                      item={item}
                      sectionTitle={section.title}
                      isActive={isPathActive(pathname, item)}
                      iconOnly={false}
                      onNavigate={onNavigate}
                    />
                  ))}
                </SidebarMenu>
              </div>
            );
          }

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className={cn(
                "overflow-hidden rounded-2xl border border-transparent bg-white/[0.01] px-1",
                sectionActive && "border-[#1E3A8A]/60 bg-[#12203A]/60",
              )}
            >
              <AccordionTrigger className="px-3 py-2 no-underline hover:no-underline">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#90A3BF]">
                  {section.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <SidebarMenu className="gap-1 px-1.5">
                  {section.items.map((item) => (
                    <SidebarNavItem
                      key={item.href}
                      item={item}
                      sectionTitle={section.title}
                      isActive={isPathActive(pathname, item)}
                      iconOnly={false}
                      onNavigate={onNavigate}
                    />
                  ))}
                </SidebarMenu>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const iconOnly = state === "collapsed" && !isMobile;

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const initialResponsiveStateApplied = useRef(false);
  const adminName = getDisplayName(currentAdmin);
  const adminEmail = getDisplayEmail(currentAdmin);
  const adminRole = currentAdmin?.role || "admin";

  const profileItem = ADMIN_ACCOUNT_SECTION.item;
  const isProfileActive = isPathActive(pathname, profileItem);

  const { mutateAsync, isPending } = useApiMutation({
    url: "/admin/logout",
    method: POST,
    invalidateKey: ["admin"],
  });

  const completeClientLogout = () => {
    removeAuthCookies();
    queryClient.clear();
    setCurrentAdmin(null);
    setIsAlertModalOpen(false);
    router.replace("/");
    router.refresh();
  };

  useEffect(() => {
    setCurrentAdmin(readCookie("userInfo") || null);
  }, []);

  useEffect(() => {
    if (isMobile || initialResponsiveStateApplied.current) {
      return;
    }

    const persistedState = readCookie("sidebar_state");
    if (persistedState === undefined) {
      setOpen(window.innerWidth >= 1280);
    }

    initialResponsiveStateApplied.current = true;
  }, [isMobile, setOpen]);

  const handleLogout = async () => {
    try {
      await mutateAsync();
    } finally {
      completeClientLogout();
    }
  };

  const handleNavigate = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#1C2B45] bg-gradient-to-b from-[#0A1327] via-[#0D1830] to-[#0A1327] backdrop-blur-xl"
    >
      <SidebarHeader className="gap-3 border-b border-[#1B2B45]/85 px-2.5 pb-3 pt-4">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className={cn(
              "h-12 rounded-xl px-2.5 text-[#E2E8F0] hover:bg-[#132441] hover:text-white",
              iconOnly && "justify-center px-2",
            )}
          >
            <Link
              href="/admin/dashboard"
              prefetch
              aria-label="Medico Admin Home"
            >
              <Image
                src="/logos/medico-logo.svg"
                width={26}
                height={26}
                alt="Medico"
                className="shrink-0"
              />
              {!iconOnly ? (
                <span className="truncate text-sm font-semibold tracking-[-0.01em]">
                  Medico Admin
                </span>
              ) : null}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.16 }}>
          <Button
            asChild
            className={cn(
              "h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_10px_22px_rgba(37,99,235,0.38)]",
              "hover:from-[#3B82F6] hover:to-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#93C5FD] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0A1327]",
              iconOnly && "px-0",
            )}
          >
            <Link
              href={ADMIN_QUICK_ACTION.href}
              prefetch
              aria-label={`Quick action ${ADMIN_QUICK_ACTION.title}`}
            >
              <Plus className="size-4" />
              {!iconOnly ? <span>{ADMIN_QUICK_ACTION.title}</span> : null}
            </Link>
          </Button>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-2 py-3 sidebar-nav-scroll">
        {isMobile ? (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <MobileNavigation pathname={pathname} onNavigate={handleNavigate} />
          </motion.div>
        ) : (
          <DesktopNavigation pathname={pathname} iconOnly={iconOnly} />
        )}
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-[#1B2B45]/85 px-2.5 py-3">
        {!iconOnly ? (
          <SectionLabel title={ADMIN_ACCOUNT_SECTION.title} />
        ) : null}

        <SidebarMenu>
          <SidebarNavItem
            item={profileItem}
            sectionTitle={ADMIN_ACCOUNT_SECTION.title}
            isActive={isProfileActive}
            iconOnly={iconOnly}
            onNavigate={handleNavigate}
          />
        </SidebarMenu>

        {!iconOnly ? (
          <div className="rounded-xl border border-[#263955] bg-[#111C34]/85 p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-xs font-semibold text-white">
                {getInitials(adminName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[#E2E8F0]">
                  {adminName}
                </p>
                <p className="truncate text-[11px] text-[#8BA1C0]">
                  {adminEmail}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#7E8CA8]">
              {adminRole}
            </p>
          </div>
        ) : null}

        <Button
          type="button"
          onClick={() => setIsAlertModalOpen(true)}
          disabled={isPending}
          variant="ghost"
          className={cn(
            "h-10 w-full justify-start gap-2.5 rounded-xl border border-[#1D2F4E] bg-[#101A31] text-[#B6C6DE]",
            "hover:bg-[#162640] hover:text-white",
            iconOnly && "justify-center px-0",
          )}
          aria-label="Logout"
        >
          <LogOut className="size-4" />
          {!iconOnly ? <span>Logout</span> : null}
          {iconOnly ? <span className="sr-only">Logout</span> : null}
        </Button>
      </SidebarFooter>

      {isAlertModalOpen ? (
        <ConfirmModal
          header="Logout"
          description="Are you sure you want to logout?"
          isModalOpen={isAlertModalOpen}
          setIsModalOpen={setIsAlertModalOpen}
          disabled={isPending}
          onConfirm={handleLogout}
        />
      ) : null}
    </Sidebar>
  );
};
