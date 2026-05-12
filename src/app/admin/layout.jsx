import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }) => {
  return (
    <SidebarProvider className="min-h-svh">
      <AppSidebar />
      <SidebarInset className="min-h-svh min-w-0 bg-[#F5F7FB]">
        <div className="sticky top-0 z-50 shrink-0">
          <AppHeader />
        </div>
        <main className="min-h-[calc(100svh-var(--app-header-height))] min-w-0 px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-[1440px] min-w-0">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
