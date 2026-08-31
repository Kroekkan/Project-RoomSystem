'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface Booking {
  id: number;
  roomId: number;
  room?: { name: string };
  userId?: number | null;
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
  checkInTime?: string | null;
  checkOutTime?: string | null;
}

interface Room {
  id: number;
  name: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

function formatTimeTH(dateTime?: string | null) {
  if (!dateTime) return '-';

  return new Date(dateTime).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  });
}

function formatBookingDate(date: string) {
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function shortenLineId(lineId?: string) {
  if (!lineId) return '-';
  if (lineId.length <= 20) return lineId;

  return `${lineId.slice(0, 10)}...${lineId.slice(-7)}`;
}

function escapeHtml(value?: string | number | null) {
  return String(value ?? '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStatusInfo(status: Booking['status']) {
  const statusMap = {
    PENDING: {
      text: 'รออนุมัติ',
      icon: '⏳',
      bg: '#fef3c7',
      color: '#92400e',
      border: '#fcd34d',
    },
    APPROVED: {
      text: 'อนุมัติแล้ว',
      icon: '✅',
      bg: '#d1fae5',
      color: '#047857',
      border: '#6ee7b7',
    },
    REJECTED: {
      text: 'ปฏิเสธแล้ว',
      icon: '❌',
      bg: '#ffe4e6',
      color: '#be123c',
      border: '#fda4af',
    },
    CANCELLED: {
      text: 'ยกเลิกแล้ว',
      icon: '🚫',
      bg: '#f1f5f9',
      color: '#475569',
      border: '#cbd5e1',
    },
  };

  return statusMap[status];
}

export default function AdminBookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchBookings();

    const interval = window.setInterval(() => {
      fetchBookings(false);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API}/rooms`);

      if (res.ok) {
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
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
      console.error('Fetch bookings error:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    newStatus: 'APPROVED' | 'REJECTED',
    userName: string,
  ) => {
    const actionText = newStatus === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ';
    const confirmColor = newStatus === 'APPROVED' ? '#059669' : '#ef4444';

    const result = await Swal.fire({
      title: `ยืนยันการ${actionText}?`,
      text: `ต้องการ${actionText}คำขอจองของ ${userName} ใช่หรือไม่`,
      icon: newStatus === 'APPROVED' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#64748b',
      confirmButtonText: `ยืนยัน${actionText}`,
      cancelButtonText: 'ยกเลิก',
      heightAuto: false,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === id
              ? { ...booking, status: newStatus }
              : booking,
          ),
        );

        Swal.fire({
          title: `${actionText}คำขอเรียบร้อย`,
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
          heightAuto: false,
        });
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          icon: 'error',
          heightAuto: false,
        });
      }
    } catch (err) {
      console.error(err);

      Swal.fire({
        title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        icon: 'error',
        heightAuto: false,
      });
    }
  };

  const handleDeleteBooking = async (id: number) => {
    const result = await Swal.fire({
      title: 'ลบรายการจองนี้?',
      text: 'รายการจองนี้จะถูกลบออกจากระบบอย่างถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      heightAuto: false,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/bookings/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBookings((prev) => prev.filter((booking) => booking.id !== id));

        Swal.fire({
          title: 'ลบรายการสำเร็จ',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
          heightAuto: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewBookingDetails = (booking: Booking) => {
    const status = getStatusInfo(booking.status);
    const roomName = booking.room?.name || `ห้อง ID: ${booking.roomId}`;

    Swal.fire({
      width: 620,
      padding: 0,
      showConfirmButton: false,
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#059669',
      buttonsStyling: true,
      heightAuto: false,
      background: 'transparent',
      didOpen: () => {
        const popup = Swal.getPopup();
        const htmlContainer = Swal.getHtmlContainer();

        if (popup) {
          popup.style.padding = '0';
          popup.style.background = 'transparent';
          popup.style.boxShadow = 'none';
          popup.style.overflow = 'visible';
        }

        if (htmlContainer) {
          htmlContainer.style.margin = '0';
          htmlContainer.style.padding = '0';
        }

        document
          .getElementById('close-booking-detail')
          ?.addEventListener('click', () => Swal.close());
      },
      html: `
        <div style="overflow:hidden; border-radius:28px; background:white; text-align:left; font-family:inherit; box-shadow:0 22px 55px rgba(15,23,42,.28);">
          <div style="background:linear-gradient(135deg, #059669, #10b981); color:white; padding:26px 30px 22px;">
            <div style="font-size:22px; font-weight:800; margin-bottom:7px;">
              📋 รายละเอียดการจองห้อง
            </div>
            <div style="font-size:14px; opacity:.92;">
              ห้อง: ${escapeHtml(roomName)} | ${escapeHtml(
                booking.day,
              )} ${escapeHtml(formatBookingDate(booking.date))} | คาบ ${escapeHtml(
                booking.period,
              )}
            </div>
          </div>

          <div style="padding:24px 30px 10px;">
            <div style="font-size:13px; font-weight:800; color:#475569; margin-bottom:8px;">
              ผู้ขอจอง
            </div>

            <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:14px 16px; margin-bottom:20px;">
              <div style="width:38px; height:38px; border-radius:50%; background:#059669; color:white; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800;">
                ${escapeHtml(booking.userName?.charAt(0) || 'U')}
              </div>

              <div>
                <div style="font-size:15px; font-weight:800; color:#1e293b;">
                  ${escapeHtml(booking.userName)}
                </div>
                <div style="font-size:12px; color:#64748b; margin-top:2px;">
                  ${escapeHtml(booking.userEmail || 'ไม่มีอีเมล')}
                </div>
              </div>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:17px; margin-bottom:18px;">
              <div style="font-size:13px; font-weight:800; color:#334155; margin-bottom:12px;">
                🏫 ข้อมูลการจอง
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px;">
                <div>
                  <div style="color:#94a3b8; margin-bottom:3px;">ห้องเรียน</div>
                  <div style="font-weight:700; color:#1e293b;">${escapeHtml(roomName)}</div>
                </div>

                <div>
                  <div style="color:#94a3b8; margin-bottom:3px;">สถานะ</div>
                  <div style="font-weight:700; color:${status.color};">
                    ${status.icon} ${status.text}
                  </div>
                </div>

                <div>
                  <div style="color:#94a3b8; margin-bottom:3px;">วันและวันที่</div>
                  <div style="font-weight:700; color:#1e293b;">
                    ${escapeHtml(booking.day)} ${escapeHtml(
                      formatBookingDate(booking.date),
                    )}
                  </div>
                </div>

                <div>
                  <div style="color:#94a3b8; margin-bottom:3px;">คาบเรียน</div>
                  <div style="font-weight:700; color:#1e293b;">คาบ ${escapeHtml(
                    booking.period,
                  )}</div>
                </div>

                <div>
                  <div style="color:#94a3b8; margin-bottom:3px;">เวลาเข้าห้อง</div>
                  <div style="font-weight:700; color:#059669;">↪ ${escapeHtml(
                    formatTimeTH(booking.checkInTime),
                  )}</div>
                </div>

                <div>
                  <div style="color:#94a3b8; margin-bottom:3px;">เวลาออกห้อง</div>
                  <div style="font-weight:700; color:#e11d48;">↩ ${escapeHtml(
                    formatTimeTH(booking.checkOutTime),
                  )}</div>
                </div>
              </div>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:17px; margin-bottom:18px;">
              <div style="font-size:13px; font-weight:800; color:#334155; margin-bottom:12px;">
                🔔 ข้อมูลติดต่อ
              </div>

              <div style="font-size:13px; color:#334155; line-height:1.9;">
                <div>📱 เบอร์โทรศัพท์: <strong>${escapeHtml(
                  booking.phone || '-',
                )}</strong></div>
                <div style="word-break:break-all;">💬 LINE User ID: <strong>${escapeHtml(
                  booking.lineId || '-',
                )}</strong></div>
              </div>
            </div>

            <div style="margin-bottom:10px;">
              <div style="font-size:13px; font-weight:800; color:#334155; margin-bottom:8px;">
                วัตถุประสงค์การใช้ห้อง
              </div>

              <div style="white-space:pre-wrap; word-break:break-word; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:14px 16px; color:#334155; font-size:14px; line-height:1.7;">
                ${escapeHtml(booking.purpose || '-')}
              </div>

              <div style="display:flex; justify-content:center; padding:12px 15px 12px;">
                <button
                  id="close-booking-detail"
                  style="border:0; border-radius:14px; padding:11px 26px; background:#059669; color:white; font-size:14px; font-weight:800; cursor:pointer;"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      `,
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    if (
      selectedStatusTab !== 'ALL' &&
      booking.status !== selectedStatusTab
    ) {
      return false;
    }

    if (
      selectedRoomFilter !== 'ALL' &&
      booking.roomId !== Number(selectedRoomFilter)
    ) {
      return false;
    }

    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      booking.userName?.toLowerCase().includes(query) ||
      booking.purpose?.toLowerCase().includes(query) ||
      booking.phone?.toLowerCase().includes(query) ||
      booking.lineId?.toLowerCase().includes(query)
    );
  });

  const pendingCount = bookings.filter(
    (booking) => booking.status === 'PENDING',
  ).length;

  const approvedCount = bookings.filter(
    (booking) => booking.status === 'APPROVED',
  ).length;

  const rejectedCount = bookings.filter(
    (booking) => booking.status === 'REJECTED',
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === 'CANCELLED',
  ).length;

  return (
    <div className="min-h-screen bg-app-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              จัดการคำขอจองห้อง
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              อนุมัติ ปฏิเสธ และตรวจสอบประวัติการใช้งานห้องเรียน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="🔍 ค้นชื่อ, วัตถุประสงค์, เบอร์..."
              className="min-w-[220px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <select
              value={selectedRoomFilter}
              onChange={(event) =>
                setSelectedRoomFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="ALL">ทุกห้อง</option>

              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatusTab('ALL')}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedStatusTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({bookings.length})
            </button>

            <button
              onClick={() => setSelectedStatusTab('PENDING')}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedStatusTab === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⏳ รออนุมัติ ({pendingCount})
            </button>

            <button
              onClick={() => setSelectedStatusTab('APPROVED')}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedStatusTab === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ✅ อนุมัติแล้ว ({approvedCount})
            </button>

            <button
              onClick={() => setSelectedStatusTab('REJECTED')}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedStatusTab === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ❌ ปฏิเสธแล้ว ({rejectedCount})
            </button>

            <button
              onClick={() => setSelectedStatusTab('CANCELLED')}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedStatusTab === 'CANCELLED'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🚫 ยกเลิกแล้ว ({cancelledCount})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            แสดง {filteredBookings.length} รายการ
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-800 text-xs font-bold tracking-wider text-white">
                  <th className="px-5 py-4">ผู้ขอจอง</th>
                  <th className="px-5 py-4">ห้อง / วัน / คาบ</th>
                  <th className="px-5 py-4 text-center">รายละเอียด</th>
                  <th className="px-5 py-4">ช่องทางติดต่อ</th>
                  <th className="px-5 py-4 text-center">สถานะ</th>
                  <th className="px-5 py-4 text-center">เวลาเข้า / ออก</th>
                  <th className="px-5 py-4 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  [...Array(4)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      {[...Array(7)].map((__, columnIndex) => (
                        <td key={columnIndex} className="p-5">
                          <div className="h-7 rounded-lg bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-slate-400"
                    >
                      <div className="mb-2 text-4xl">📭</div>
                      <p className="text-base font-semibold">
                        ไม่พบรายการคำขอจองในหมวดหมู่นี้
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((item) => {
                    const status = getStatusInfo(item.status);

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-[190px] items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                              {item.userName?.charAt(0) || 'U'}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate font-bold text-slate-800">
                                {item.userName}
                              </div>
                              <div
                                className="max-w-[170px] truncate text-xs text-slate-400"
                                title={item.userEmail}
                              >
                                {item.userEmail || '-'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-indigo-700">
                            {item.room?.name || `ห้อง ID: ${item.roomId}`}
                          </div>

                          <div className="mt-1 text-xs text-slate-600">
                            {item.day} {formatBookingDate(item.date)}
                            <br />
                            <span className="mx-1 text-slate-300">|</span>
                            <span className="font-semibold text-slate-800">
                              คาบที่ {item.period}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleViewBookingDetails(item)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c-1.38 3.22-4.37 5.5-8 5.5S6.38 15.22 5 12c1.38-3.22 4.37-5.5 8-5.5s6.62 2.28 8 5.5z"
                              />
                            </svg>
                            ดูรายละเอียด
                          </button>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-600">
                          <div className="space-y-1.5">
                            <div className="whitespace-nowrap">
                              📱 {item.phone || '-'}
                            </div>

                            <div
                              className="max-w-[100px] truncate"
                              title={item.lineId}
                            >
                              💬 {shortenLineId(item.lineId)}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold"
                            style={{
                              backgroundColor: status.bg,
                              color: status.color,
                              borderColor: status.border,
                            }}
                          >
                            {status.icon} {status.text}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex min-w-[100px] flex-col items-start gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                            <span className="whitespace-nowrap font-semibold text-emerald-600">
                              ↪ เข้า: {formatTimeTH(item.checkInTime)}
                            </span>

                            <span className="whitespace-nowrap font-semibold text-rose-500">
                              ↩ ออก: {formatTimeTH(item.checkOutTime)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      item.id,
                                      'APPROVED',
                                      item.userName,
                                    )
                                  }
                                  className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                                >
                                  อนุมัติ
                                </button>

                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      item.id,
                                      'REJECTED',
                                      item.userName,
                                    )
                                  }
                                  className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
                                >
                                  ปฏิเสธ
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeleteBooking(item.id)}
                                className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                title="ลบคำขอ"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6m4-6V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}