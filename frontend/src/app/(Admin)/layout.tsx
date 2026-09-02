'use client';

import { Navbar_Admin } from "../(Admin)/component/Navber_Admin";
import { Header_Admin } from "../(Admin)/component/Header_Admin";
import { SidebarProvider } from "./context/SidebarContext";

import { useAuth } from "@/app/hooks/Authcontext";
import { useTheme } from "../(main)/context/ThemeContext";

function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">

        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />

        <p className="text-sm font-semibold text-slate-600">
          กำลังโหลด...
        </p>

      </div>
    </div>
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading: authLoading } = useAuth();
  const { isThemeLoading } = useTheme();

  if (authLoading || isThemeLoading) {
    return <FullPageLoading />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SidebarProvider>

        <Header_Admin />

        <div className="flex flex-1 overflow-hidden">

          <Navbar_Admin />

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

        </div>

      </SidebarProvider>
    </div>
  );
}