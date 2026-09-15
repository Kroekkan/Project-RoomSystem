'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Swal from 'sweetalert2';

interface Booking {
  id: number;
  roomId: number;
  room?: { name: string; building?: string; category?: string };
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

// 🟢 เพิ่ม building และ category ใน Room
interface Room {
  id: number;
  name: string;
  building?: string;
  category?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;
const ITEMS_PER_PAGE = 10;

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
    PENDING:   { text: 'รออนุมัติ',   icon: '⏳', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
    APPROVED:  { text: 'อนุมัติแล้ว', icon: '✅', bg: '#d1fae5', color: '#047857', border: '#6ee7b7' },
    REJECTED:  { text: 'ปฏิเสธแล้ว', icon: '❌', bg: '#ffe4e6', color: '#be123c', border: '#fda4af' },
    CANCELLED: { text: 'ยกเลิกแล้ว', icon: '🚫', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  };
  return statusMap[status];
}

export default function AdminBookingManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 🟢 State ตัวกรอง อาคาร → หมวดหมู่ห้อง → ห้อง (Cascade)
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');
  const [selectedRoomCategory, setSelectedRoomCategory] = useState('ALL');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');

  const prevPendingCountRef = useRef<number | null>(null);

  useEffect(() => {
    fetchRooms();
    fetchBookings(true);

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
      if (!res.ok) res = await fetch(`${API}/bookings/pending`);

      if (res.ok) {
        const data: Booking[] = await res.json();
        const bookingList = Array.isArray(data) ? data : [];
        setBookings(bookingList);

        const currentPendingCount = bookingList.filter((b) => b.status === 'PENDING').length;

        if (prevPendingCountRef.current !== null && currentPendingCount > prevPendingCountRef.current) {
          playNotificationSound();
        }

        prevPendingCountRef.current = currentPendingCount;
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // =========================================================
  // 🟢 รายการอาคารทั้งหมด (unique)
  // =========================================================
  const buildings = useMemo(() => {
    return Array.from(
      new Set(rooms.map((r) => r.building).filter(Boolean) as string[])
    ).sort();
  }, [rooms]);

  // =========================================================
  // 🟢 รายการหมวดหมู่ห้อง กรองตามอาคาร
  // =========================================================
  const roomCategories = useMemo(() => {
    const filtered = selectedBuilding !== 'ALL'
      ? rooms.filter((r) => r.building === selectedBuilding)
      : rooms;

    return Array.from(
      new Set(filtered.map((r) => r.category).filter(Boolean) as string[])
    ).sort();
  }, [rooms, selectedBuilding]);

  // =========================================================
  // 🟢 รายการห้อง กรองตามอาคาร + หมวดหมู่
  // =========================================================
  const availableRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchBuilding = selectedBuilding === 'ALL' || r.building === selectedBuilding;
      const matchCategory = selectedRoomCategory === 'ALL' || r.category === selectedRoomCategory;
      return matchBuilding && matchCategory;
    });
  }, [rooms, selectedBuilding, selectedRoomCategory]);

  // =========================================================
  // 🟢 Handler เปลี่ยนอาคาร → Reset หมวดหมู่ + ห้อง
  // =========================================================
  const handleBuildingChange = (val: string) => {
    setSelectedBuilding(val);
    setSelectedRoomCategory('ALL');
    setSelectedRoomFilter('ALL');
    setCurrentPage(1);
  };

  // 🟢 Handler เปลี่ยนหมวดหมู่ห้อง → Reset ห้อง
  const handleRoomCategoryChange = (val: string) => {
    setSelectedRoomCategory(val);
    setSelectedRoomFilter('ALL');
    setCurrentPage(1);
  };

  const handleRoomFilterChange = (val: string) => {
    setSelectedRoomFilter(val);
    setCurrentPage(1);
  };

  const handleStatusTabChange = (tab: string) => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (id: number, newStatus: 'APPROVED' | 'REJECTED', userName: string) => {
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
        setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
        Swal.fire({ title: `${actionText}คำขอเรียบร้อย`, icon: 'success', timer: 1200, showConfirmButton: false, heightAuto: false });
      } else {
        Swal.fire({ title: 'เกิดข้อผิดพลาด', icon: 'error', heightAuto: false });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', icon: 'error', heightAuto: false });
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
      const res = await fetch(`${API}/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        Swal.fire({ title: 'ลบรายการสำเร็จ', icon: 'success', timer: 1200, showConfirmButton: false, heightAuto: false });
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
      heightAuto: false,
      background: 'transparent',
      didOpen: () => {
        const popup = Swal.getPopup();
        const htmlContainer = Swal.getHtmlContainer();
        if (popup) { popup.style.padding = '0'; popup.style.background = 'transparent'; popup.style.boxShadow = 'none'; popup.style.overflow = 'visible'; }
        if (htmlContainer) { htmlContainer.style.margin = '0'; htmlContainer.style.padding = '0'; }
        document.getElementById('close-booking-detail')?.addEventListener('click', () => Swal.close());
      },
      html: `
        <div style="overflow:hidden; border-radius:28px; background:white; text-align:left; font-family:inherit; box-shadow:0 22px 55px rgba(15,23,42,.28);">
          <div style="background:linear-gradient(135deg, #059669, #10b981); color:white; padding:26px 30px 22px;">
            <div style="font-size:22px; font-weight:800; margin-bottom:7px;">📋 รายละเอียดการจองห้อง</div>
            <div style="font-size:14px; opacity:.92;">ห้อง: ${escapeHtml(roomName)} | ${escapeHtml(booking.day)} ${escapeHtml(formatBookingDate(booking.date))} | คาบ ${escapeHtml(booking.period)}</div>
          </div>
          <div style="padding:24px 30px 10px;">
            <div style="font-size:13px; font-weight:800; color:#475569; margin-bottom:8px;">ผู้ขอจอง</div>
            <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:14px 16px; margin-bottom:20px;">
              <div style="width:38px; height:38px; border-radius:50%; background:#059669; color:white; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800;">${escapeHtml(booking.userName?.charAt(0) || 'U')}</div>
              <div>
                <div style="font-size:15px; font-weight:800; color:#1e293b;">${escapeHtml(booking.userName)}</div>
                <div style="font-size:12px; color:#64748b; margin-top:2px;">${escapeHtml(booking.userEmail || 'ไม่มีอีเมล')}</div>
              </div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:17px; margin-bottom:18px;">
              <div style="font-size:13px; font-weight:800; color:#334155; margin-bottom:12px;">🏫 ข้อมูลการจอง</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px;">
                <div><div style="color:#94a3b8; margin-bottom:3px;">ห้องเรียน</div><div style="font-weight:700; color:#1e293b;">${escapeHtml(roomName)}</div></div>
                <div><div style="color:#94a3b8; margin-bottom:3px;">สถานะ</div><div style="font-weight:700; color:${status.color};">${status.icon} ${status.text}</div></div>
                <div><div style="color:#94a3b8; margin-bottom:3px;">วันและวันที่</div><div style="font-weight:700; color:#1e293b;">${escapeHtml(booking.day)} ${escapeHtml(formatBookingDate(booking.date))}</div></div>
                <div><div style="color:#94a3b8; margin-bottom:3px;">คาบเรียน</div><div style="font-weight:700; color:#1e293b;">คาบ ${escapeHtml(booking.period)}</div></div>
                <div><div style="color:#94a3b8; margin-bottom:3px;">เวลาเข้าห้อง</div><div style="font-weight:700; color:#059669;">↪ ${escapeHtml(formatTimeTH(booking.checkInTime))}</div></div>
                <div><div style="color:#94a3b8; margin-bottom:3px;">เวลาออกห้อง</div><div style="font-weight:700; color:#e11d48;">↩ ${escapeHtml(formatTimeTH(booking.checkOutTime))}</div></div>
              </div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:17px; margin-bottom:18px;">
              <div style="font-size:13px; font-weight:800; color:#334155; margin-bottom:12px;">🔔 ข้อมูลติดต่อ</div>
              <div style="font-size:13px; color:#334155; line-height:1.9;">
                <div>📱 เบอร์โทรศัพท์: <strong>${escapeHtml(booking.phone || '-')}</strong></div>
                <div style="word-break:break-all;">💬 LINE User ID: <strong>${escapeHtml(booking.lineId || '-')}</strong></div>
              </div>
            </div>
            <div style="margin-bottom:10px;">
              <div style="font-size:13px; font-weight:800; color:#334155; margin-bottom:8px;">วัตถุประสงค์การใช้ห้อง</div>
              <div style="white-space:pre-wrap; word-break:break-word; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:14px 16px; color:#334155; font-size:14px; line-height:1.7;">${escapeHtml(booking.purpose || '-')}</div>
              <div style="display:flex; justify-content:center; padding:12px 15px 12px;">
                <button id="close-booking-detail" style="border:0; border-radius:14px; padding:11px 26px; background:#059669; color:white; font-size:14px; font-weight:800; cursor:pointer;">ปิด</button>
              </div>
            </div>
          </div>
        </div>
      `,
    });
  };

  // =========================================================
  // 🟢 Filter รายการจองตาม อาคาร, หมวดหมู่, ห้อง, แท็บสถานะ, ค้นหา
  // =========================================================
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // กรองสถานะ
      if (selectedStatusTab !== 'ALL' && booking.status !== selectedStatusTab) return false;

      // กรองตามอาคาร (cross-reference กับ rooms)
      if (selectedBuilding !== 'ALL') {
        const room = rooms.find((r) => r.id === booking.roomId);
        if (!room || room.building !== selectedBuilding) return false;
      }

      // กรองตามหมวดหมู่ห้อง
      if (selectedRoomCategory !== 'ALL') {
        const room = rooms.find((r) => r.id === booking.roomId);
        if (!room || room.category !== selectedRoomCategory) return false;
      }

      // กรองตามห้อง
      if (selectedRoomFilter !== 'ALL' && booking.roomId !== Number(selectedRoomFilter)) return false;

      // ค้นหา
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      return (
        booking.userName?.toLowerCase().includes(query) ||
        booking.purpose?.toLowerCase().includes(query) ||
        booking.phone?.toLowerCase().includes(query) ||
        booking.lineId?.toLowerCase().includes(query)
      );
    });
  }, [bookings, selectedStatusTab, selectedBuilding, selectedRoomCategory, selectedRoomFilter, searchQuery, rooms]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const pendingCount   = bookings.filter((b) => b.status === 'PENDING').length;
  const approvedCount  = bookings.filter((b) => b.status === 'APPROVED').length;
  const rejectedCount  = bookings.filter((b) => b.status === 'REJECTED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  // ตรวจสอบว่ามีตัวกรองใดเปิดอยู่หรือไม่ (สำหรับแสดงปุ่ม Reset)
  const hasActiveFilter =
    selectedBuilding !== 'ALL' || selectedRoomCategory !== 'ALL' || selectedRoomFilter !== 'ALL';

  const resetAllFilters = () => {
    setSelectedBuilding('ALL');
    setSelectedRoomCategory('ALL');
    setSelectedRoomFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-app-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">จัดการคำขอจองห้อง</h1>
              <p className="mt-1 text-sm text-slate-500">อนุมัติ ปฏิเสธ และตรวจสอบประวัติการใช้งานห้องเรียน</p>
            </div>

            {/* 🔔 ไอคอนกระดิ่ง */}
            <button
              onClick={() => handleStatusTabChange('PENDING')}
              title={`มีคำขอรออนุมัติ ${pendingCount} รายการ`}
              className="relative p-2.5 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-200 hover:border-amber-200 transition-all cursor-pointer shrink-0"
            >
              <svg className={`w-6 h-6 ${pendingCount > 0 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-rose-500 text-white text-xs font-extrabold rounded-full ring-2 ring-white shadow-sm animate-pulse">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </button>
          </div>

                    <div className="flex flex-wrap items-center gap-2">
            {/* ช่องค้นหา */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="🔍 ค้นชื่อ, วัตถุประสงค์, เบอร์..."
              className="min-w-[200px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />

            {/* 🟢 ตัวกรอง อาคาร */}
            <select
              value={selectedBuilding}
              onChange={(e) => handleBuildingChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="ALL">🏢 ทุกอาคาร</option>
              {buildings.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* 🟢 ตัวกรอง หมวดหมู่ห้อง */}
            <select
              value={selectedRoomCategory}
              onChange={(e) => handleRoomCategoryChange(e.target.value)}
              disabled={roomCategories.length === 0}
              className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                roomCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="ALL">📂 ทุกหมวดหมู่</option>
              {roomCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* 🟢 ตัวกรอง ห้อง */}
            <select
              value={selectedRoomFilter}
              onChange={(e) => handleRoomFilterChange(e.target.value)}
              disabled={availableRooms.length === 0}
              className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                availableRooms.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="ALL">🚪 ทุกห้อง</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* ปุ่ม Reset ตัวกรอง */}
            {hasActiveFilter && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                ✕ ล้าง
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            STATUS FILTER TABS
        ===================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ALL',       label: `ทั้งหมด (${bookings.length})`,          cls: 'bg-indigo-600' },
              { key: 'PENDING',   label: `⏳ รออนุมัติ (${pendingCount})`,         cls: 'bg-amber-500' },
              { key: 'APPROVED',  label: `✅ อนุมัติแล้ว (${approvedCount})`,      cls: 'bg-emerald-600' },
              { key: 'REJECTED',  label: `❌ ปฏิเสธแล้ว (${rejectedCount})`,       cls: 'bg-rose-600' },
              { key: 'CANCELLED', label: `🚫 ยกเลิกแล้ว (${cancelledCount})`,      cls: 'bg-slate-700' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusTabChange(tab.key)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  selectedStatusTab === tab.key
                    ? `${tab.cls} text-white shadow-sm`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">
            แสดง {filteredBookings.length} รายการ (หน้าละ {ITEMS_PER_PAGE} รายการ)
          </span>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}
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
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((__, ci) => (
                        <td key={ci} className="p-5"><div className="h-7 rounded-lg bg-slate-100" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      <div className="mb-2 text-4xl">📭</div>
                      <p className="text-base font-semibold">ไม่พบรายการคำขอจองในหมวดหมู่นี้</p>
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((item) => {
                    const status = getStatusInfo(item.status);

                    return (
                      <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-5 py-4">
                          <div className="flex min-w-[190px] items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                              {item.userName?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-bold text-slate-800">{item.userName}</div>
                              <div className="max-w-[170px] truncate text-xs text-slate-400" title={item.userEmail}>{item.userEmail || '-'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-indigo-700">{item.room?.name || `ห้อง ID: ${item.roomId}`}</div>
                          <div className="mt-1 text-xs text-slate-600">
                            {item.day} {formatBookingDate(item.date)}
                            <br />
                            <span className="mx-1 text-slate-300">|</span>
                            <span className="font-semibold text-slate-800">คาบที่ {item.period}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleViewBookingDetails(item)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c-1.38 3.22-4.37 5.5-8 5.5S6.38 15.22 5 12c1.38-3.22 4.37-5.5 8-5.5s6.62 2.28 8 5.5z" />
                            </svg>
                            ดูรายละเอียด
                          </button>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-600">
                          <div className="space-y-1.5">
                            <div className="whitespace-nowrap">📱 {item.phone || '-'}</div>
                            <div className="max-w-[100px] truncate" title={item.lineId}>💬 {shortenLineId(item.lineId)}</div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: status.bg, color: status.color, borderColor: status.border }}>
                            {status.icon} {status.text}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex min-w-[100px] flex-col items-start gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                            <span className="whitespace-nowrap font-semibold text-emerald-600">↪ เข้า: {formatTimeTH(item.checkInTime)}</span>
                            <span className="whitespace-nowrap font-semibold text-rose-500">↩ ออก: {formatTimeTH(item.checkOutTime)}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.status === 'PENDING' ? (
                              <>
                                <button onClick={() => handleUpdateStatus(item.id, 'APPROVED', item.userName)} className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700">
                                  อนุมัติ
                                </button>
                                <button onClick={() => handleUpdateStatus(item.id, 'REJECTED', item.userName)} className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100">
                                  ปฏิเสธ
                                </button>
                              </>
                            ) : (
                              <button onClick={() => handleDeleteBooking(item.id)} className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" title="ลบคำขอ">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6m4-6V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

          {/* =====================================================
              📄 PAGINATION
          ===================================================== */}
          {filteredBookings.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500">
                แสดงลำดับที่{' '}
                <strong className="text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>
                {' '}ถึง{' '}
                <strong className="text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}</strong>
                {' '}จากทั้งหมด{' '}
                <strong className="text-slate-800">{filteredBookings.length}</strong> รายการ
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${currentPage === 1 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'}`}
                >
                  ◀ ก่อนหน้า
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((page, idx, arr) => {
                      const prevP = arr[idx - 1];
                      const hasGap = prevP && page - prevP > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {hasGap && <span className="px-1 text-slate-400 text-xs font-bold">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[32px] h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === page ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'}`}
                >
                  ถัดไป ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}