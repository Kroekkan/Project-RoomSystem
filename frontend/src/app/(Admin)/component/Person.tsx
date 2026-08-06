'use client'

import { useAuth } from "@/app/hooks/useAuth"

import { CircleUserRound } from "lucide-react";

export function Person () {
    const { user, isLoading } = useAuth();

    return (
        <div className="flex mt-5">
            <div className="flex flex-col gap-3 p-5 items-center bg-white h-70 w-100 rounded-xl shadow-xl">
                <CircleUserRound size={100} />
                <span>ชื่อ: {user?.name}</span>
                <span>อีเมล: {user?.email}</span>
                <span>สถานะ: {user?.role}</span>
                <span>หมวด/สาขา: {user?.branch}</span>
            </div>
            
            <div className="flex-1 ml-10 p-10 bg-white rounded-xl shadow-xl">
                <h1>test</h1>
            </div>
            
        </div>
    )
}