'use client'

import { useAuth } from "@/app/hooks/useAuth";
import { Person } from "./Person";
import Booking_History from "./Booking_History";
import { ShieldCheck, UserCheck } from "lucide-react";

export function IsLogin() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      
      <div className={`p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden ${
        isAdmin 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900' 
          : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800'
      }`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <span className="px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold inline-flex items-center gap-1.5 text-indigo-100">
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-indigo-300" /> : <UserCheck className="w-4 h-4 text-emerald-300" />}
            {isAdmin ? 'แผงควบคุมระบบ (ADMINISTRATOR)' : 'สมาชิกระบบจองห้อง (USER)'}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            ยินดีต้อนรับ คุณ {user?.name || 'ผู้ใช้งาน'}
          </h1>
          <p className="text-xs md:text-sm text-indigo-100 max-w-xl font-medium">
            {isAdmin 
              ? 'ตรวจสอบสถิติการจองห้องรวมทั้งระบบ จัดการอนุมัติคำขอ และดูประวัติการทำรายการย้อนหลังทั้งหมด' 
              : 'จัดการข้อมูลส่วนตัว สถิติการจองห้องเรียน และตรวจสอบประวัติรายการย้อนหลังของคุณ'}
          </p>
        </div>
      </div>

      <Person />

      <Booking_History />

    </div>
  );
}