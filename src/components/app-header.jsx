"use client";

import { LogOutIcon } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/logout";
import { ConfirmModal } from "./shared/confirm-modal";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { POST } from "@/constants/apiMethods";

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
    if (data) {
      router.push("/"); // redirect to login page
    }
  }, [data]);

  return (
    <header className="flex h-14 sticky z-20 w-full top-0 shrink-0 justify-between items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <Button onClick={onLogout} variant="ghost" size="icon">
        <LogOutIcon />
      </Button>

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
    </header>
  );
};
