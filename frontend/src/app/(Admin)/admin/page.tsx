'use client'

import { useAuth } from "@/app/hooks/Authcontext";
import { Person } from "../component/Person";
import Booking_History from "../component/Booking_History";
import { ShieldCheck, UserCheck } from "lucide-react";
import AnnouncementBoard from "@/app/(main)/component/home/AnnouncementBoard";

export default function ProfilePage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen">
            <div className="max-w-7xl mx-auto space-y-3">
                
                {/* Banner ยินดีต้อนรับ (แสดงปรับตามสิทธิ์ ADMIN / USER) */}
                <div className={`p-6 md:p-8 rounded-3xl text-white shadow-lg flex items-center justify-between relative overflow-hidden ${
                  isAdmin ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900' : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800'
                }`}>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="space-y-1 relative z-10">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-100 border border-white/20 text-xs font-bold inline-flex items-center gap-1.5">
                          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {isAdmin ? 'แผงควบคุมระบบ (ADMIN)' : 'บัญชีสมาชิกทั่วไป (USER)'}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
                            ยินดีต้อนรับ คุณ {user?.name || 'ผู้ใช้งาน'}
                        </h1>
                        <p className="text-xs md:text-sm text-indigo-100 mt-1">
                            {isAdmin 
                              ? 'ตรวจสอบสถิติการจองห้องรวมทั้งระบบ และดูประวัติการทำรายการย้อนหลังทั้งหมด' 
                              : 'จัดการข้อมูลส่วนตัว สถิติการจองห้องเรียน และตรวจสอบประวัติรายการย้อนหลังของคุณ'}
                        </p>
                    </div>
                </div>

                {/* ส่วนที่ 1 & 2: ข้อมูลส่วนตัว + กราฟสถิติ (ADMIN รวม / USER เฉพาะตนเอง) */}
                <Person />

                {/* ส่วนที่ 3: ประวัติการจอง 10 รายการล่าสุด (ADMIN รวม / USER เฉพาะตนเอง) */}
                <Booking_History />

                <AnnouncementBoard />

            </div>
        </div>
    )
}