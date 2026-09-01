"use client";

import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/app/hooks/Authcontext";
import { useLogout } from "@/app/hooks/useLogout";
import Link from "next/link";
import {
  Home,
  Megaphone,
  Columns3Cog,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  MoveRight,
} from "lucide-react";

const menuTop = [
  { name: "หน้าแรก", icon: Home, href: "/" },
  { name: "ตาราง", icon: Columns3Cog, href: "/Roombooking" },
  { name: "ประชาสัมพันธ์", icon: Megaphone, href: "/Public_relations" },
];

const adminMenu = [{ name: "หน้า Admin", icon: MoveRight, href: "/admin" }];
const menuButton = [{ name: "ตั้งค่า", icon: Settings, href: "/Setting" }];

export function Navbar() {
  const { fold, setFold } = useSidebar();
  const { user, isLoading } = useAuth();
  const { handleLogout } = useLogout();

  const renderMenu = (items: typeof menuTop) => (
    <nav className="flex flex-col">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-4 top-3 text-app-navbar-text px-3 py-3 rounded-lg hover:bg-app-navbar-hover hover:text-app-navbar-text transition-colors duration-500 relative group overflow-hidden`}
            scroll
          >
            <Icon size={25} className="shrink-0 my-1" />
            <span
              className={`text-xl font-medium whitespace-nowrap transition-all duration-700 ease-in-out
                                    ${fold ? "opacity-0 w-0 -translate-x-2" : "opacity-100 w-auto translate-x-0"}
                                    `}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <aside
      className={`relative h-full ${isLoading ? "bg-[#0B4F6C] text-white" : "bg-app-navbar text-app-navbar-text"} flex flex-col shrink-0 transition-[width] duration-1000 ease-in-out
                ${fold ? "w-15" : "w-55"}`} 
    >
      <div className={`absolute inset-y-0 right-0`}>
        <button
          onClick={() => setFold(!fold)}
          className={`w-10 h-20 z-10 absolute top-1/2 -right-5 items-center p-2 rounded-lg bg-app-navbar-hover text-app-navbar-text hover:opacity-80 transition-all duration-1000 cursor-pointer
                            ${fold ? "ml-14" : "ml-[14.5rem]"}
                        `}
        >
          {fold ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {renderMenu(menuTop)}

      {isLoading ? (
        <></>
      ) : (
        <div className="flex flex-col mt-auto mb-4">
          {user?.role === "ADMIN" && renderMenu(adminMenu)}

          {renderMenu(menuButton)}

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 top-3 text-app-navbar-text px-3 py-3 rounded-lg hover:bg-app-navbar-hover hover:text-app-navbar-text transition-colors duration-500 relative group overflow-hidden"
          >
            <LogOut size={25} className="shrink-0 my-1" />

            <span
              className={`text-xl font-medium whitespace-nowrap transition-all duration-700 ease-in-out
                ${
                  fold
                    ? "opacity-0 w-0 -translate-x-2"
                    : "opacity-100 w-auto translate-x-0"
                }`}
            >
              ออกจากระบบ
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}