"use client";

import { LogOutIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/logout";
import { ConfirmModal } from "./shared/confirm-modal";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { POST } from "@/constants/apiMethods";
import { CommandPalette } from "./shared/command-palette";

export const AppHeader = () => {
  const router = useRouter();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const onLogout = async () => {
    setIsAlertModalOpen(true);
  };

  const { mutateAsync, isPending, data } = useApiMutation({
    url: `/admin/logout`,
    method: POST,
    invalidateKey: ["admin"],
  });

  const handleLogout = async () => {
    await mutateAsync();
  };

  useEffect(() => {
    if (data?.success) {

      setIsAlertModalOpen(false);
      router.refresh(); // redirect to login page
      // window.location.reload()
    }
  }, [data]);

  return (
    <div className="w-full">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full border-b border-[#EAECEF] bg-white/90 backdrop-blur-xl"
      >
      <div className="mx-auto flex h-[var(--app-header-height)] w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="size-9 rounded-[10px] hover:bg-[#EEF2FF] hover:text-[#1E3A8A]" />
        </div>
        <div className="flex items-center gap-2">
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
    </div>
  );
};
