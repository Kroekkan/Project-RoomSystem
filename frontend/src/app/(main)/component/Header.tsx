'use client'

import { LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/app/hooks/Authcontext";
import { useLogout } from "@/app/hooks/useLogout";
import Link from "next/link";

export function Header() {
  const { user, isLoading } = useAuth();
  const { handleLogout } = useLogout();

  return (
    <header
      className={`sticky top-0 z-50 h-14 sm:h-16 flex items-center px-3 sm:px-4 justify-between shadow-xl ${
        isLoading
          ? "bg-[#1E88E5] text-white"
          : "bg-app-header text-app-header-text"
      }`}
    >
      <h1 className="text-base sm:text-lg font-bold shrink-0">
        Roomify
      </h1>

      {isLoading ? (
        <></>
      ) : user ? (
        <div className="flex items-center min-w-0">
          <h2 className="text-sm sm:text-lg font-bold mx-2 sm:mx-4 truncate max-w-[140px] sm:max-w-none">
            {user.name}
          </h2>

          <button
            onClick={handleLogout}
            className="bg-app-header-text/90 text-black rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-app-header-text transition-colors shrink-0"
            aria-label="ออกจากระบบ"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5" />  
          </button>
        </div>
      ) : (
        <div>
          <Link
            key={"login"}
            href={'/Login'}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:p-2 py-1.5 bg-app-header-hover shadow-lg text-app-header-text hover:opacity-90 rounded-xl transition-colors duration-700"
          >
            <LogIn size={18} className="sm:w-5 sm:h-5 shrink-0" />
            <h2 className="text-xs sm:text-base font-medium">
              เข้าสู่ระบบ
            </h2>
          </Link>
        </div>
      )}
    </header>
  );
}