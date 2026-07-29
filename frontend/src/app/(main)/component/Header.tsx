'use client'

import { LogOut, LogIn } from "lucide-react";
import { useState, useEffect} from "react";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  role: string;
}

export function Header() {
  const [ user, setUser ] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#343a40] h-16 flex items-center px-4 justify-between shadow-xl">
      <h1 className="text-white text-lg font-bold">Book A Room</h1>

        {user 
            ?
            <div className="flex">
                <h2 className="text-white text-lg font-bold mx-4">{user?.email ? user.email.split('@')[0] : "ผู้ใช้งาน"}</h2>

                <button className="bg-white rounded-full px-1 cursor-pointer hover:bg-gray-200">
                <LogOut size={20} className="shrink-0" />
                </button>
            </div>
            :
            <div className="bg-sky-600 rounded-xl">
                <Link
                    key={"login"}
                    href={'/Login'}
                    className="flex gap-3 p-1.5 mx-2 text-white hover:bg-white hover:text-black rounded-xl transition-colors duration-700"
                >
                    <LogIn />
                    <h2>เข้าสู่ระบบ</h2>
                </Link>
            </div>
        }

      
    </header>
  );
}
