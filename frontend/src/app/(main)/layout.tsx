'use client'

import { Navbar } from "./component/Navbar";
import { Header } from "./component/Header";
import { SidebarProvider } from "./context/SidebarContext";
import ScrollToTop from "./component/ScrollToTop";
import { useAuth } from "../hooks/useAuth";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();

  return (
    <div 
      className={`h-full flex flex-col overflow-hidden`}
      style={{
        backgroundColor: user?.background || "##f3f4f6",
      }}
    >
        <SidebarProvider>
            <Header />
            <div className="flex flex-1 overflow-hidden">
            <Navbar />
                <main id="main-content" className="flex-1 overflow-y-auto">
                    <ScrollToTop />
                    {children}
                </main>
            </div>
        </SidebarProvider>
    </div>
  );
}