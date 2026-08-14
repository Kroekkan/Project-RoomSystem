'use client'

import { LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useLogout } from "@/app/hooks/useLogout";
import Link from "next/link";

export function Header() {
    const { user, isLoading } = useAuth();
    const { handleLogout } = useLogout();
  
  return (
    <header className="sticky top-0 z-50 bg-[#343a40] h-16 flex items-center px-4 justify-between shadow-xl">
      <h1 className="text-white text-lg font-bold">Roomify</h1>

    {isLoading ? (
      <></>
    ) : user 
            ?
            <div className="flex">
                <h2 className="text-white text-lg  font-bold mx-4">{user.name}</h2>

                <button 
                  onClick={handleLogout}
                  className="bg-white rounded-full px-1 cursor-pointer hover:bg-gray-200"
                >
                <LogOut size={20} className="shrink-0" />
                </button>
            </div>
            :
            <div>
                <Link
                    key={"login"}
                    href={'/Login'}
                    className="flex gap-3 p-2 bg-blue-500 shadow-lg shadow-blue-500/50 text-white hover:bg-white hover:text-black rounded-xl transition-colors duration-700"
                >
                    <LogIn />
                    <h2>เข้าสู่ระบบ</h2>
                </Link>
            </div>
        }
      
    </header>
  );
}
