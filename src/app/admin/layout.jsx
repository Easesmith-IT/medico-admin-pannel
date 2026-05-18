"use client";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { ContentTransition } from "@/components/loading/content-transition";
import { LoadingProvider, TopProgressLoader, useGlobalLoading } from "@/components/loading";
import { AdminBreadcrumbs } from "@/components/shared/admin-breadcrumbs";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

function AdminLoadingChrome({ children }) {
  const { showTopProgress } = useGlobalLoading();

  return (
    <SidebarInset className="relative max-h-dvh min-w-0 overflow-hidden bg-[#F5F7FB]">
      <div className="flex h-full min-h-0 flex-col">
        <div className="sticky top-0 z-50 shrink-0">
          <AppHeader />
          <TopProgressLoader active={showTopProgress} />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto px-[var(--space-page-x)] py-[var(--space-page-y)]">
          <div className="mx-auto w-full max-w-[var(--layout-max-width)] min-w-0 app-page-grid">
            <div className="app-glass px-3 py-2 md:px-4">
              <AdminBreadcrumbs />
            </div>
            <ContentTransition>{children}</ContentTransition>
          </div>
        </main>
      </div>
    </SidebarInset>
  );
}

const Layout = ({ children }) => {
  return (
    <SidebarProvider className="min-h-dvh">
      <LoadingProvider>
        <AppSidebar />
        <AdminLoadingChrome>{children}</AdminLoadingChrome>
      </LoadingProvider>
    </SidebarProvider>
  );
};

export default Layout;
