'use client'

import { useState } from "react";
import Link from "next/link";
import {
    Home,
    Megaphone,
    Columns3Cog,
    ChevronLeft,
    ChevronRight,
    Settings,
    LogOut,
} from "lucide-react";

const menuTop = [
    { name: "หน้าแรก", icon: Home, href: '/' },
    { name: "ตาราง", icon: Columns3Cog, href: '/' },
    { name: "ประชาสัมพันธ์", icon: Megaphone, href: '/' },
]

const menuButton = [
    { name: "ตั้งค่า", icon: Settings, href: '/' },
    { name: "ออกจากระบบ", icon: LogOut, href: '/' },
]

export function Navbar () {
    const [ fold, setFold ] = useState(false);

    return (
        <aside className={`relative h-full bg-gray-900 text-gray-200 flex flex-col transition-[width] duration-1000 ease-in-out
                ${fold ? 'w-15' : 'w-55'
                }`
            }
        >
            
            <div className={`absolute inset-y-0 right-0`}>
                <button
                    onClick={() => setFold(!fold)} 
                    className={`w-10 h-20 z-10 absolute top-1/2 translate-y-1/2 -right-5 items-center p-2 rounded-lg bg-gray-800 hover:bg-gray-800 transition-all duration-1000 cursor-pointer
                            ${fold ? 'ml-14' : 'ml-[14.5rem]'}
                        `}
                    >
                    {fold ? (
                        <ChevronRight size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )}
                </button>
            </div>

            <nav className="flex flex-col">
                {menuTop.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link 
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-4 top-3 px-3 py-3 rounded-lg text-gray-400 hover:bg-gray-800 text-white transition-colors duration-500 group relative"
                        >
                            <Icon size={25} className="shrink-0 my-1" />
                            {!fold && (
                                <span className="text-xl font-medium whitespace-nowrap">{item.name}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <nav className="flex flex-col mt-auto mb-4">
                {menuButton.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link 
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-4 top-3 px-3 py-3 rounded-lg text-gray-400 hover:bg-gray-800 text-white transition-colors duration-500 group relative"
                        >
                            <Icon size={25} className="shrink-0 my-1" />
                            {!fold && (
                                <span className="text-xl font-medium whitespace-nowrap">{item.name}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

        </aside>
    )
}