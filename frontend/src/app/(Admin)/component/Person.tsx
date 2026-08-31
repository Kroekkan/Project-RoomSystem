'use client'

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/hooks/Authcontext";
import { 
  CircleUserRound, 
  Mail, 
  ShieldCheck, 
  Building2, 
  PieChart as PieChartIcon, 
  Calendar,
  Layers,
  Globe,
  UserCheck
} from "lucide-react";

interface Booking {
  id: number;
  roomId: number;
  room?: { name: string };
  userId?: number | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

export function Person() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  // 🟢 ดึงข้อมูล: ถ้าเป็น ADMIN ดึง /bookings (ทั้งหมด) | ถ้าเป็น USER ดึง /bookings/user/:id (เฉพาะตัวเอง)
  useEffect(() => {
    if (!user?.id) return;
    setIsLoadingBookings(true);

    const fetchUrl = isAdmin ? `${API}/bookings` : `${API}/bookings/user/${user.id}`;

    fetch(fetchUrl)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setBookingsData(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Fetch bookings for chart error:", err))
      .finally(() => setIsLoadingBookings(false));
  }, [user?.id, isAdmin]);

  // 📊 คำนวณสถิติแบ่งตามห้อง (สัปดาห์ / เดือน)
  const chartData = useMemo(() => {
    const now = new Date();
    
    const filtered = bookingsData.filter((b) => {
      const bDate = new Date(b.createdAt);
      if (filterType === 'WEEK') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return bDate >= oneWeekAgo;
      } else {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return bDate >= oneMonthAgo;
      }
    });

    const roomMap: Record<string, number> = {};
    filtered.forEach((b) => {
      const roomName = b.room?.name || `ห้อง ID: ${b.roomId}`;
      roomMap[roomName] = (roomMap[roomName] || 0) + 1;
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];
    const total = Object.values(roomMap).reduce((a, b) => a + b, 0);

    return Object.entries(roomMap).map(([name, count], index) => ({
      name,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[index % colors.length],
    }));
  }, [bookingsData, filterType]);

  const totalFilteredBookings = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      
      {/* 👤 การ์ดที่ 1: ข้อมูลผู้ใช้งาน (Profile Card) */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ข้อมูลส่วนตัว</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {user?.role || 'USER'}
            </span>
          </div>

          {/* รูปโปรไฟล์ */}
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                  <CircleUserRound size={68} strokeWidth={1.5} />
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mt-4">{user?.name || 'ผู้ใช้งาน'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email || '-'}</p>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>อีเมล</span>
              </div>
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">{user?.email || '-'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>หมวด / สาขา</span>
              </div>
              <span className="text-xs font-semibold text-slate-800">{user?.branch || '-'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-400">
          สิทธิ์การใช้งาน: {isAdmin ? 'ผู้ดูแลระบบ (ADMIN)' : 'สมาชิกทั่วไป (USER)'}
        </div>
      </div>

      {/* 📊 การ์ดที่ 2: แผนภูมิกราฟวงกลม */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {isAdmin ? 'สถิติการจองห้องทั้งระบบ' : 'สถิติห้องที่เคยจอง'}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  {isAdmin ? <Globe className="w-3 h-3 text-indigo-500" /> : <UserCheck className="w-3 h-3 text-emerald-500" />}
                  {isAdmin ? 'แสดงข้อมูลรวมของผู้ใช้งานทุกคน' : 'แสดงเฉพาะสถิติของคุณ'}
                </span>
              </div>
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setFilterType('WEEK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'WEEK' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                สัปดาห์นี้
              </button>
              <button
                onClick={() => setFilterType('MONTH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'MONTH' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                เดือนนี้
              </button>
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="h-56 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
              <Calendar className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-sm font-medium">ยังไม่มีข้อมูลการจองใน{filterType === 'WEEK' ? 'สัปดาห์นี้' : 'เดือนนี้'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-4">
              
              <div className="sm:col-span-6 flex justify-center relative">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let accumulatedPercent = 0;
                    return chartData.map((item, index) => {
                      const strokeDasharray = `${item.percent} ${100 - item.percent}`;
                      const strokeDashoffset = -accumulatedPercent;
                      accumulatedPercent += item.percent;

                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="14"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          className="transition-all duration-500 hover:opacity-80"
                        />
                      );
                    });
                  })()}
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">{totalFilteredBookings}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{isAdmin ? 'คำขอทั้งหมด' : 'การจองของคุณ'}</span>
                </div>
              </div>

              <div className="sm:col-span-6 space-y-2.5">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {item.count} ครั้ง <span className="text-slate-400 font-normal text-[11px]">({item.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 mt-2">
          <span>{isAdmin ? `รวม ${bookingsData.length} รายการทั้งระบบ` : `รวม ${bookingsData.length} รายการของคุณ`}</span>
          <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> อัปเดตล่าสุด</span>
        </div>
      </div>

    </div>
  );
}