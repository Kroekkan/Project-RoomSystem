'use client'

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Room { id: number; name: string; }
interface CurrentUser { id: number | string; name: string; email?: string; phone?: string; lineId?: string; role?: string; }

// ตารางสอนประจำจาก Admin
interface ScheduleItem {
  id: number;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  classroom: string;
}

// ตารางจองจาก User
interface BookingItem {
  id: number;
  userName: string;
  day: string;
  date: string;
  period: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const API = process.env.NEXT_PUBLIC_API_URL;
const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function formatDateISO(d: Date): string { return d.toISOString().split('T')[0]; }
function formatDateTH(d: Date): string { return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" }); }

export default function UserBookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // 📦 เก็บข้อมูลจากทั้ง 2 ตาราง
  const [adminSchedules, setAdminSchedules] = useState<ScheduleItem[]>([]);
  const [userBookings, setUserBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentMonday] = useState<Date>(getMonday(new Date()));
  const friday = addDays(currentMonday, 4);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<{ day: string; date: string; period: number } | null>(null);
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [purpose, setPurpose] = useState("");

  // โหลดห้องและผู้ใช้
  useEffect(() => {
    fetch(`${API}/rooms`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
          setSelectedRoom(data[0]);
        }
      });

    fetch(`${API}/users/checkuser`)
      .then(res => res.json())
      .then(data => {
        const user = Array.isArray(data) ? data[0] : data;
        if (user) {
          setCurrentUser(user);
          setPhone(user.phone || "");
          setLineId(user.lineId || "");
        }
      });
  }, []);

  // ดึงข้อมูลรวมทั้ง 2 ตารางเมื่อเลือกห้อง
  useEffect(() => {
    if (selectedRoom) fetchFullSchedule(selectedRoom.id);
  }, [selectedRoom, currentMonday]);

  const fetchFullSchedule = async (roomId: number) => {
    setIsLoading(true);
    try {
      const start = formatDateISO(currentMonday);
      const end = formatDateISO(friday);
      const res = await fetch(`${API}/bookings/room/${roomId}/full-schedule?startDate=${start}&endDate=${end}`);
      if (res.ok) {
        const data = await res.json();
        setAdminSchedules(data.schedules || []);
        setUserBookings(data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // เช็กตารางสอนประจำของ Admin
  const getAdminSchedule = (day: string, period: number) => {
    return adminSchedules.find(s => s.day === day && s.period === period);
  };

  // เช็กการจองของ User
  const getUserBooking = (dateStr: string, period: number) => {
    return userBookings.find(b => b.date === dateStr && b.period === period);
  };

  // คลิกช่องตาราง
  const handleSlotClick = (day: string, dateStr: string, period: number) => {
    if (period === 5) return; // คาบพัก

    // 🔒 1. เช็กคาบเรียนประจำของ Admin
    const adminItem = getAdminSchedule(day, period);
    if (adminItem) {
      Swal.fire({
        title: 'ติดคาบเรียนประจำ \n (ไม่สามารถจองได้)',
        html: `
          <div className="text-left text-sm space-y-1">
            <p><b>วิชา:</b> ${adminItem.subject}</p>
            <p><b>ผู้สอน:</b> ${adminItem.teacher}</p>
            <p><b>ห้องสอน:</b> ${adminItem.classroom}</p>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#6366f1',
        heightAuto: false,
      });
      return;
    }

    // 🔒 2. เช็กการจองของ User
    const bookingItem = getUserBooking(dateStr, period);
    if (bookingItem) {
      if (bookingItem.status === 'APPROVED') {
        Swal.fire({
          title: 'มีการจองและอนุมัติแล้ว',
          html: `<p class="text-sm"><b>ผู้จอง:</b> ${bookingItem.userName}</p><p class="text-sm"><b>วัตถุประสงค์:</b> ${bookingItem.purpose}</p>`,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          heightAuto: false,
        });
      } else if (bookingItem.status === 'PENDING') {
        Swal.fire({
          title: 'อยู่ระหว่างรออนุมัติ',
          html: `<p class="text-sm"><b>ผู้ขอจอง:</b> ${bookingItem.userName}</p><p class="text-sm text-amber-600 font-semibold mt-1">⏳ กำลังรอ Admin ตรวจสอบคำขอ</p>`,
          icon: 'warning',
          confirmButtonColor: '#f59e0b',
          heightAuto: false,
        });
      }
      return;
    }

    // 🟢 3. ช่องว่าง -> เปิด Modal จอง
    setTargetSlot({ day, date: dateStr, period });
    setIsModalOpen(true);
  };

  // ส่งคำขอจอง
  const handleSubmitBooking = async () => {
    if (!currentUser || !currentUser.name || !purpose.trim() || !selectedRoom || !targetSlot) {
      Swal.fire({title: "กรุณากรอกข้อมูลให้ครบถ้วน", icon: "warning", timer: 1200, showConfirmButton: false, heightAuto: false,});
      return;
    }

    try {
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          userId: Number(currentUser.id),
          userName: currentUser.name,
          userEmail: currentUser.email || undefined,
          phone: phone.trim() || undefined,
          lineId: lineId.trim() || undefined,
          day: targetSlot.day,
          date: targetSlot.date,
          period: targetSlot.period,
          purpose: purpose.trim(),
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setPurpose('');
        fetchFullSchedule(selectedRoom.id);
        Swal.fire({
          title: 'ส่งคำขอจองสำเร็จ!',
          text: 'คำขอของคุณถูกส่งเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#10b981',
          heightAuto: false,
        });
      } else {
        const errData = await res.json();
        Swal.fire({title: "เกิดข้อผิดพลาด",text: errData.message || 'ไม่สามารถจองได้', icon: "error", timer: 1200, showConfirmButton: false, heightAuto: false,});
      }
    } catch {
      Swal.fire({title: "เกิดข้อผิดพลาดในการเชื่อมต่อ", icon: "error", timer: 1200, showConfirmButton: false, heightAuto: false,});
    }
  };

  return (
    <div className="min-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-[1300px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ตารางใช้ห้องเรียน / จองห้อง</h1>
            <p className="text-sm text-slate-500 mt-1">แสดงข้อมูลตารางเรียนประจำ และ รายการจองห้อง</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">เลือกห้อง:</span>
            <select
              value={selectedRoom?.id || ''}
              onChange={(e) => {
                const r = rooms.find(item => item.id === Number(e.target.value));
                if (r) setSelectedRoom(r);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ตารางจอง */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-fixed w-full border-collapse min-w-[950px]">
              <thead>
                <tr>
                  <th className="bg-slate-800 text-white px-4 py-3 text-sm font-semibold w-28 text-center sticky left-0 z-10">วัน / คาบ</th>
                  {periods.map(p => (
                    <th key={p} className="bg-slate-800 text-white px-2 py-3 text-center text-xs font-semibold min-w-[95px]">
                      <div>คาบ {p}</div>
                      {p === 5 && <div className="text-[10px] text-amber-300 font-normal">พักกลางวัน</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-slate-100">
                      <td className="p-4 bg-slate-100"></td>
                      {periods.map(p => <td key={p} className="p-2"><div className="h-12 bg-slate-100 rounded-lg"></div></td>)}
                    </tr>
                  ))
                ) : (
                  days.map((day, dayIdx) => {
                    const dateObj = addDays(currentMonday, dayIdx);
                    const dateStr = formatDateISO(dateObj);

                    return (
                      <tr key={day} className="border-b border-slate-100 last:border-b-0">
                        <td className="bg-slate-700 text-white px-3 py-3 text-center font-semibold text-xs sticky left-0 z-10">
                          <div>{day}</div>
                          <div className="text-[10px] text-slate-300 font-normal mt-0.5">{formatDateTH(dateObj)}</div>
                        </td>

                        {periods.map(p => {
                          const adminItem = getAdminSchedule(day, p);
                          const bookingItem = getUserBooking(dateStr, p);
                          const isLunch = p === 5;

                          let bgStyle = "bg-emerald-50/60 hover:bg-emerald-100 border-emerald-200/80 text-emerald-800 cursor-pointer";
                          let titleText = "🟢 ว่าง";
                          let subText = "คลิกจอง";

                          if (isLunch) {
                            bgStyle = "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed";
                            titleText = "พัก";
                            subText = "";
                          } 
                          // 📚 1. คาบเรียนประจำจาก Admin
                          else if (adminItem) {
                            bgStyle = "bg-indigo-100/80 border-indigo-300 text-indigo-900 cursor-pointer hover:bg-indigo-200";
                            titleText = `📚 ${adminItem.subject}`;
                            subText = adminItem.teacher;
                          } 
                          // 🔴 2. จองและอนุมัติแล้ว
                          else if (bookingItem?.status === 'APPROVED') {
                            bgStyle = "bg-rose-100 border-rose-300 text-rose-800 cursor-pointer hover:bg-rose-200";
                            titleText = `🔴 ${bookingItem.userName}`;
                            subText = bookingItem.purpose;
                          } 
                          // 🟡 3. รออนุมัติ
                          else if (bookingItem?.status === 'PENDING') {
                            bgStyle = "bg-amber-100 border-amber-300 text-amber-800 cursor-pointer hover:bg-amber-200";
                            titleText = `🟡 รออนุมัติ`;
                            subText = bookingItem.userName;
                          }

                          return (
                            <td key={p} onClick={() => handleSlotClick(day, dateStr, p)} className="p-1.5 text-center">
                              <div className={`h-18 rounded-xl border p-1 flex flex-col items-center justify-center transition-all duration-150 shadow-2xs ${bgStyle}`}>
                                <span className="font-bold text-xs truncate w-full">{titleText}</span>
                                {subText && <span className="text-[15px] opacity-80 truncate w-full mt-0.5">{subText}</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal จอง */}
        {isModalOpen && targetSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-emerald-600 px-6 py-4 text-white">
                <h3 className="font-bold text-lg">📝 ส่งคำขอจองห้อง</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  ห้อง: {selectedRoom?.name} | วัน{targetSlot.day} | คาบที่ {targetSlot.period}
                </p>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้ขอจอง (บัญชีปัจจุบัน)</label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-semibold text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                      </div>
                      <span>{currentUser?.name || 'กำลังดึงข้อมูล...'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>🔔</span> ข้อมูลสำหรับรับการแจ้งเตือน
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">📱 เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812345678"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">💬 Line ID</label>
                    <input
                      type="text"
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                      placeholder="@somchai"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วัตถุประสงค์ในการใช้ห้อง <span className="text-rose-500">*</span></label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="เช่น สอนชดเชย, ประชุมกลุ่ม"
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  ></textarea>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200">
                  ยกเลิก
                </button>
                <button onClick={handleSubmitBooking} className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
                  ส่งคำขอจอง
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}