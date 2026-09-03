'use client'

import { useEffect, useState, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import { Wrench, AlertTriangle, CalendarDays } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Room { 
  id: number; 
  name: string; 
  building?: string;
  category?: string;
}

interface CurrentUser { 
  id: number | string; 
  name: string; 
  email?: string; 
  phone?: string; 
  lineId?: string; 
  role?: string; 
}

interface ScheduleItem {
  id: number;
  day: string;
  period: string;
  subject: string;
  teacher: string;
  classroom: string;
}

interface BookingItem {
  id: number;
  userId?: number | string;
  userName: string;
  day: string;
  date: string;
  period: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

// 🟢 โครงสร้างข้อมูลประชาสัมพันธ์
interface PublicPost {
  id: number;
  category: 'GENERAL' | 'DAMAGED' | 'LOST' | 'FOUND' | 'MAINTENANCE';
  title: string;
  message: string;
  location?: string;
  roomId?: number | string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  resolved: boolean;
}

const API = process.env.NEXT_PUBLIC_API_URL;

const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

const periods = ["1", "2", "พัก 30", "3", "4", "5", "6", "7", "8", "9"];

const time = [
  "8:30-9:20",
  "9:20-10:10",
  "10:10-10:40",
  "10:40-11:30",
  "11:30-12:20", 
  "12:20-13:10",
  "13:10-14:00",
  "14:00-14:50",
  "14:50-15:40",
  "15:40-16:30"
];

const Shortentime = [
  "8:30-9:10",
  "9:10-9:50",
  "9:50-10:20",
  "10:20-11:00",
  "11:00-11:40", 
  "11:40-12:20",
  "12:20-13:00",
  "13:00-13:40",
  "13:40-14:20",
  "14:20-15:00"
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();

  date.setDate(
    date.getDate() - day + (day === 0 ? -6 : 1)
  );

  date.setHours(0, 0, 0, 0);

  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); 

  r.setDate(r.getDate() + n);
  r.setHours(0, 0, 0, 0);

  return r;
}

function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateTH(d: Date | string): string { 
  const dt = typeof d === 'string' ? new Date(d) : d;

  return dt.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit"
  }); 
}

function getPeriodTitle(p: string): string {
  // if (p === 3) return "พัก 30";
  return `คาบ ${p}`;
}

export default function UserBookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [adminSchedules, setAdminSchedules] = useState<ScheduleItem[]>([]);
  const [userBookings, setUserBookings] = useState<BookingItem[]>([]);
  const [publicPosts, setPublicPosts] = useState<PublicPost[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [currentMonday, setCurrentMonday] = useState<Date>(
    getMonday(new Date())
  );

  const sunday = addDays(currentMonday, 6);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [targetSlot, setTargetSlot] = useState<{
    day: string;
    date: string;
    period: string;
  } | null>(null);

  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [purpose, setPurpose] = useState("");

  // 🟢 ใช้จำว่า Popup ของประกาศไหนถูกแสดงไปแล้ว
  // รูปแบบ: roomId-maintenanceId
  const alertedMaintenanceRef = useRef<string | null>(null);

  // 🟢 วันที่ปัจจุบันสำหรับตรวจสอบวันหมดอายุ
  // อัปเดตทุก 1 นาที เพื่อให้แถบหายเองเมื่อข้ามวัน
  const [today, setToday] = useState<Date>(new Date());

  // 🟢 1. ดึงห้อง, ผู้ใช้, และข้อมูลประกาศประชาสัมพันธ์
  useEffect(() => {
    let returnedLineUserId = "";
    let savedBooking: {
      isModalOpen?: boolean;
      selectedRoomId?: number | string | null;
      targetSlot?: {
        day: string;
        date: string;
        period: string;
      } | null;
      phone?: string;
      purpose?: string;
    } | null = null;

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);

      returnedLineUserId = urlParams.get("lineUserId") || "";

      // ถ้ากลับมาจาก LINE Login ให้ดึงสถานะ Popup เดิมกลับมา
      if (returnedLineUserId) {
        localStorage.setItem("lineUserId", returnedLineUserId);

        const saved = sessionStorage.getItem(
          "roomBookingLineReturn",
        );

        if (saved) {
          try {
            savedBooking = JSON.parse(saved);

            if (savedBooking?.isModalOpen) {
              if (savedBooking.targetSlot) {
                setTargetSlot(savedBooking.targetSlot);
              }

              if (typeof savedBooking.phone === "string") {
                setPhone(savedBooking.phone);
              }

              if (typeof savedBooking.purpose === "string") {
                setPurpose(savedBooking.purpose);
              }

              // เปิด Popup กลับมาเหมือนเดิม
              setIsModalOpen(true);
            }
          } catch (error) {
            console.error(
              "Restore booking popup error:",
              error,
            );
          }

          sessionStorage.removeItem("roomBookingLineReturn");
        }

        // ลบ lineUserId ออกจาก URL เพื่อไม่ให้ URL ค้าง
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }

    fetch(`${API}/rooms`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data);

          // คืนห้องเดิมที่ผู้ใช้เลือกไว้ก่อน Login LINE
          if (savedBooking?.selectedRoomId) {
            const restoredRoom = data.find(
              (room: Room) =>
                Number(room.id) === Number(savedBooking?.selectedRoomId),
            );

            if (restoredRoom) {
              setSelectedRoom(restoredRoom);
            }
          }
        }
      })
      .catch(err => {
        console.error("Fetch rooms error:", err);
      });

    fetch(`/api/auth/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(user => {
        if (user && user.name) {
          setCurrentUser(user);

          // ถ้ากลับจาก LINE Login ให้ใช้เบอร์เดิมที่กรอกไว้ใน Popup
          // ถ้าไม่มีข้อมูลที่จำไว้ จึงใช้เบอร์จากบัญชี
          if (
            returnedLineUserId &&
            savedBooking &&
            typeof savedBooking.phone === "string"
          ) {
            setPhone(savedBooking.phone);
          } else {
            setPhone(user.phone || "");
          }

          const activeLineId =
            returnedLineUserId ||
            localStorage.getItem("lineUserId") ||
            user.lineId ||
            "";

          setLineId(activeLineId);
        }
      })
      .catch(() => {});

    // 🟢 ดึงข้อมูลประชาสัมพันธ์ทั้งหมด
    fetchPublicPosts();
  }, []);

  const fetchPublicPosts = async () => {
    try {
      const res = await fetch(`${API}/public-posts`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();

        setPublicPosts(
          Array.isArray(data) ? data : []
        );
      }
    } catch (err) {
      console.error("Fetch public posts error:", err);
    }
  };

  // 🟢 เช็กวันที่ปัจจุบันทุก 1 นาที
  // เพื่อให้แถบแจ้งเตือนหายเองเมื่อหมด endDate
  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 🟢 Auto Refresh ตารางและประกาศทุกๆ 5 วินาที
  useEffect(() => {
    if (selectedRoom) {
      fetchFullSchedule(selectedRoom.id, true);
    }

    const interval = setInterval(() => {
      if (selectedRoom) {
        fetchFullSchedule(selectedRoom.id, false);
        fetchPublicPosts();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedRoom, currentMonday]);

  const buildingList = useMemo(() => {
    const buildings = rooms
      .map((r) => r.building?.trim())
      .filter((b): b is string => Boolean(b));

    return Array.from(new Set(buildings));
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesBuilding =
        selectedBuilding === "ALL" ||
        room.building === selectedBuilding;

      const isLab =
        room.category === "ห้องปฏิบัติการ" ||
        room.name.includes("Lab") ||
        room.name.includes("ปฏิบัติการ");

      let matchesCategory = true;

      if (selectedCategory === "LAB") {
        matchesCategory = isLab;
      }

      if (selectedCategory === "GENERAL") {
        matchesCategory = !isLab;
      }

      return matchesBuilding && matchesCategory;
    });
  }, [rooms, selectedBuilding, selectedCategory]);

  useEffect(() => {
    if (
      selectedRoom &&
      !filteredRooms.some(r => r.id === selectedRoom.id)
    ) {
      setSelectedRoom(null);
    }
  }, [filteredRooms, selectedRoom]);

  const fetchFullSchedule = async (
    roomId: number,
    showLoading = true
  ) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const start = formatDateISO(currentMonday);
      const end = formatDateISO(sunday);

      const res = await fetch(
        `${API}/bookings/room/${roomId}/full-schedule?startDate=${start}&endDate=${end}`
      );

      if (res.ok) {
        const data = await res.json();

        setAdminSchedules(data.schedules || []);
        setUserBookings(data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // 🟢 ฟังก์ชันตรวจสอบว่าประกาศนี้เกี่ยวข้องกับห้องที่เลือกหรือไม่
  const isPostRelatedToRoom = (
    post: PublicPost,
    room: Room | null
  ): boolean => {
    if (!post || !room) return false;

    // ถ้ามี roomId ให้ใช้ roomId เป็นหลัก
    if (post.roomId !== undefined && post.roomId !== null) {
      return Number(post.roomId) === Number(room.id);
    }

    // ประกาศเก่าที่ไม่มี roomId
    // ค่อย fallback ไปใช้ location
    if (!post.location) return false;

    const loc = post.location.toLowerCase().trim();
    const roomName = room.name.toLowerCase().trim();

    return (
      loc === roomName ||
      loc.includes(roomName) ||
      roomName.includes(loc)
    );
  };

  // 🟢 รายการแจ้งเตือนชำรุดของห้องที่กำลังเลือก
  // ไม่เกี่ยวกับช่วงวันที่
  const roomDamages = useMemo(() => {
    return publicPosts.filter(
      p =>
        p.category === 'DAMAGED' &&
        !p.resolved &&
        isPostRelatedToRoom(p, selectedRoom)
    );
  }, [publicPosts, selectedRoom]);

  // 🟢 รายการประกาศปิดปรับปรุงทั้งหมดของห้อง
  //
  // สำคัญ:
  // ห้ามกรองด้วยวันที่วันนี้ตรงนี้
  // เพราะตัวนี้ถูกใช้ตรวจสอบวันที่ใน "ตาราง"
  const roomMaintenances = useMemo(() => {
    return publicPosts.filter(
      p =>
        p.category === 'MAINTENANCE' &&
        !p.resolved &&
        isPostRelatedToRoom(p, selectedRoom)
    );
  }, [publicPosts, selectedRoom]);

  // 🟢 รายการปิดปรับปรุงที่ "กำลังใช้งานอยู่ในวันนี้"
  // ใช้สำหรับ Popup เท่านั้น
  // ถ้าหมด endDate แล้ว จะไม่เด้ง Popup
  const activeRoomMaintenances = useMemo(() => {
    const todayStr = formatDateISO(today);

    return roomMaintenances.filter(m => {
      if (!m.startDate && !m.endDate) {
        return true;
      }

      const start = m.startDate
        ? formatDateISO(new Date(m.startDate))
        : '1970-01-01';

      const end = m.endDate
        ? formatDateISO(new Date(m.endDate))
        : '2099-12-31';

      return todayStr >= start && todayStr <= end;
    });
  }, [roomMaintenances, today]);

  // 🟢 รายการปิดปรับปรุงทั้งหมดที่อยู่ในสัปดาห์ที่กำลังเปิดดู
  // ใช้สำหรับแถบแจ้งเตือนด้านบน
  // เช่น สัปดาห์ 31 ส.ค. - 6 ก.ย.
  // ถ้าช่วงปิดปรับปรุงทับกับสัปดาห์นี้ จะแสดงในแถบ
  const weeklyRoomMaintenances = useMemo(() => {
    const weekStart = formatDateISO(currentMonday);
    const weekEnd = formatDateISO(sunday);

    return roomMaintenances.filter(m => {
      if (!m.startDate && !m.endDate) {
        return true;
      }

      const start = m.startDate
        ? formatDateISO(new Date(m.startDate))
        : '1970-01-01';

      const end = m.endDate
        ? formatDateISO(new Date(m.endDate))
        : '2099-12-31';

      // เช็กว่าช่วงปิดปรับปรุงทับกับช่วงสัปดาห์ที่กำลังดูหรือไม่
      return start <= weekEnd && end >= weekStart;
    });
  }, [roomMaintenances, currentMonday, sunday]);

  // 🟢 เด้งแจ้งเตือนทันทีเมื่อเลือกห้องที่กำลังปิดปรับปรุง
  useEffect(() => {
    if (!selectedRoom) return;

    // ถ้าไม่มีประกาศที่กำลัง active วันนี้
    // ไม่ต้องเด้ง
    if (activeRoomMaintenances.length === 0) {
      // ล้างค่าเพื่อให้ประกาศใหม่ในอนาคตของห้องนี้สามารถเด้งได้
      alertedMaintenanceRef.current = null;
      return;
    }

    // เอาประกาศที่กำลัง active ตัวแรก
    const activeMaintenance = activeRoomMaintenances[0];

    // จำเป็นห้อง + id ประกาศ
    const alertKey = `${selectedRoom.id}-${activeMaintenance.id}`;

    // ถ้าเคยแจ้งประกาศนี้ไปแล้ว ไม่ต้องแจ้งซ้ำ
    if (alertedMaintenanceRef.current === alertKey) {
      return;
    }

    // จำว่าแจ้งประกาศนี้แล้ว
    alertedMaintenanceRef.current = alertKey;

    Swal.fire({
      title: `⚠️ ห้อง ${selectedRoom.name} ปิดปรับปรุง`,

      html: `
        <div class="text-left text-sm space-y-2 p-1 text-slate-700">
          <p>
            <b>หัวข้อ:</b>
            ${activeMaintenance.title}
          </p>

          <p>
            <b>รายละเอียด:</b>
            ${activeMaintenance.message}
          </p>

          ${
            activeMaintenance.startDate ||
            activeMaintenance.endDate
              ? `
                <p class="text-xs text-amber-700 font-semibold">
                  📅 ช่วงเวลาปิด:
                  ${
                    activeMaintenance.startDate
                      ? formatDateTH(activeMaintenance.startDate)
                      : '-'
                  }
                  -
                  ${
                    activeMaintenance.endDate
                      ? formatDateTH(activeMaintenance.endDate)
                      : '-'
                  }
                </p>
              `
              : ''
          }
        </div>
      `,

      icon: 'warning',
      confirmButtonColor: '#64748b',
      confirmButtonText: 'รับทราบ',
      heightAuto: false,
    });
  }, [selectedRoom, activeRoomMaintenances]);

  // 🟢 ตรวจสอบว่าวันที่ dateStr อยู่ในช่วงปิดปรับปรุงหรือไม่
  //
  // ใช้กับ "ตาราง"
  // จึงยังสามารถดูประกาศในวันอนาคตได้
  const getMaintenanceForDate = (
    dateStr: string
  ): PublicPost | undefined => {
    return roomMaintenances.find(m => {
      if (!m.startDate && !m.endDate) {
        return true;
      }

      const start = m.startDate
        ? formatDateISO(new Date(m.startDate))
        : '1970-01-01';

      const end = m.endDate
        ? formatDateISO(new Date(m.endDate))
        : '2099-12-31';

      return dateStr >= start && dateStr <= end;
    });
  };

  const handleConnectLine = () => {
    if (typeof window !== "undefined") {
      // จำสถานะ Popup จองห้องไว้ก่อนออกไป Login LINE
      // เพื่อให้กลับมาแล้วเปิด Popup เดิมต่อได้
      sessionStorage.setItem(
        "roomBookingLineReturn",
        JSON.stringify({
          isModalOpen: isModalOpen,
          selectedRoomId: selectedRoom?.id ?? null,
          targetSlot,
          phone,
          purpose,
        }),
      );

      localStorage.removeItem("lineUserId");
    }

    setLineId("");

    window.location.href = `${API}/auth/line`;
  };

  const getAdminSchedule = (
    day: string,
    period: string
  ) => {
    return adminSchedules.find(
      s => s.day === day && s.period === period
    );
  };

  const getUserBooking = (
    dateStr: string,
    period: string
  ) => {
    return userBookings.find(
      b => b.date === dateStr && b.period === period
    );
  };

  const handleCancelBooking = async (
    bookingId: number,
    userName: string
  ) => {
    const confirm = await Swal.fire({
      title: 'ยกเลิกรายการจองนี้?',
      text: `ต้องการยกเลิกการจองของคุณ "${userName}" ใช่หรือไม่`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ยืนยันยกเลิก',
      cancelButtonText: 'ย้อนกลับ',
      heightAuto: false,
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `${API}/bookings/${bookingId}/status`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'CANCELLED'
            }),
          }
        );

        if (res.ok) {
          if (selectedRoom) {
            fetchFullSchedule(
              selectedRoom.id,
              false
            );
          }

          Swal.fire({
            title: 'ยกเลิกการจองสำเร็จ!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            heightAuto: false,
          });
        }
      } catch {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          icon: 'error',
          heightAuto: false
        });
      }
    }
  };

  // 🟢 จัดการเมื่อคลิกที่ช่องเวลา
  const handleSlotClick = (
    day: string,
    dateStr: string,
    period: string
  ) => {
    // 1. เช็กว่าห้องปิดปรับปรุงในวันที่เลือกหรือไม่
    const maintenance =
      getMaintenanceForDate(dateStr);

    if (maintenance) {
      Swal.fire({
        title: '⚠️ ห้องปิดปรับปรุง',

        html: `
          <div class="text-left text-sm space-y-2 p-1 text-slate-700">
            <p>
              <b>หัวข้อ:</b>
              ${maintenance.title}
            </p>

            <p>
              <b>รายละเอียด:</b>
              ${maintenance.message}
            </p>

            ${
              maintenance.startDate ||
              maintenance.endDate
                ? `
                  <p class="text-xs text-amber-700 font-semibold">
                    📅 ช่วงเวลาปิด:
                    ${
                      maintenance.startDate
                        ? formatDateTH(
                            maintenance.startDate
                          )
                        : '-'
                    }
                    -
                    ${
                      maintenance.endDate
                        ? formatDateTH(
                            maintenance.endDate
                          )
                        : '-'
                    }
                  </p>
                `
                : ''
            }

            <p class="text-xs text-rose-600 font-bold mt-2">
              🚫 ไม่สามารถทำการจองห้องเรียนในช่วงเวลานี้ได้
            </p>
          </div>
        `,

        icon: 'warning',
        confirmButtonColor: '#64748b',
        confirmButtonText: 'รับทราบ',
        heightAuto: false,
      });

      return;
    }

    // 2. เช็กว่าติดคาบเรียนประจำหรือไม่
    const adminItem =
      getAdminSchedule(day, period);

    if (adminItem) {
      Swal.fire({
        title: 'ติดคาบเรียนประจำ \n (ไม่สามารถจองได้)',

        html: `
          <div class="text-left text-sm space-y-1">
            <p>
              <b>วิชา:</b>
              ${adminItem.subject}
            </p>

            <p>
              <b>ผู้สอน:</b>
              ${adminItem.teacher}
            </p>

            <p>
              <b>ห้องสอน:</b>
              ${adminItem.classroom}
            </p>
          </div>
        `,

        icon: 'info',
        confirmButtonColor: '#6366f1',
        heightAuto: false,
      });

      return;
    }

    // 3. เช็กว่ามีการจองแล้วหรือไม่
    const bookingItem =
      getUserBooking(dateStr, period);

    if (bookingItem) {
      const isApproved =
        bookingItem.status === 'APPROVED';

      const isMyBooking =
        currentUser &&
        (
          (
            bookingItem.userId !== undefined &&
            String(bookingItem.userId) ===
              String(currentUser.id)
          ) ||
          (
            bookingItem.userName &&
            currentUser.name &&
            bookingItem.userName.trim() ===
              currentUser.name.trim()
          )
        );

      Swal.fire({
        title: isApproved
          ? 'มีการจองและอนุมัติแล้ว'
          : 'อยู่ระหว่างรออนุมัติ',

        html: `
          <div class="text-left text-sm space-y-1.5 p-1">
            <p>
              <b>ผู้จอง:</b>
              ${bookingItem.userName}
            </p>

            <p>
              <b>วัตถุประสงค์:</b>
              ${bookingItem.purpose}
            </p>

            <p>
              <b>สถานะ:</b>
              ${
                isApproved
                  ? '<span class="text-emerald-600 font-bold">อนุมัติแล้ว</span>'
                  : '<span class="text-amber-600 font-bold">⏳ รออนุมัติ</span>'
              }
            </p>
          </div>
        `,

        icon: isApproved
          ? 'error'
          : 'warning',

        showDenyButton:
          Boolean(isMyBooking),

        denyButtonText:
          '🗑️ ยกเลิกการจอง',

        denyButtonColor:
          '#ef4444',

        heightAuto: false,

      }).then((result) => {
        if (result.isDenied) {
          handleCancelBooking(
            bookingItem.id,
            bookingItem.userName
          );
        }
      });

      return;
    }

    // 4. ช่องว่าง
    setTargetSlot({
      day,
      date: dateStr,
      period
    });

    setIsModalOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (
      !currentUser ||
      !currentUser.name ||
      !purpose.trim() ||
      !selectedRoom ||
      !targetSlot
    ) {
      Swal.fire({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        icon: "warning",
        timer: 1200,
        showConfirmButton: false,
        heightAuto: false
      });

      return;
    }

    try {
      const res = await fetch(
        `${API}/bookings`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            roomId: selectedRoom.id,
            userId: Number(currentUser.id),
            userName: currentUser.name,
            userEmail:
              currentUser.email || undefined,
            phone:
              phone.trim() || undefined,
            lineId:
              lineId.trim() || undefined,
            day: targetSlot.day,
            date: targetSlot.date,
            period: targetSlot.period,
            purpose: purpose.trim(),
          })
        }
      );

      if (res.ok) {
        setIsModalOpen(false);
        setPurpose('');

        fetchFullSchedule(
          selectedRoom.id,
          false
        );

        Swal.fire({
          title: 'ส่งคำขอจองสำเร็จ!',
          text: 'คำขอของคุณถูกส่งเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#10b981',
          heightAuto: false,
        });

      } else {
        const errData =
          await res.json();

        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text:
            errData.message ||
            'ไม่สามารถจองได้',
          icon: "error",
          timer: 1200,
          showConfirmButton: false,
          heightAuto: false
        });
      }

    } catch {
      Swal.fire({
        title: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        icon: "error",
        timer: 1200,
        showConfirmButton: false,
        heightAuto: false
      });
    }
  };

  return (
    <div className="h-[1030px] bg-app-bg p-4 md:p-8">

      <div className="max-w-[1300px] mx-auto space-y-6">
        
        {/* Header และ แถบตัวกรอง */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              ตารางใช้ห้องเรียน / จองห้อง
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              แสดงข้อมูลตารางเรียนประจำ รายการจองห้อง
            </p>

            <p className="text-xs text-slate-500 mt-1">
              และสถานะห้องเรียน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* 🏢 1. อาคาร */}
            <div className="flex items-center gap-2">

              <span className="text-xs font-bold text-slate-700">
                อาคาร:
              </span>

              <select
                value={selectedBuilding}
                onChange={(e) =>
                  setSelectedBuilding(e.target.value)
                }
                className="px-3 py-2 rounded-2xl border border-slate-200 bg-white font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="ALL">
                  ทุกอาคาร
                </option>

                {buildingList.map(b => (
                  <option
                    key={b}
                    value={b}
                  >
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* 🏫 2. หมวดหมู่ */}
            <div className="flex items-center gap-2">

              <span className="text-xs font-bold text-slate-700">
                หมวดหมู่:
              </span>

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                className="px-3 py-2 rounded-2xl border border-slate-200 bg-white font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="ALL">
                  ทุกหมวดหมู่
                </option>

                <option value="GENERAL">
                  ห้องเรียนทั่วไป
                </option>

                <option value="LAB">
                  ห้องปฏิบัติการ
                </option>
              </select>
            </div>

            {/* 🚪 3. ห้อง */}
            <div className="flex items-center gap-2">

              <span className="text-xs font-bold text-slate-700">
                ห้อง:
              </span>

              <select
                value={selectedRoom?.id || ''}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  if (!value) {
                    setSelectedRoom(null);
                    return;
                  }

                  const r =
                    filteredRooms.find(
                      item =>
                        item.id ===
                        Number(value)
                    );

                  if (r) {
                    setSelectedRoom(r);
                  }
                }}
                className="px-4 py-2 rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">
                  -- เลือกห้อง --
                </option>

                {filteredRooms.map(r => (
                  <option
                    key={r.id}
                    value={r.id}
                  >
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 📅 แสดงช่วงสัปดาห์ */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">

              <button
                onClick={() =>
                  setCurrentMonday(
                    addDays(
                      currentMonday,
                      -7
                    )
                  )
                }
                className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer shadow-2xs"
                title="สัปดาห์ก่อนหน้า"
              >
                ◀
              </button>

              <div className="px-3 py-2 rounded-xl bg-slate-100 text-indigo-700 font-bold text-xs">
                {formatDateTH(currentMonday)}
                {" — "}
                {formatDateTH(sunday)}
              </div>

              <button
                onClick={() =>
                  setCurrentMonday(
                    addDays(
                      currentMonday,
                      7
                    )
                  )
                }
                className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer shadow-2xs"
                title="สัปดาห์ถัดไป"
              >
                ▶
              </button>

              <button
                onClick={() =>
                  setCurrentMonday(
                    getMonday(new Date())
                  )
                }
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 cursor-pointer shadow-2xs ml-1"
              >
                สัปดาห์นี้
              </button>
            </div>

          </div>
        </div>

        {/* 🟢 📢 การ์ดแจ้งเตือนประชาสัมพันธ์สำหรับห้องนี้ */}
        {(
          roomDamages.length > 0 ||
          weeklyRoomMaintenances.length > 0
        ) && (

          <div className="space-y-2">

            {/* แถบแจ้งเตือนปิดปรับปรุง */}
            {weeklyRoomMaintenances.map((m) => (

              <div
                key={m.id}
                className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 flex items-center gap-3"
              >

                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">

                  <span className="text-[11px] font-bold text-rose-300 shrink-0">
                    ปิดปรับปรุงห้อง {selectedRoom?.name}
                  </span>

                  <span className="text-sm font-semibold text-white truncate">
                    {m.title}
                  </span>

                  <span className="text-xs text-slate-400 truncate hidden sm:inline">
                    — {m.message}
                  </span>

                </div>

                {(m.startDate || m.endDate) && (

                  <span className="text-[11px] text-slate-300 flex items-center gap-1 shrink-0">

                    <CalendarDays className="w-3.5 h-3.5" />

                    {m.startDate
                      ? formatDateTH(m.startDate)
                      : '-'
                    }

                    {" - "}

                    {m.endDate
                      ? formatDateTH(m.endDate)
                      : '-'
                    }

                  </span>

                )}

              </div>

            ))}

            {/* แถบแจ้งเตือนห้องชำรุด */}
            {roomDamages.map((d) => (

              <div
                key={d.id}
                className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3"
              >

                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">

                  <span className="text-[11px] font-bold text-rose-600 shrink-0">
                    ห้องชำรุด
                  </span>

                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {d.title}
                  </span>

                  <span className="text-xs text-slate-500 truncate hidden sm:inline">
                    — {d.message}
                  </span>

                </div>

                {d.location && (
                  <span className="text-[11px] text-slate-500 shrink-0">
                    📍 {d.location}
                  </span>
                )}

              </div>

            ))}

          </div>

        )}

        {/* 📋 ตารางจอง 7 วัน */}
        {!selectedRoom ? (

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center">

            <div className="text-5xl mb-4">
              🚪
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              กรุณาเลือกห้องเรียน
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              เลือกห้องเรียนจากรายการด้านบนเพื่อดูตารางและทำการจอง
            </p>

          </div>

        ) : (

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">

            <div className="overflow-x-auto">

              <table className="table-fixed w-full border-collapse min-w-[950px]">

                <thead>
                  <tr>

                    <th className="bg-slate-800 text-white px-4 py-3.5 text-xs font-bold w-28 text-center sticky left-0 z-10">
                      วัน / คาบ
                    </th>

                    {periods.map((p, inx) => (

                      <th
                        key={p}
                        className="bg-slate-800 text-white px-2 py-3.5 text-center text-xs font-semibold min-w-[95px]"
                      >

                        <div className="font-bold">
                          {getPeriodTitle(p)}
                        </div>

                        <div className="mt-1 text-[11px] text-slate-300 font-normal">
                          {time[inx]}
                        </div>

                        <div className="mt-0.5 text-[10px] text-slate-400 font-normal">
                          {Shortentime[inx]}
                        </div>

                      </th>

                    ))}

                  </tr>
                </thead>

                <tbody>

                  {isLoading ? (

                    [...Array(7)].map((_, i) => (

                      <tr
                        key={i}
                        className="animate-pulse border-b border-slate-100"
                      >

                        <td className="p-4 bg-slate-100"></td>

                        {periods.map(p => (

                          <td
                            key={p}
                            className="p-2"
                          >
                            <div className="h-14 bg-slate-100 rounded-2xl"></div>
                          </td>

                        ))}

                      </tr>

                    ))

                  ) : (

                    days.map((day, dayIdx) => {

                      const dateObj =
                        addDays(
                          currentMonday,
                          dayIdx
                        );

                      const dateStr =
                        formatDateISO(
                          dateObj
                        );

                      // 🟢 เช็กว่าวันนี้ห้องปิดปรับปรุงหรือไม่
                      const maintenanceToday =
                        getMaintenanceForDate(
                          dateStr
                        );

                      return (

                        <tr
                          key={day}
                          className="border-b border-slate-100 last:border-b-0"
                        >

                          <td className="bg-slate-700 text-white px-3 py-3.5 text-center font-bold text-xs sticky left-0 z-10">

                            <div>
                              {day}
                            </div>

                            <div className="text-[10px] text-slate-300 font-normal mt-0.5">
                              {formatDateTH(
                                dateObj
                              )}
                            </div>

                          </td>

                          {periods.map(p => {

                            // 🟢 1. ถ้าวันนี้ปิดปรับปรุง
                            if (maintenanceToday) {

                              return (

                                <td 
                                  key={p} 
                                  onClick={() =>
                                    handleSlotClick(
                                      day,
                                      dateStr,
                                      p
                                    )
                                  }
                                  className="p-1.5 text-center cursor-pointer"
                                >

                                  <div className="h-18 rounded-2xl border border-slate-300 bg-slate-100/90 text-slate-600 p-1 flex flex-col items-center justify-center shadow-2xs hover:bg-slate-200 transition-colors">

                                    <span className="font-bold text-[11px] flex items-center gap-1 text-slate-700">
                                      ⚠️ ปิดปรับปรุง
                                    </span>

                                    <span className="text-[10px] text-slate-500 truncate w-full mt-0.5">
                                      {maintenanceToday.title}
                                    </span>

                                  </div>

                                </td>

                              );

                            }

                            // 🟢 2. วันปกติ
                            const adminItem =
                              getAdminSchedule(
                                day,
                                p
                              );

                            const bookingItem =
                              getUserBooking(
                                dateStr,
                                p
                              );

                            let bgStyle =
                              "bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200/80 text-emerald-800 cursor-pointer";

                            let titleText =
                              "🟢 ว่าง";

                            let subText =
                              p === "พัก 30"
                                ? "คลิกจอง (พัก 30)"
                                : "คลิกจอง";

                            if (adminItem) {

                              bgStyle =
                                "bg-indigo-100/80 border-indigo-300 text-indigo-900 cursor-pointer hover:bg-indigo-200";

                              titleText =
                                `📚 ${adminItem.subject}`;

                              subText =
                                adminItem.teacher;

                            } 
                            else if (
                              bookingItem?.status ===
                              'APPROVED'
                            ) {

                              bgStyle =
                                "bg-rose-100 border-rose-300 text-rose-800 cursor-pointer hover:bg-rose-200";

                              titleText =
                                `🔴 ${bookingItem.userName}`;

                              subText =
                                bookingItem.purpose;

                            } 
                            else if (
                              bookingItem?.status ===
                              'PENDING'
                            ) {

                              bgStyle =
                                "bg-amber-100 border-amber-300 text-amber-800 cursor-pointer hover:bg-amber-200";

                              titleText =
                                `🟡 รออนุมัติ`;

                              subText =
                                bookingItem.userName;

                            }

                            return (

                              <td
                                key={p}
                                onClick={() =>
                                  handleSlotClick(
                                    day,
                                    dateStr,
                                    p
                                  )
                                }
                                className="p-1.5 text-center"
                              >

                                <div
                                  className={`h-18 rounded-2xl border p-1 flex flex-col items-center justify-center transition-all duration-150 shadow-2xs ${bgStyle}`}
                                >

                                  <span className="font-bold text-xs truncate w-full">
                                    {titleText}
                                  </span>

                                  {subText && (
                                    <span className="text-[12px] opacity-80 truncate w-full mt-0.5">
                                      {subText}
                                    </span>
                                  )}

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

        )}

        {/* 📝 Modal จองห้อง */}
        {isModalOpen && targetSlot && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

              <div className="bg-emerald-600 px-6 py-4 text-white">

                <h3 className="font-bold text-base">
                  📝 ส่งคำขอจองห้อง
                </h3>

                <p className="text-xs text-emerald-100 mt-0.5">
                  ห้อง: {selectedRoom?.name}
                  {" "}
                  {selectedRoom?.building
                    ? `(${selectedRoom.building})`
                    : ''
                  }
                  {" | วัน"}
                  {targetSlot.day}
                  {" ("}
                  {targetSlot.date}
                  {") | "}
                  {getPeriodTitle(
                    targetSlot.period
                  )}
                </p>

              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

                <div>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ผู้ขอจอง (บัญชีปัจจุบัน)
                  </label>

                  <div className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-between">

                    <div className="flex items-center gap-2.5">

                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        {currentUser?.name
                          ? currentUser.name.charAt(0)
                          : 'U'
                        }
                      </div>

                      <span>
                        {currentUser?.name ||
                          'กำลังดึงข้อมูล...'
                        }
                      </span>

                    </div>

                  </div>

                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">

                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>🔔</span>
                    ข้อมูลสำหรับรับการแจ้งเตือน
                  </div>

                  <div>

                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      📱 เบอร์โทรศัพท์
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="0812345678"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />

                  </div>

                  <div>

                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      💬 การแจ้งเตือนผ่าน LINE
                    </label>
                    
                    {lineId ? (

                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">

                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">

                          <span className="flex h-2 w-2 relative">

                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>

                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>

                          </span>

                          <span>
                            เชื่อมต่อ LINE เรียบร้อยแล้ว
                          </span>

                        </div>

                        <button
                          type="button"
                          onClick={handleConnectLine}
                          className="text-[11px] font-medium text-emerald-700 hover:underline cursor-pointer"
                        >
                          เปลี่ยนบัญชี
                        </button>

                      </div>

                    ) : (

                      <button
                        type="button"
                        onClick={handleConnectLine}
                        className="w-full py-2 px-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                      >

                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 24 24"
                        >

                          <path d="M12 2C6.48 2 2 5.82 2 10.53c0 4.23 3.6 7.77 8.47 8.42.33.07.78.22.89.5.1.26.07.67.03.94l-.14.86c-.04.26-.2.99.87.54 1.07-.45 5.79-3.41 7.9-5.84C21.46 13.9 22 12.3 22 10.53 22 5.82 17.52 2 12 2z"/>

                        </svg>

                        เชื่อมต่อ LINE เพื่อรับแจ้งเตือน

                      </button>

                    )}

                    {/* 🟢 QR Code สำหรับ Add Friend LINE OA */}
                    <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl flex flex-col items-center gap-2">

                      <span className="text-[11px] font-semibold text-slate-600">
                        📷 สแกนเพื่อเพิ่มเพื่อน LINE OA (รับแจ้งเตือนสถานะการจอง)
                      </span>

                      <QRCodeSVG
                        value={
                          process.env.NEXT_PUBLIC_LINE_OA_URL ||
                          "https://line.me/R/ti/p/@yourlineoaid"
                        }
                        size={120}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="M"
                      />

                    </div>

                  </div>

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วัตถุประสงค์ในการใช้ห้อง
                    <span className="text-rose-500">
                      *
                    </span>
                  </label>

                  <textarea
                    value={purpose}
                    onChange={(e) =>
                      setPurpose(e.target.value)
                    }
                    placeholder="เช่น สอนชดเชย, ประชุมกลุ่ม"
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 text-xs"
                    required
                  ></textarea>

                </div>

              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">

                <button 
                  onClick={() =>
                    setIsModalOpen(false)
                  } 
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>

                <button 
                  onClick={handleSubmitBooking} 
                  className="px-5 py-2 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
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