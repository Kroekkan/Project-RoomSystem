'use client'

import { LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useLogout } from "@/app/hooks/useLogout";
import Link from "next/link";

export function Header() {
    const { user, isLoading } = useAuth();
    const { handleLogout } = useLogout();

  return (
    <header
      className="sticky top-0 z-50 h-16 flex items-center px-4 justify-between shadow-xl bg-app-header text-app-header-text"
    >
      <h1 className="text-lg font-bold">Roomify</h1>

    {isLoading ? (
      <></>
    ) : user
            ?
            <div className="flex items-center">
                <h2 className="text-lg font-bold mx-4">{user.name}</h2>

                <button
                  onClick={handleLogout}
                  className="bg-app-header-text/90 text-app-header rounded-full p-1.5 cursor-pointer hover:bg-app-header-text transition-colors"
                >
                <LogOut size={20} className="shrink-0" />
                </button>
            </div>
            :
            <div>
                <Link
                    key={"login"}
                    href={'/Login'}
                    className="flex items-center gap-3 p-2 bg-app-header-hover shadow-lg text-app-header-text hover:opacity-90 rounded-xl transition-colors duration-700"
                >
                    <LogIn />
                    <h2>เข้าสู่ระบบ</h2>
                </Link>
            </div>
        }

    </header>
  );
}