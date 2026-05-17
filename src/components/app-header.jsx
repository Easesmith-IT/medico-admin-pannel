"use client";

import { Loader2Icon, LogOutIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "./shared/confirm-modal";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { POST } from "@/constants/apiMethods";
import { CommandPalette } from "./shared/command-palette";
import { removeAuthCookies } from "@/lib/cookies";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

export const AppHeader = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inFlightQueries = useIsFetching();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const onLogout = async () => {
    setIsAlertModalOpen(true);
  };

  const { mutateAsync, isPending } = useApiMutation({
    url: `/admin/logout`,
    method: POST,
    invalidateKey: ["admin"],
  });

  const completeClientLogout = () => {
    removeAuthCookies();
    queryClient.clear();
    setIsAlertModalOpen(false);
    router.replace("/");
    router.refresh();
  };

  const handleLogout = async () => {
    try {
      await mutateAsync();
    } finally {
      completeClientLogout();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="w-full">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full border-b border-[#EAECEF] bg-white/90 backdrop-blur-xl"
      >
        <div className="relative mx-auto flex h-[var(--app-header-height)] w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="size-9 rounded-[10px] hover:bg-[#EEF2FF] hover:text-[#1E3A8A]" />
          </div>
          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
            <div className="rounded-xl border border-[#E2E8F0] bg-white/70 px-3 py-1 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
                Date and Time
              </p>
              <p className="text-sm font-semibold text-[#0F172A]">
                {formattedDate} • {formattedTime}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <CommandPalette />
            <Button
              onClick={onLogout}
              variant="outline"
              size="icon"
              aria-label="Logout"
              className="size-10"
            >
              <LogOutIcon className="size-4" />
            </Button>
          </div>
        </div>

        {isAlertModalOpen && (
          <ConfirmModal
            header="Logout"
            description="Are you sure you want to logout?"
            isModalOpen={isAlertModalOpen}
            setIsModalOpen={setIsAlertModalOpen}
            disabled={isPending}
            onConfirm={handleLogout}
          />
        )}
      </motion.header>
      {inFlightQueries > 0 ? (
        <div className="border-b border-[#E2E8F0] bg-white/95 px-4 py-1.5 text-xs text-[#475569] sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] items-center gap-2">
            <Loader2Icon className="size-3.5 animate-spin text-[#2563EB]" />
            <span>Updating data...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
