'use client'

import Link from "next/link";
import { LogIn, CalendarDays, BellRing, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export function NotLogin() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 md:p-12">
      
      {/* Background Glow Decorations */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl text-center space-y-8 relative z-10">
        
        {/* Badge สไตล์พรีเมียม */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>ระบบจองห้องเรียนออนไลน์ Roomify</span>
        </div>

        {/* หัวข้อหลัก Hero Text */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
            จองห้องเรียนง่ายๆ แค่ไม่กี่คลิก <br className="hidden sm:block" />
            พร้อมระบบแจ้งเตือนตรงผ่าน <span className="text-emerald-600">LINE</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto font-medium">
            ตรวจสอบตารางใช้ห้องประจำ จองห้องเรียนชดเชย หรือห้องปฏิบัติการได้ทันที พร้อมรับผลการอนุมัติจากผู้ดูแลระบบผ่านแชท LINE
          </p>
        </div>

        {/* ปุ่มเข้าสู่ระบบ */}
        <div className="pt-2">
          <Link
            href="/Login"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 active:scale-95 group"
          >
            <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>เข้าสู่ระบบเพื่อใช้งาน</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* การ์ดจุดเด่น 3 ข้อ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">ตารางเรียน Real-time</h3>
            <p className="text-xs text-slate-500">เช็กตารางเรียนประจำและคาบว่างได้อย่างแม่นยำ</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <BellRing className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">แจ้งเตือนผ่าน LINE</h3>
            <p className="text-xs text-slate-500">รับการ์ดอนุมัติคำขอจองเข้า LINE โดยตรง</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">อนุมัติและยกเลิกสะดวก</h3>
            <p className="text-xs text-slate-500">ยกเลิกคำขอจองจากแชท LINE หรือเว็บได้ทันที</p>
          </div>
        </div>

      </div>
    </div>
  );
}