"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

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
import {
  ADMIN_ACCOUNT_SECTION,
  ADMIN_NAVIGATION_SECTIONS,
} from "@/components/navigation/admin-navigation";
import { useGlobalLoading } from "@/components/loading/loading-provider";

const commandSections = [
  ...ADMIN_NAVIGATION_SECTIONS,
  {
    id: ADMIN_ACCOUNT_SECTION.id,
    title: ADMIN_ACCOUNT_SECTION.title,
    items: [ADMIN_ACCOUNT_SECTION.item],
  },
];

export const CommandPalette = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { beginRouteTransition } = useGlobalLoading();
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

  const sectionRoutes = useMemo(
    () =>
      commandSections
        .map((section) => ({
          id: section.id,
          title: section.title,
          routes: section.items.filter((item) => item.href !== pathname),
        }))
        .filter((section) => section.routes.length > 0),
    [pathname]
  );

  const onSelect = (href) => {
    setIsOpen(false);
    beginRouteTransition();
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
          {sectionRoutes.map((section) => (
            <CommandGroup key={section.id} heading={section.title}>
              {section.routes.map((route) => {
                const Icon = route.icon;
                return (
                  <CommandItem key={route.href} onSelect={() => onSelect(route.href)}>
                    <Icon className="size-4" />
                    <span>{route.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
