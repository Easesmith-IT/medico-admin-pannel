"use client";

import { LogOutIcon } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/logout";

export const AppHeader = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction(); // clears cookies on server
    router.push("/"); // redirect to login page
  };

  return (
    <header className="flex h-14 sticky w-full top-0 shrink-0 justify-between items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <Button onClick={handleLogout} variant="ghost" size="icon">
        <LogOutIcon />
      </Button>
    </header>
  );
};
