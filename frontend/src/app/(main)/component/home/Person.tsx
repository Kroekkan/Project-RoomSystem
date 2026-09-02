'use client'

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/hooks/Authcontext";
import Swal from "sweetalert2";
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

interface UserWithPicture {
  id?: number | string;
  name?: string;
  email?: string;
  branch?: string;
  role?: string;
  picture?: string;
}

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

  const currentUser = user as UserWithPicture | null;

  const [filterType, setFilterType] =
    useState<'WEEK' | 'MONTH'>('WEEK');

  const [bookingsData, setBookingsData] =
    useState<Booking[]>([]);

  const [isLoadingBookings, setIsLoadingBookings] =
    useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (!currentUser?.id) return;

    setIsLoadingBookings(true);

    const fetchUrl = isAdmin
      ? `${API}/bookings`
      : `${API}/bookings/user/${currentUser.id}`;

    fetch(fetchUrl)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setBookingsData(Array.isArray(data) ? data : []);
      })
      .catch((err) =>
        console.error("Fetch bookings for chart error:", err)
      )
      .finally(() => setIsLoadingBookings(false));
  }, [currentUser?.id, isAdmin]);

  const chartData = useMemo(() => {
    const now = new Date();

    const filtered = bookingsData.filter((b) => {
      const bDate = new Date(b.createdAt);

      if (filterType === 'WEEK') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);

        return bDate >= oneWeekAgo;
      }

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      return bDate >= oneMonthAgo;
    });

    const roomMap: Record<string, number> = {};

    filtered.forEach((b) => {
      const roomName =
        b.room?.name || `ห้อง ID: ${b.roomId}`;

      roomMap[roomName] =
        (roomMap[roomName] || 0) + 1;
    });

    const colors = [
      '#6366f1',
      '#10b981',
      '#f59e0b',
      '#ec4899',
      '#8b5cf6',
      '#3b82f6',
      '#14b8a6'
    ];

    const total = Object.values(roomMap)
      .reduce((a, b) => a + b, 0);

    return Object.entries(roomMap).map(
      ([name, count], index) => ({
        name,
        count,
        percent:
          total > 0
            ? Math.round((count / total) * 100)
            : 0,
        color: colors[index % colors.length],
      })
    );
  }, [bookingsData, filterType]);

  const totalFilteredBookings =
    chartData.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

  const handleEditProfile = async () => {
    if (!currentUser) return;

    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขข้อมูลส่วนตัว',
      html: `
        <div class="text-left space-y-3 p-1">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อ-นามสกุล
              <span class="text-rose-500">*</span>
            </label>

            <input
              id="swal-edit-name"
              class="swal2-input !m-0 !w-full text-sm"
              value="${currentUser.name || ''}"
              placeholder="เช่น สมชาย ใจดี"
            >
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              สาขาวิชา
            </label>

            <select
              id="swal-edit-branch"
              class="swal2-select !m-0 !w-full text-sm"
            >
              <option>${currentUser.branch}</option>
              <option value="การบัญชี">การบัญชี</option>
              <option value="คอมพิวเตอร์ธุรกิจ">คอมพิวเตอร์ธุรกิจ</option>
              <option value="คอมพิวเตอร์กราฟิกฯ">คอมพิวเตอร์กราฟิกฯ</option>
              <option value="การตลาด">การตลาด</option>
              <option value="การจัดการโลจิสติกส์">การจัดการโลจิสติกส์</option>
              <option value="ภาษาต่างประเทศ">ภาษาต่างประเทศ</option>
              <option value="สามัญแกนธุรกิจ">สามัญแกนธุรกิจ</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5',
      heightAuto: false,

      preConfirm: () => {
        const name =
          (
            document.getElementById(
              'swal-edit-name'
            ) as HTMLInputElement
          ).value.trim();

        const branch =
          (
            document.getElementById(
              'swal-edit-branch'
            ) as HTMLInputElement
          ).value.trim();

        if (!name) {
          Swal.showValidationMessage(
            'กรุณากรอกชื่อ-นามสกุล'
          );
          return;
        }

        return { name, branch };
      },
    });

    if (!formValues) return;

    try {
      const res = await fetch(
        `${API}/users/${currentUser.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formValues),
        }
      );

      if (!res.ok) {
        throw new Error(
          'อัปเดตข้อมูลล้มเหลว'
        );
      }

      await Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'ข้อมูลของคุณถูกอัปเดตแล้ว',
        timer: 1500,
        showConfirmButton: false,
        heightAuto: false,
      });

      window.location.reload();
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        heightAuto: false,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-6">

      {/* PROFILE */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div>
          <div className="flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ข้อมูลส่วนตัว
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 ${
                  isAdmin
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentUser?.role || 'USER'}
              </span>

              <button
                onClick={() => handleEditProfile()}
                className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                แก้ไข
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              {currentUser?.picture ? (
                <img
                  src={currentUser.picture}
                  alt={
                    currentUser.name
                      ? String(currentUser.name)
                      : 'User Avatar'
                  }
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-slate-100 shadow-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (
                      e.target as HTMLElement
                    ).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                  <CircleUserRound
                    size={58}
                    className="sm:hidden"
                    strokeWidth={1.5}
                  />

                  <CircleUserRound
                    size={68}
                    className="hidden sm:block"
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-4 max-w-full break-words">
              {currentUser?.name || 'ผู้ใช้งาน'}
            </h2>

            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 break-all max-w-full">
              {currentUser?.email || '-'}
            </p>
          </div>

          <div className="mt-5 sm:mt-6 space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium shrink-0">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>อีเมล</span>
              </div>

              <span className="text-[11px] sm:text-xs font-semibold text-slate-800 text-right break-all">
                {currentUser?.email || '-'}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium shrink-0">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>แผนก / สาขา</span>
              </div>

              <span className="text-[11px] sm:text-xs font-semibold text-slate-800 text-right break-words">
                {currentUser?.branch || '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 text-center text-[10px] sm:text-[11px] text-slate-400">
          สิทธิ์การใช้งาน: {isAdmin ? 'ผู้ดูแลระบบ (ADMIN)' : 'สมาชิกทั่วไป (USER)'}
        </div>
      </div>

      {/* CHART */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <div className="flex items-center gap-2 min-w-0">
              <PieChartIcon className="w-5 h-5 text-indigo-600 shrink-0" />

              <div className="min-w-0">
                <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate">
                  {isAdmin
                    ? 'สถิติการจองห้องทั้งระบบ'
                    : 'สถิติห้องที่เคยจอง'}
                </h3>

                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  {isAdmin ? (
                    <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  )}

                  <span className="truncate">
                    {isAdmin
                      ? 'แสดงข้อมูลรวมของผู้ใช้งานทุกคน'
                      : 'แสดงเฉพาะสถิติของคุณ'}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setFilterType('WEEK')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'WEEK'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                สัปดาห์นี้
              </button>

              <button
                onClick={() => setFilterType('MONTH')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'MONTH'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                เดือนนี้
              </button>
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="h-52 sm:h-56 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-52 sm:h-56 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl px-4 text-center">
              <Calendar className="w-10 h-10 mb-2 text-slate-300" />

              <p className="text-xs sm:text-sm font-medium">
                ยังไม่มีข้อมูลการจองใน
                {filterType === 'WEEK'
                  ? 'สัปดาห์นี้'
                  : 'เดือนนี้'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-center my-4">
              <div className="sm:col-span-6 flex justify-center relative">
                <svg
                  className="w-40 h-40 sm:w-48 sm:h-48 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  {(() => {
                    let accumulatedPercent = 0;

                    return chartData.map((item, index) => {
                      const strokeDasharray =
                        `${item.percent} ${100 - item.percent}`;

                      const strokeDashoffset =
                        -accumulatedPercent;

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
                  <span className="text-xl sm:text-2xl font-black text-slate-800">
                    {totalFilteredBookings}
                  </span>

                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">
                    {isAdmin
                      ? 'คำขอทั้งหมด'
                      : 'การจองของคุณ'}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-6 space-y-2.5">
                {chartData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: item.color
                        }}
                      />

                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px] sm:max-w-[120px]">
                        {item.name}
                      </span>
                    </div>

                    <div className="text-[11px] sm:text-xs font-bold text-slate-800 shrink-0">
                      {item.count} ครั้ง{" "}
                      <span className="text-slate-400 font-normal text-[10px] sm:text-[11px]">
                        ({item.percent}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-[10px] sm:text-xs text-slate-400 border-t border-slate-100 pt-3 mt-2">
          <span className="truncate">
            {isAdmin
              ? `รวม ${bookingsData.length} รายการทั้งระบบ`
              : `รวม ${bookingsData.length} รายการของคุณ`}
          </span>

          <span className="flex items-center gap-1 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              อัปเดตล่าสุด
            </span>
            <span className="sm:hidden">
              ล่าสุด
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}