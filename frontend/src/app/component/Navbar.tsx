'use client'

import { useState } from "react";
import Link from "next/link";
import {
    Home,
    Megaphone,
    Columns3Cog,
    ChevronLeft,
    ChevronRight,
    Settings
} from "lucide-react";

const menu = [
    { name: "หน้าแรก", icon: Home, href: '/' },
    { name: "ประชาสัมพันธ์", icon: Megaphone, href: '/' },
    { name: "ตาราง", icon: Columns3Cog, href: '/' },
    { name: "ตั้งค่า", icon: Settings, href: '/' },
]

export function Navbar () {
    const [ fold, setFold ] = useState(false);

    return (
        <aside className={`h-169.5 bg-gray-900 text-gray-200 flex flex-col transition-all duration-500 
                ${fold 
                    ? 'w-20' 
                    : 'w-64'
                }`
            }
        >
            
            <div className="h-full w-screen flex items-center">
                <button
                    onClick={() => setFold(!fold)} 
                    className={`w-10 h-20 items-center p-2 rounded-lg bg-gray-800 hover:bg-gray-800 transition-all duration-500 cursor-pointer
                            ${fold
                                ? 'ml-14'
                                : 'ml-58'
                            }
                        `}
                    >
                    {fold ? (
                        <ChevronRight size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )}
                </button>
            </div>

        </aside>
    )
}