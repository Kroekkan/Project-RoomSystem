'use client'

import Link from "next/link"

export function NotLogin () {
    return (
        <div className="flex bg-white h-full rounded-4xl shadow-xl justify-center items-center">
            <Link
                href={'/Login'}
                className="bg-blue-500 shadow-lg shadow-blue-500/50 text-white p-4 rounded-2xl hover:bg-cyan-500 hover:shadow-cyan-500/50 transition=colors duration-700"
            >
                เข้าสู่ระบบ
            </Link>
        </div>
    )
}