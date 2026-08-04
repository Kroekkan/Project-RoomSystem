import { Navbar } from "./component/Navbar";
import { Header } from "./component/Header";
import { SidebarProvider } from "./context/SidebarContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full bg-gray-100 flex flex-col overflow-hidden">
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