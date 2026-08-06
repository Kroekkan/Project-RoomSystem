import { Navbar_Admin } from "../(Admin)/component/Navber_Admin";
import { Header_Admin } from "../(Admin)/component/Header_Admin";
import { SidebarProvider } from "./context/SidebarContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full bg-gray-100 flex flex-col overflow-hidden">
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