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
  User as UserIcon,
  LogIn,
  LogOut
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

const API = process.env.NEXT_PUBLIC_API_URL;

function formatDateTH(dStr: string): string {
  const d = new Date(dStr);

  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit"
  });
}

function formatTimeTH(dStr: string): string {
  const d = new Date(dStr);

  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok"
  });
}

export default function Booking_History() {
  const { user } = useAuth();

  const [history, setHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [actionLoadingId, setActionLoadingId] =
    useState<number | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async (
      showLoading = false
    ) => {
      if (showLoading) {
        setIsLoading(true);
      }

      const fetchUrl = isAdmin
        ? `${API}/bookings`
        : `${API}/bookings/user/${user.id}`;

      try {
        const res = await fetch(fetchUrl, {
          credentials: 'include',
        });

        const data = res.ok
          ? await res.json()
          : [];

        if (Array.isArray(data)) {
          const sorted = data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          );

          setHistory(sorted.slice(0, 10));
        }
      } catch (err) {
        console.error(
          'Fetch history error:',
          err
        );
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory(true);

    const intervalId = window.setInterval(() => {
      fetchHistory(false);
    }, 5000);

    return () =>
      window.clearInterval(intervalId);
  }, [user?.id, isAdmin]);

  const handleCheck = async (
    booking: Booking,
    type: 'checkin' | 'checkout'
  ) => {
    if (actionLoadingId !== null) return;

    setActionLoadingId(booking.id);

    const now = new Date().toISOString();

    try {
      const res = await fetch(
        `${API}/bookings/${booking.id}/${type}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ time: now }),
        }
      );

      if (!res.ok) {
        throw new Error(`${type} failed`);
      }

      const updated =
        await res.json().catch(() => null);

      setHistory((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                checkInTime:
                  type === 'checkin'
                    ? (
                        updated?.checkInTime ??
                        now
                      )
                    : item.checkInTime,

                checkOutTime:
                  type === 'checkout'
                    ? (
                        updated?.checkOutTime ??
                        now
                      )
                    : item.checkOutTime,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        `${type} error:`,
        err
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="mt-6 sm:mt-8 bg-white rounded-3xl p-3 sm:p-6 border border-slate-200/80 shadow-md space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isAdmin
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <History className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
              {isAdmin
                ? 'ประวัติการจองทั้งหมดในระบบ (10 รายการล่าสุด)'
                : 'ประวัติการจองของคุณ (10 รายการล่าสุด)'}
            </h2>

            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              {isAdmin
                ? 'รายการจองของผู้ใช้งานทุกคนเรียงตามลำดับเวลาล่าสุด'
                : 'รายการคำขอจองห้องเรียนของคุณที่ทำรายการล่าสุด'}
            </p>
          </div>
        </div>

        <span className="text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto shrink-0">
          {history.length} รายการล่าสุด
        </span>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              {isAdmin && (
                <th className="py-3 px-3 sm:px-4">
                  ผู้ขอจอง
                </th>
              )}

              <th className="py-3 px-3 sm:px-4">
                ห้องเรียน
              </th>

              <th className="py-3 px-3 sm:px-4">
                วันที่ / คาบเรียน
              </th>

              <th className="py-3 px-3 sm:px-4">
                วัตถุประสงค์
              </th>

              <th className="py-3 px-3 sm:px-4 text-center">
                สถานะ
              </th>

              <th className="py-3 px-3 sm:px-4 text-center">
                เข้า / ออกห้อง
              </th>

              <th className="py-3 px-3 sm:px-4 text-right">
                วันที่ทำรายการ
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 text-xs">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr
                  key={i}
                  className="animate-pulse"
                >
                  {isAdmin && (
                    <td className="py-4 px-3 sm:px-4">
                      <div className="h-4 bg-slate-100 rounded w-28" />
                    </td>
                  )}

                  <td className="py-4 px-3 sm:px-4">
                    <div className="h-4 bg-slate-100 rounded w-24" />
                  </td>

                  <td className="py-4 px-3 sm:px-4">
                    <div className="h-4 bg-slate-100 rounded w-32" />
                  </td>

                  <td className="py-4 px-3 sm:px-4">
                    <div className="h-4 bg-slate-100 rounded w-40" />
                  </td>

                  <td className="py-4 px-3 sm:px-4">
                    <div className="h-5 bg-slate-100 rounded-full w-20 mx-auto" />
                  </td>

                  <td className="py-4 px-3 sm:px-4">
                    <div className="h-4 bg-slate-100 rounded w-24 mx-auto" />
                  </td>

                  <td className="py-4 px-3 sm:px-4">
                    <div className="h-4 bg-slate-100 rounded w-20 ml-auto" />
                  </td>
                </tr>
              ))
            ) : history.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 7 : 6}
                  className="py-12 text-center text-slate-400"
                >
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />

                  <p className="font-semibold text-sm">
                    ยังไม่มีประวัติการจองห้องพักในระบบ
                  </p>
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {isAdmin && (
                    <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />

                        <div>
                          <div>
                            {item.userName}
                          </div>

                          {item.userEmail && (
                            <div className="text-[10px] text-slate-400 font-normal">
                              {item.userEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}

                  <td className="py-3.5 px-3 sm:px-4 font-bold text-indigo-700">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-400 shrink-0" />

                      <span>
                        {item.room?.name ||
                          `ห้อง ID: ${item.roomId}`}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 sm:px-4 text-slate-700">
                    <div className="font-semibold">
                      วัน{item.day}ที่ {item.date}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      คาบที่ {item.period}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 sm:px-4 text-slate-600 max-w-xs">
                    <p className="truncate font-medium">
                      {item.purpose || '-'}
                    </p>
                  </td>

                  <td className="py-3.5 px-3 sm:px-4 text-center">
                    {item.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        อนุมัติแล้ว
                      </span>
                    )}

                    {item.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        รออนุมัติ
                      </span>
                    )}

                    {item.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        ปฏิเสธแล้ว
                      </span>
                    )}

                    {item.status === 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                        <Ban className="w-3.5 h-3.5 text-slate-400" />
                        ยกเลิกแล้ว
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 sm:px-4 text-center">
                    {item.status !== 'APPROVED' ? (
                      <span className="text-slate-300">
                        -
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        {!item.checkInTime && (
                          <button
                            onClick={() =>
                              handleCheck(
                                item,
                                'checkin'
                              )
                            }
                            disabled={
                              actionLoadingId ===
                              item.id
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            <LogIn className="w-3.5 h-3.5" />

                            {actionLoadingId ===
                            item.id
                              ? 'กำลังบันทึก...'
                              : 'เข้าห้อง'}
                          </button>
                        )}

                        {item.checkInTime && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 whitespace-nowrap">
                            <LogIn className="w-3 h-3" />
                            เข้า{" "}
                            {formatTimeTH(
                              item.checkInTime
                            )}
                          </span>
                        )}

                        {item.checkInTime &&
                          !item.checkOutTime && (
                            <button
                              onClick={() =>
                                handleCheck(
                                  item,
                                  'checkout'
                                )
                              }
                              disabled={
                                actionLoadingId ===
                                item.id
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              <LogOut className="w-3.5 h-3.5" />

                              {actionLoadingId ===
                              item.id
                                ? 'กำลังบันทึก...'
                                : 'ออกห้อง'}
                            </button>
                          )}

                        {item.checkOutTime && (
                          <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 whitespace-nowrap">
                            <LogOut className="w-3 h-3" />
                            ออก{" "}
                            {formatTimeTH(
                              item.checkOutTime
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 sm:px-4 text-right text-slate-400 font-medium whitespace-nowrap">
                    {formatDateTH(
                      item.createdAt
                    )}
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