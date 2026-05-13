import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }) => {
  return (
    <SidebarProvider className="min-h-dvh">
      <AppSidebar />
      <SidebarInset className="max-h-dvh min-w-0 overflow-y-auto bg-[#F5F7FB]">
        <div className="sticky top-0 z-50 shrink-0">
          <AppHeader />
        </div>
        <main className="min-h-[calc(100dvh-var(--app-header-height))] min-w-0 px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-[1440px] min-w-0">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
