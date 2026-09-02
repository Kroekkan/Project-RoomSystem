'use client';

import { Navbar } from "./component/Navbar";
import { Header } from "./component/Header";
import { SidebarProvider } from "./context/SidebarContext";
import ScrollToTop from "./component/ScrollToTop";

import { useAuth } from "@/app/hooks/Authcontext";
import { useTheme } from "./context/ThemeContext";

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
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <Navbar />

          <main
            id="main-content"
            className="flex-1 overflow-y-auto pb-16 md:pb-0"
          >
            <ScrollToTop />
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}