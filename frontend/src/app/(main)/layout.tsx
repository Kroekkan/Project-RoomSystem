import { Navbar } from "../(main)/component/Navbar";
import { Header } from "../(main)/component/Header";
import { SidebarProvider } from "../(main)/context/SidebarContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
        <SidebarProvider>
            <Header />
            <div className="flex flex-1 overflow-hidden">
            <Navbar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    </div>
  );
}