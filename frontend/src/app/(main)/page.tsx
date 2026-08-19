'use client'

import { useAuth } from "@/app/hooks/useAuth";
import { NotLogin } from "./component/home/NotLogin";
import { IsLogin } from "./component/home/IsLogin";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <main className="p-4 md:p-8 h-160 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          /* โครงสร้างตัวหมุนโหลดเมื่อกำลังเช็กการเข้าสู่ระบบ */
          <div className="min-h-[0vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-400">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
          </div>
        ) : user ? (
          <IsLogin />   
        ) : (
          <NotLogin />
        )}
      </div>
    </main>
  );
}