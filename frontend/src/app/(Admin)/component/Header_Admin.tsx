'use client'

import { useEffect, useState, useRef } from "react";
import { LogOut, LogIn, Bell } from "lucide-react";
import { useAuth } from "@/app/hooks/Authcontext";
import { useLogout } from "@/app/hooks/useLogout";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

// 🔊 ฟังก์ชันเล่นเสียงกระดิ่ง "กริ๊งๆ" ด้วย Web Audio API
function playNotificationSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })['webkitAudioContext'];
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // เสียงโน้ตที่ 1 (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // เสียงโน้ตที่ 2 (D6 สูงขึ้น สดใส)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function Header_Admin() {
  const { user, isLoading } = useAuth();
  const { handleLogout } = useLogout();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const prevPendingCountRef = useRef<number | null>(null);

  // ดึงข้อมูลคำขอจองที่รออนุมัติ
  const checkPendingBookings = async () => {
    if (!user) return;

    try {
      let res = await fetch(`${API}/bookings/pending`, { credentials: 'include' });
      if (!res.ok) {
        res = await fetch(`${API}/bookings`, { credentials: 'include' });
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // นับเฉพาะสถานะ PENDING
          const count = data.filter((b: { status?: string }) => b.status === 'PENDING').length;
          setPendingCount(count);

          // ถ้าจำนวน PENDING เพิ่มขึ้นกว่ารอบที่แล้ว ให้ส่งเสียงเตือน
          if (
            prevPendingCountRef.current !== null &&
            count > prevPendingCountRef.current
          ) {
            playNotificationSound();
          }

          prevPendingCountRef.current = count;
        }
      }
    } catch (err) {
      console.error('Check pending bookings error:', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    // เช็คทันทีตอนเปิดหน้า
    checkPendingBookings();

    // Polling เช็คคำขอจองใหม่ทุก 5 วินาที
    const interval = window.setInterval(() => {
      checkPendingBookings();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [user]);

  return (
    <header className={`sticky top-0 z-50 h-16 flex items-center px-4 justify-between shadow-xl ${isLoading ? "bg-[#1E88E5] text-white" : "bg-app-header text-app-header-text"}`}>
      
      <h1 className="text-white text-lg font-bold"><img src="/LogoUdom.jpg" alt="Logo" />Roomify at Udom</h1>

      {isLoading ? (
        <></>
      ) : user ? (
        <div className="flex items-center gap-3">
          {/* 🔔 ไอคอนกระดิ่งแจ้งเตือนคำขอจองห้อง */}
          <Link
            href="/Manage_rooms"
            title={pendingCount > 0 ? `มีคำขอรออนุมัติ ${pendingCount} รายการ` : "ไม่มีคำขอรออนุมัติ"}
            className="relative p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
          >
            <Bell size={22} className={pendingCount > 0 ? "text-amber-300 animate-bounce" : ""} />

            {/* ป้ายตัวเลขแจ้งเตือนสีแดง */}
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 bg-rose-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-md animate-pulse">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </Link>

          <h2 className="text-white text-lg font-bold mx-2">{user.name}</h2>

          <button 
            onClick={handleLogout}
            className="bg-white text-black rounded-full p-1.5 cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
            title="ออกจากระบบ"
          >
            <LogOut size={20} className="shrink-0" />
          </button>
        </div>
      ) : (
        <div>
          <Link
            key={"login"}
            href={'/Login'}
            className="flex gap-3 p-2 bg-blue-500 shadow-lg shadow-blue-500/50 text-white hover:bg-white hover:text-black rounded-xl transition-colors duration-700"
          >
            <LogIn />
            <h2>เข้าสู่ระบบ</h2>
          </Link>
        </div>
      )}
    </header>
  );
}