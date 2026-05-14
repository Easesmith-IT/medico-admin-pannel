import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminBreadcrumbs } from "@/components/shared/admin-breadcrumbs";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }) => {
  return (
    <SidebarProvider className="min-h-dvh">
      <AppSidebar />
      <SidebarInset className="max-h-dvh min-w-0 overflow-hidden bg-[#F5F7FB]">
        <div className="flex h-full min-h-0 flex-col">
          <div className="sticky top-0 z-50 shrink-0">
            <AppHeader />
          </div>
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto w-full max-w-[1440px] min-w-0 space-y-4">
              <div className="rounded-xl bg-white/70 px-3 py-2 shadow-sm backdrop-blur md:px-4">
                <AdminBreadcrumbs />
              </div>
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
