'use client'

import { Navbar } from "./component/Navbar";
import { Header } from "./component/Header";
import { SidebarProvider } from "./context/SidebarContext";
import ScrollToTop from "./component/ScrollToTop";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div 
      className={`h-full flex flex-col overflow-hidden`}
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