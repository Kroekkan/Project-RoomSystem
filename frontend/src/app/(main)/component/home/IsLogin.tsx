'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/Authcontext";
import { Person } from "./Person";
import Booking_History from "./Booking_History";
import { ShieldCheck, UserCheck, Building2, CheckCircle2 } from "lucide-react";
import AnnouncementBoard from "./AnnouncementBoard";
import Swal from "sweetalert2";

const API = process.env.NEXT_PUBLIC_API_URL;

// 🟢 รายการสาขาวิชา / หมวดวิชาที่ให้เลือก (สามารถปรับเปลี่ยนหรือเพิ่มได้ตามต้องการ)
const BRANCH_OPTIONS = [
  "การบัญชี",
  "คอมพิวเตอร์ธุรกิจ",
  "คอมพิวเตอร์กราฟิกฯ",
  "การตลาด",
  "การจัดการโลจิสติกส์",
  "ภาษาต่างประเทศ",
  "สามัญแกนธุรกิจ",
];

export function IsLogin() {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // ตรวจสอบว่ามี branch หรือยัง (ถ้าไม่มี, เป็นค่าว่าง, หรือเป็น '-')
  const needsBranch =!isLoading && !! user &&(!user.branch || user.branch.trim() === '' || user.branch === 'กรุณาใส่สาขา');

  const [selectedBranch, setSelectedBranch] = useState("");
  const [customBranch, setCustomBranch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🟢 ฟังก์ชันบันทึกสาขาวิชาไปยัง Backend
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBranch = selectedBranch === "OTHER" ? customBranch.trim() : selectedBranch;

    if (!finalBranch) {
      Swal.fire({
        title: "กรุณาเลือกสาขาวิชา",
        text: "คุณต้องระบุสาขาวิชาเพื่อเริ่มใช้งานระบบ",
        icon: "warning",
        heightAuto: false,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 🟢 ยิง PATCH ไปอัปเดตข้อมูล user
      const res = await fetch(`${API}/users/${user?.id}`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: finalBranch }),
      });

      if (res.ok) {
        await Swal.fire({
          title: "บันทึกข้อมูลสำเร็จ!",
          text: `คุณได้เลือกสังกัด: ${finalBranch}`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          heightAuto: false,
        });
        // รีเฟรชหน้าเพื่อให้ useAuth ดึงข้อมูลใหม่
        window.location.reload();
      } else {
        throw new Error("Failed to update branch");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        heightAuto: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* 🔒 Modal บังคับเลือกหมวด/สาขาวิชา (ปิดไม่ได้ ล็อกหน้าจอทั้งหมด) */}
      {needsBranch && (
        <div className="fixed inset-0 z-[999] h-full bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 md:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            
            {/* Icon */}
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-extrabold text-slate-800">
              กรุณาระบุหมวด / สาขาวิชาของคุณ
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              ยินดีต้อนรับคุณ <span className="font-bold text-indigo-600">{user?.name}</span> เพื่อความถูกต้องในการบันทึกสถิติและใช้งานระบบ กรุณาเลือกสาขาของคุณก่อนเริ่มใช้งาน
            </p>

            <form onSubmit={handleSaveBranch} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เลือกหมวด / สาขาวิชา <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  required
                >
                  <option value="" disabled>-- กรุณาเลือกสาขาวิชา --</option>
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                  <option value="OTHER">➕ อื่นๆ (ระบุเอง)</option>
                </select>
              </div>

              {/* กรณีเลือก อื่นๆ ให้กรอกข้อความเอง */}
              {selectedBranch === "OTHER" && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ระบุสาขาวิชาของคุณ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                    placeholder="เช่น สาขาวิชาการตลาดดิจิทัล"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedBranch}
                className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>กำลังบันทึกข้อมูล...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ยืนยันและเริ่มใช้งานระบบ</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* แบนเนอร์ด้านบน */}
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

      <AnnouncementBoard />

    </div>
  );
}