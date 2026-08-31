'use client'

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/Authcontext";
import { 
  History, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Ban,
  Building,
  User as UserIcon
} from "lucide-react";

interface Booking {
  id: number;
  roomId: number;
  userName: string;
  userEmail?: string;
  room?: { name: string };
  day: string;
  date: string;
  period: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

const API = process.env.NEXT_CONFIG_API_URL;

function formatDateTH(dStr: string): string {
  const d = new Date(dStr);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

function formatTimeTH(dStr: string): string {
  return new Date(dStr).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  });
}

export default function Booking_History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async (showLoading = false) => {
      if (showLoading) setIsLoading(true);

      const fetchUrl = isAdmin
        ? `${API}/bookings`
        : `${API}/bookings/user/${user.id}`;

      try {
        const res = await fetch(fetchUrl, {
          credentials: 'include',
        });

        const data = res.ok ? await res.json() : [];

        if (Array.isArray(data)) {
          const sorted = data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          );

          setHistory(sorted.slice(0, 10));
        }
      } catch (err) {
        console.error('Fetch history error:', err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    };

    fetchHistory(true);

    const intervalId = window.setInterval(() => {
      fetchHistory(false);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [user?.id, isAdmin]);

  return (
    <div className="mt-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isAdmin ? 'ประวัติการจองทั้งหมดในระบบ (10 รายการล่าสุด)' : 'ประวัติการจองของคุณ (10 รายการล่าสุด)'}
            </h2>
            <p className="text-xs text-slate-400">
              {isAdmin ? 'รายการจองของผู้ใช้งานทุกคนเรียงตามลำดับเวลาล่าสุด' : 'รายการคำขอจองห้องเรียนของคุณที่ทำรายการล่าสุด'}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
          {history.length} รายการล่าสุด
        </span>
      </div>

      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              {/* ถ้าเป็น ADMIN เพิ่มคอลัมน์แสดงว่าใครเป็นคนจอง */}
              {isAdmin && <th className="py-3 px-4">ผู้ขอจอง</th>}
              <th className="py-3 px-4">ห้องเรียน</th>
              <th className="py-3 px-4">วันที่ / คาบเรียน</th>
              <th className="py-3 px-4">วัตถุประสงค์</th>
              <th className="py-3 px-4 text-center">สถานะ</th>
              <th className="py-3 px-4 text-center">เวลาเข้า / ออก</th>
              <th className="py-3 px-4 text-right">วันที่ทำรายการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {isAdmin && <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-28"></div></td>}
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                  <td className="py-4 px-4"><div className="h-5 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24 mx-auto"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-20 ml-auto"></div></td>
                </tr>
              ))
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-sm">ยังไม่มีประวัติการจองห้องพักในระบบ</p>
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* แสดงชื่อผู้ขอจอง (กรณี ADMIN) */}
                  {isAdmin && (
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <div>
                          <div>{item.userName}</div>
                          {item.userEmail && <div className="text-[10px] text-slate-400 font-normal">{item.userEmail}</div>}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* ห้องเรียน */}
                  <td className="py-3.5 px-4 font-bold text-indigo-700">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{item.room?.name || `ห้อง ID: ${item.roomId}`}</span>
                    </div>
                  </td>

                  {/* วันที่และคาบเรียน */}
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-semibold">วัน{item.day}ที่ {item.date}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> คาบที่ {item.period}
                    </div>
                  </td>

                  {/* วัตถุประสงค์ */}
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                    <p className="truncate font-medium">{item.purpose || '-'}</p>
                  </td>

                  {/* สถานะ */}
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> อนุมัติแล้ว
                      </span>
                    )}

                    {item.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> รออนุมัติ
                      </span>
                    )}

                    {item.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> ปฏิเสธแล้ว
                      </span>
                    )}

                    {item.status === 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <Ban className="w-3.5 h-3.5 text-slate-400" /> ยกเลิกแล้ว
                      </span>
                    )}
                  </td>

                  {/* {แสดงเวลาเข้า / ออก ห้องเรียน} */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="font-semibold text-emerald-600">
                        เข้า: {item.checkInTime ? formatTimeTH(item.checkInTime) : '-'}
                      </span>

                      <span className="font-semibold text-rose-500">
                        ออก: {item.checkOutTime ? formatTimeTH(item.checkOutTime) : '-'}
                      </span>
                    </div>
                  </td>

                  {/* วันที่ทำรายการ */}
                  <td className="py-3.5 px-4 text-right text-slate-400 font-medium">
                    {formatDateTH(item.createdAt)}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}