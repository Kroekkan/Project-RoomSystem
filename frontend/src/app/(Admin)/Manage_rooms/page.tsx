'use client'

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Booking {
  id: number;
  roomId: number;
  room?: { name: string };
  userId?: number;
  userName: string;
  userEmail?: string;
  phone?: string;
  lineId?: string;
  day: string;
  date: string;
  period: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

interface Room {
  id: number;
  name: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminBookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ตัวกรอง
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("ALL");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchRooms();
    fetchBookings();

    // 🟢 เพิ่ม Auto Refresh แอบดึงข้อมูลใหม่ทุกๆ 5 วินาที
    const interval = setInterval(() => {
      fetchBookings(false); // false = ไม่ต้องขึ้นตัวหมุนโหลดชั่วคราว
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API}/rooms`);
      if (res.ok) {
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch rooms error:", err);
    }
  };

  const fetchBookings = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      let res = await fetch(`${API}/bookings`);
      
      if (!res.ok) {
        res = await fetch(`${API}/bookings/pending`);
      }

      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: 'APPROVED' | 'REJECTED', userName: string) => {
    const actionText = newStatus === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ';
    const confirmColor = newStatus === 'APPROVED' ? '#10b981' : '#ef4444';

    const result = await Swal.fire({
      title: `ยืนยันการ ${actionText}?`,
      text: `ต้องการ${actionText} คำขอจองของคุณ ${userName} ใช่หรือไม่`,
      icon: newStatus === 'APPROVED' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6b7280',
      confirmButtonText: `ยืนยัน${actionText}`,
      cancelButtonText: 'ยกเลิก',
      heightAuto: false,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API}/bookings/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
          setBookings(prev =>
            prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
          );
          Swal.fire({
            title: `${actionText}คำขอเรียบร้อย!`,
            icon: 'success',
            timer: 1200,
            showConfirmButton: false,
            heightAuto: false,
          });
        } else {
          Swal.fire({ title: 'เกิดข้อผิดพลาด', icon: 'error', heightAuto: false });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({ title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', icon: 'error', heightAuto: false });
      }
    }
  };

  const handleDeleteBooking = async (id: number) => {
    const result = await Swal.fire({
      title: 'ลบรายการจองนี้?',
      text: 'รายการจองนี้จะถูกลบออกจากระบบอย่างถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      heightAuto: false,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API}/bookings/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setBookings(prev => prev.filter(b => b.id !== id));
          Swal.fire({ title: 'ลบรายการสำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false, heightAuto: false });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (selectedStatusTab !== "ALL" && b.status !== selectedStatusTab) return false;
    if (selectedRoomFilter !== "ALL" && b.roomId !== Number(selectedRoomFilter)) return false;

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = b.userName?.toLowerCase().includes(q);
      const matchPurpose = b.purpose?.toLowerCase().includes(q);
      const matchPhone = b.phone?.toLowerCase().includes(q);
      const matchLine = b.lineId?.toLowerCase().includes(q);
      return matchName || matchPurpose || matchPhone || matchLine;
    }

    return true;
  });

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
  const rejectedCount = bookings.filter(b => b.status === 'REJECTED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length; // 🟢 นับจำนวนรายการที่ยกเลิกแล้ว

  const handleViewFullPurpose = (userName: string, purpose: string) => {
    Swal.fire({
      title: 'วัตถุประสงค์การจอง',
      html: `
        <div style="text-align:left; font-size:14px; line-height:1.6;">
          <p style="color:#64748b; font-size:12px; margin-bottom:8px;">ผู้ขอจอง: <strong>${userName}</strong></p>
          <p style="white-space:pre-wrap; word-break:break-word;">${purpose || '-'}</p>
        </div>
      `,
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#4f46e5',
      heightAuto: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">จัดการคำขอจองห้อง (Admin)</h1>
            <p className="text-sm text-slate-500 mt-1">อนุมัติ ปฏิเสธ หรือตรวจสอบคำขอใช้ห้องเรียนจากผู้ใช้งาน</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ค้นชื่อ, วัตถุประสงค์, เบอร์..."
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 min-w-[220px]"
            />

            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="ALL">ทุกห้อง</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStatusTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatusTab === "ALL"
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({bookings.length})
            </button>

            <button
              onClick={() => setSelectedStatusTab("PENDING")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === "PENDING"
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⏳ รออนุมัติ
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white text-amber-600 font-extrabold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedStatusTab("APPROVED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === "APPROVED"
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ✅ อนุมัติแล้ว ({approvedCount})
            </button>

            <button
              onClick={() => setSelectedStatusTab("REJECTED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === "REJECTED"
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ❌ ปฏิเสธแล้ว ({rejectedCount})
            </button>

            {/* 🟢 เพิ่มปุ่มแท็บกรองสถานะ ยกเลิกแล้ว */}
            <button
              onClick={() => setSelectedStatusTab("CANCELLED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatusTab === "CANCELLED"
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🚫 ยกเลิกแล้ว ({cancelledCount})
            </button>
          </div>

          <div className="text-xs text-slate-400">
            แสดง {filteredBookings.length} รายการ
          </div>
        </div>

        {/* ตารางข้อมูล */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-4">ผู้ขอจอง</th>
                  <th className="px-5 py-4">ห้อง & เวลาเรียน</th>
                  <th className="px-5 py-4">วัตถุประสงค์</th>
                  <th className="px-5 py-4">ช่องทางติดต่อ</th>
                  <th className="px-5 py-4 text-center">สถานะ</th>
                  <th className="px-5 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-32"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-40"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-48"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-28"></div></td>
                      <td className="p-5"><div className="h-6 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                      <td className="p-5"><div className="h-8 bg-slate-100 rounded-xl w-24 mx-auto"></div></td>
                    </tr>
                  ))
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="font-semibold text-base">ไม่พบรายการคำขอจองในหมวดหมู่นี้</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                            {item.userName ? item.userName.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{item.userName}</div>
                            {item.userEmail && <div className="text-xs text-slate-400">{item.userEmail}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-indigo-700">{item.room?.name || `ห้อง ID: ${item.roomId}`}</div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          วัน{item.day}ที่ {item.date} | <span className="font-semibold text-slate-800">คาบที่ {item.period}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-700 max-w-[140px]">
                        <div className="flex items-center gap-2">
                          {item.purpose && item.purpose.length > 25 && (
                            <button
                              onClick={() => handleViewFullPurpose(item.userName, item.purpose)}
                              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                            >
                              ดูวัตถุประสงค์
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 space-y-0.5">
                        {item.phone && <div>📱 {item.phone}</div>}
                        {item.lineId && <div>💬 {item.lineId}</div>}
                        {!item.phone && !item.lineId && <span className="text-slate-400">-</span>}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {item.status === 'PENDING' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ⏳ รออนุมัติ
                          </span>
                        )}
                        {item.status === 'APPROVED' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✅ อนุมัติแล้ว
                          </span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            ❌ ปฏิเสธแล้ว
                          </span>
                        )}
                        {/* 🟢 เพิ่มป้ายแสดงสถานะ ยกเลิกแล้ว (จาก LINE หรือเว็บ) */}
                        {item.status === 'CANCELLED' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            🚫 ยกเลิกแล้ว
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'APPROVED', item.userName)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                              >
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'REJECTED', item.userName)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                              >
                                ปฏิเสธ
                              </button>
                            </>
                          )}

                          {item.status !== 'PENDING' && (
                            <button
                              onClick={() => handleDeleteBooking(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="ลบคำขอ"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}