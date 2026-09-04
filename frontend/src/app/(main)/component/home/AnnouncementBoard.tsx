'use client'

import { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/hooks/Authcontext";
import {
  Megaphone,
  Wrench,
  PackageSearch,
  PackageCheck,
  AlertTriangle,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Image as ImageIcon,
  X,
  UserCheck,
  CalendarDays,
  Building2,
  DoorOpen
} from "lucide-react";

type CategoryKey = 'GENERAL' | 'DAMAGED' | 'LOST' | 'FOUND' | 'MAINTENANCE';

interface Post {
  id: number;
  category: CategoryKey;
  title: string;
  message: string;
  location?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  authorId: number;
  author: { id: number; name?: string; picture?: string };
  createdAt: string;
  resolved: boolean;
}

interface Room {
  id: number;
  name: string;
  category: string;
  building: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: typeof Megaphone;
  hasResolve: boolean;
  allowImage: boolean;
  adminOnly?: boolean;
}[] = [
  { key: 'GENERAL', label: 'ทั่วไป', icon: Megaphone, hasResolve: false, allowImage: false },
  { key: 'DAMAGED', label: 'ห้องชำรุด', icon: Wrench, hasResolve: true, allowImage: true },
  { key: 'LOST', label: 'ของหาย', icon: PackageSearch, hasResolve: true, allowImage: true },
  { key: 'FOUND', label: 'เจอของ', icon: PackageCheck, hasResolve: true, allowImage: true },
  { key: 'MAINTENANCE', label: 'ปิดปรับปรุง', icon: AlertTriangle, hasResolve: false, allowImage: false, adminOnly: true },
];

const STATUS_CONFIG: Record<CategoryKey, {
  resolvedText: string;
  unresolvedText: string;
  btnResolveText: string;
  btnUnresolveText: string;
}> = {
  DAMAGED: {
    resolvedText: 'แก้ไขแล้ว',
    unresolvedText: 'ยังไม่แก้ไข',
    btnResolveText: 'ทำเครื่องหมายว่าแก้ไขแล้ว',
    btnUnresolveText: 'ยกเลิกการแก้ไข',
  },
  LOST: {
    resolvedText: 'พบของแล้ว',
    unresolvedText: 'ยังไม่พบของ',
    btnResolveText: 'ทำเครื่องหมายว่าพบของแล้ว',
    btnUnresolveText: 'ยกเลิกสถานะพบของ',
  },
  FOUND: {
    resolvedText: 'ส่งคืนแล้ว',
    unresolvedText: 'ยังไม่ส่งคืน',
    btnResolveText: 'ทำเครื่องหมายว่าส่งคืนแล้ว',
    btnUnresolveText: 'ยกเลิกสถานะส่งคืน',
  },
  GENERAL: {
    resolvedText: 'เสร็จสิ้น',
    unresolvedText: 'รอดำเนินการ',
    btnResolveText: 'ทำเครื่องหมายว่าเสร็จสิ้น',
    btnUnresolveText: 'ยกเลิก',
  },
  MAINTENANCE: {
    resolvedText: 'เสร็จสิ้น',
    unresolvedText: 'รอดำเนินการ',
    btnResolveText: 'ทำเครื่องหมายว่าเสร็จสิ้น',
    btnUnresolveText: 'ยกเลิก',
  },
};

const STYLE_MAP: Record<CategoryKey, {
  pin: string; badge: string; badgeText: string; icon: string; border: string;
}> = {
  GENERAL:     { pin: 'bg-indigo-500', badge: 'bg-indigo-50',  badgeText: 'text-indigo-700',  icon: 'text-indigo-500',  border: 'border-indigo-100' },
  DAMAGED:     { pin: 'bg-rose-500',   badge: 'bg-rose-50',    badgeText: 'text-rose-700',    icon: 'text-rose-500',    border: 'border-rose-100' },
  LOST:        { pin: 'bg-amber-500',  badge: 'bg-amber-50',   badgeText: 'text-amber-700',   icon: 'text-amber-500',   border: 'border-amber-100' },
  FOUND:       { pin: 'bg-emerald-500',badge: 'bg-emerald-50', badgeText: 'text-emerald-700', icon: 'text-emerald-500', border: 'border-emerald-100' },
  MAINTENANCE: { pin: 'bg-slate-500',  badge: 'bg-slate-100',  badgeText: 'text-slate-700',   icon: 'text-slate-500',   border: 'border-slate-200' },
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600_000);
  if (hrs < 1) return 'เมื่อสักครู่';
  if (hrs < 24) return `${hrs} ชม.ที่แล้ว`;
  const days = Math.floor(hrs / 24);
  return `${days} วันที่แล้ว`;
}

function formatDateTH(dStr?: string): string {
  if (!dStr) return '';
  const d = new Date(dStr);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit"
  });
}

export default function AnnouncementBoard() {
  const { user } = useAuth();
  const currentUser = user as {
    id?: number;
    name?: string;
    role?: string
  } | null;

  const isAdmin = currentUser?.role === 'ADMIN';

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<CategoryKey | 'ALL'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<CategoryKey>('GENERAL');

  // 🟢 สถานที่ / ห้อง
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // 🟢 ข้อมูลห้อง
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoomCategory, setSelectedRoomCategory] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // 🟢 วันที่เริ่ม - วันสิ้นสุด
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const visibleCategories = useMemo(() => {
    return CATEGORIES.filter(c => !c.adminOnly || isAdmin);
  }, [isAdmin]);

  const currentCategoryConfig = CATEGORIES.find(c => c.key === category);
  const allowImage = currentCategoryConfig?.allowImage ?? false;

  // =========================================================
  // ดึงประกาศของผู้ใช้
  // =========================================================
  const fetchMyPosts = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);

    try {
      const res = await fetch(`${API}/public-posts`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data: Post[] = await res.json();

        const myPosts = data.filter(
          (p) => Number(p.authorId) === Number(currentUser.id)
        );

        setPosts(myPosts);
      }
    } catch (err) {
      console.error("Fetch my posts error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [currentUser?.id]);

  // =========================================================
  // ดึงข้อมูลห้อง
  // =========================================================
  useEffect(() => {
    fetch(`${API}/rooms`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data);
        }
      })
      .catch(err => {
        console.error("Fetch rooms error:", err);
      });
  }, []);

  // =========================================================
  // รายการอาคาร
  // =========================================================
  const buildings = useMemo(() => {
    return Array.from(
      new Set(
        rooms
          .map(room => room.building)
          .filter(Boolean)
      )
    ).sort();
  }, [rooms]);

  // =========================================================
  // รายการประเภทห้อง
  // กรองตามอาคาร
  // =========================================================
  const roomCategories = useMemo(() => {
    const filtered = selectedBuilding
      ? rooms.filter(room => room.building === selectedBuilding)
      : rooms;

    return Array.from(
      new Set(
        filtered
          .map(room => room.category)
          .filter(Boolean)
      )
    ).sort();
  }, [rooms, selectedBuilding]);

  // =========================================================
  // รายการห้อง
  // กรองตามอาคาร + ประเภทห้อง
  // =========================================================
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchBuilding =
        !selectedBuilding ||
        room.building === selectedBuilding;

      const matchCategory =
        !selectedRoomCategory ||
        room.category === selectedRoomCategory;

      return matchBuilding && matchCategory;
    });
  }, [rooms, selectedBuilding, selectedRoomCategory]);

  // =========================================================
  // เมื่อเปลี่ยนอาคาร
  // =========================================================
  const handleBuildingChange = (value: string) => {
    setSelectedBuilding(value);

    // reset ประเภทห้องและห้อง
    setSelectedRoomCategory('');
    setSelectedRoomId('');
    setLocation('');
  };

  // =========================================================
  // เมื่อเปลี่ยนประเภทห้อง
  // =========================================================
  const handleRoomCategoryChange = (value: string) => {
    setSelectedRoomCategory(value);

    // reset ห้อง
    setSelectedRoomId('');
    setLocation('');
  };

  // =========================================================
  // เมื่อเลือกห้อง
  // =========================================================
  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);

    const room = rooms.find(
      r => Number(r.id) === Number(roomId)
    );

    if (room) {
      setLocation(room.name);
    } else {
      setLocation('');
    }
  };

  // =========================================================
  // Reset ห้องทั้งหมด
  // =========================================================
  const resetRoomSelection = () => {
    setSelectedBuilding('');
    setSelectedRoomCategory('');
    setSelectedRoomId('');
    setLocation('');
  };

  // =========================================================
  // Filter ประกาศ
  // =========================================================
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (activeFilter !== 'ALL') {
      result = result.filter(
        p => p.category === activeFilter
      );
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [posts, activeFilter]);

  // =========================================================
  // รูปภาพ
  // =========================================================
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: 'ไฟล์ไม่ถูกต้อง',
        text: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
        icon: 'warning',
        heightAuto: false,
      });

      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'ไฟล์มีขนาดใหญ่เกินไป',
        text: 'กรุณาอัปโหลดรูปภาพขนาดไม่เกิน 5MB',
        icon: 'warning',
        heightAuto: false,
      });

      e.target.value = '';
      return;
    }

    setImageFile(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));
  };

  const clearSelectedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
  };

  // =========================================================
  // สร้างประกาศ
  // =========================================================
  const handleCreatePost = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        heightAuto: false
      });

      return;
    }

    // MAINTENANCE ต้องเลือกห้อง
    if (
      category === 'MAINTENANCE' &&
      !selectedRoomId
    ) {
      Swal.fire({
        title: 'กรุณาเลือกห้อง',
        text: 'กรุณาเลือกอาคาร ประเภทห้อง และห้องที่ต้องการปิดปรับปรุง',
        icon: 'warning',
        heightAuto: false,
      });

      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('category', category);
      formData.append('title', title.trim());
      formData.append('message', message.trim());

      if (location.trim()) {
        formData.append(
          'location',
          location.trim()
        );
      }

      // 🟢 ส่ง roomId เมื่อเลือกห้อง
      if (selectedRoomId) {
        formData.append(
          'roomId',
          selectedRoomId
        );
      }

      if (allowImage && imageFile) {
        formData.append(
          'image',
          imageFile
        );
      }

      if (
        category === 'MAINTENANCE' &&
        startDate
      ) {
        formData.append(
          'startDate',
          startDate
        );
      }

      if (
        category === 'MAINTENANCE' &&
        endDate
      ) {
        formData.append(
          'endDate',
          endDate
        );
      }

      const res = await fetch(
        `/api/public-posts`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData =
          await res.json().catch(() => null);

        console.error(
          'Create post error:',
          {
            status: res.status,
            statusText: res.statusText,
            data: errorData,
          }
        );

        throw new Error(
          errorData?.message
            ? Array.isArray(errorData.message)
              ? errorData.message.join(', ')
              : errorData.message
            : `HTTP ${res.status}`
        );
      }

      setIsModalOpen(false);

      setTitle('');
      setMessage('');
      setLocation('');

      clearSelectedImage();

      setStartDate('');
      setEndDate('');
      setCategory('GENERAL');

      resetRoomSelection();

      fetchMyPosts();

      Swal.fire({
        title: 'เพิ่มประกาศเรียบร้อย!',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
        heightAuto: false
      });

    } catch (err) {
      console.error(
        'Create post error:',
        err
      );

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text:
          err instanceof Error
            ? err.message
            : 'ไม่สามารถเพิ่มประกาศได้',
        heightAuto: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // Toggle Resolved
  // =========================================================
  const handleToggleResolved = async (
    post: Post
  ) => {
    const statusCfg =
      STATUS_CONFIG[post.category];

    if (resolvingId === post.id) return;

    setResolvingId(post.id);

    try {
      const res = await fetch(
        `/api/public-posts/${post.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            resolved: !post.resolved
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          'อัปเดตสถานะล้มเหลว'
        );
      }

      setPosts(prev =>
        prev.map(p =>
          p.id === post.id
            ? {
                ...p,
                resolved: !p.resolved
              }
            : p
        )
      );

      Swal.fire({
        title: !post.resolved
          ? statusCfg.resolvedText
          : statusCfg.unresolvedText,
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
        heightAuto: false,
      });

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        heightAuto: false,
      });

    } finally {
      setResolvingId(null);
    }
  };

  // =========================================================
  // Delete
  // =========================================================
  const handleDelete = async (
    id: number
  ) => {
    const result =
      await Swal.fire({
        title: 'ลบประกาศนี้?',
        text: 'คุณต้องการลบรายการประกาศของคุณใช่หรือไม่',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        heightAuto: false,
      });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${API}/public-posts/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!res.ok) {
        throw new Error(
          'ลบประกาศล้มเหลว'
        );
      }

      setPosts(prev =>
        prev.filter(p => p.id !== id)
      );

      Swal.fire({
        title: 'ลบสำเร็จ',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
        heightAuto: false
      });

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดในการลบ',
        heightAuto: false
      });
    }
  };

  return (
    <div className="mt-8 bg-app-bg space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl shadow-sm border border-slate-200/80 p-4 sm:p-6">

        <div className="flex items-center gap-3 min-w-0">

          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              ประชาสัมพันธ์
            </h1>

            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
              แจ้งห้องชำรุด ของหาย ของเจอ และประกาศต่างๆ ภายในสถาบัน
            </p>
          </div>

        </div>

        <button
          onClick={() => {
            setCategory('GENERAL');
            resetRoomSelection();
            setStartDate('');
            setEndDate('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มประกาศ</span>
        </button>

      </div>

      {/* =====================================================
          FILTER
      ===================================================== */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

        <button
          onClick={() =>
            setActiveFilter('ALL')
          }
          className={`px-3 sm:px-4 py-2 rounded-2xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ทั้งหมด
        </button>

        {visibleCategories.map(c => {

          const Icon = c.icon;
          const active =
            activeFilter === c.key;

          return (
            <button
              key={c.key}
              onClick={() =>
                setActiveFilter(c.key)
              }
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                active
                  ? `${STYLE_MAP[c.key].badge} ${STYLE_MAP[c.key].badgeText} ring-1 ring-inset ring-current shadow-xs`
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {c.label}
            </button>
          );
        })}

      </div>

      {/* =====================================================
          POSTS
      ===================================================== */}
      {isLoading ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200 p-5 animate-pulse h-48"
            >
              <div className="h-4 bg-slate-100 rounded w-20 mb-3"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-full mb-1"></div>
              <div className="h-3 bg-slate-100 rounded w-5/6"></div>
            </div>
          ))}

        </div>

      ) : filteredPosts.length === 0 ? (

        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 flex flex-col items-center justify-center text-slate-400">

          <Megaphone className="w-10 h-10 mb-2 text-slate-300" />

          <p className="font-bold text-sm">
            คุณยังไม่มีรายการประกาศในหมวดนี้
          </p>

          <p className="text-xs text-slate-400 mt-1">
            กดปุ่ม "เพิ่มประกาศ" ด้านบนเพื่อเริ่มสร้างประกาศของคุณ
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

          {filteredPosts.map(post => {

            const cat =
              CATEGORIES.find(
                c => c.key === post.category
              ) || CATEGORIES[0];

            const Icon = cat.icon;

            const style =
              STYLE_MAP[post.category] ||
              STYLE_MAP.GENERAL;

            const statusCfg =
              STATUS_CONFIG[post.category];

            return (
              <div
                key={post.id}
                className={`relative bg-white rounded-3xl border ${style.border} shadow-sm hover:shadow-md p-4 sm:p-5 pt-6 transition-all flex flex-col justify-between min-w-0 ${
                  post.resolved
                    ? 'bg-slate-50/70 opacity-80'
                    : ''
                }`}
              >

                <span
                  className={`absolute -top-2 left-5 w-4 h-4 rounded-full ${style.pin} ring-4 ring-white shadow-sm`}
                />

                <div>

                  <div className="flex items-center justify-between mb-3">

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${style.badge} ${style.badgeText}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </span>

                    {cat.hasResolve && (
                      post.resolved ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {statusCfg.resolvedText}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {statusCfg.unresolvedText}
                        </span>
                      )
                    )}

                  </div>

                  <h3 className="font-bold text-slate-800 text-sm sm:text-sm leading-snug mb-1.5 break-words">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3 break-words">
                    {post.message}
                  </p>

                  {/* วันที่ปิดปรับปรุง */}
                  {post.category === 'MAINTENANCE' &&
                    (post.startDate || post.endDate) && (

                    <div className="mb-3 px-2.5 sm:px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 flex items-start gap-2">

                      <CalendarDays className="w-4 h-4 text-slate-500 shrink-0" />

                      <span className="break-words">
                        ช่วงเวลาปิด: {formatDateTH(post.startDate)} - {formatDateTH(post.endDate) || 'จนกว่าจะแจ้งให้ทราบ'}
                      </span>

                    </div>
                  )}

                  {post.imageUrl && (
                    <div className="mb-3 rounded-2xl overflow-hidden border border-slate-100 max-h-40 bg-slate-50">

                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-full h-32 sm:h-36 object-cover hover:scale-105 transition-transform duration-300"
                      />

                    </div>
                  )}

                  {post.location && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">

                      <MapPin className="w-3.5 h-3.5" />

                      <span>
                        {post.location}
                      </span>

                    </div>
                  )}

                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2.5">

                  <div className="flex items-center justify-between text-[11px] text-slate-400">

                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>ประกาศของคุณ</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {timeAgo(post.createdAt)}
                      </span>
                    </div>

                  </div>

                  <div className="flex items-center gap-2 min-w-0">

                    {cat.hasResolve && (
                      <button
                        onClick={() =>
                          handleToggleResolved(post)
                        }
                        disabled={
                          resolvingId === post.id
                        }
                        className={`flex-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                          resolvingId === post.id
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : post.resolved
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
                        }`}
                      >
                        {resolvingId === post.id ? (
                          <span className="flex items-center justify-center gap-1.5">

                            <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />

                            กำลังดำเนินการ...

                          </span>
                        ) : (
                          post.resolved
                            ? statusCfg.btnUnresolveText
                            : statusCfg.btnResolveText
                        )}
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleDelete(post.id)
                      }
                      className="p-2 sm:p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 transition-colors cursor-pointer ml-auto shrink-0"
                      title="ลบประกาศ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* =====================================================
          MODAL เพิ่มประกาศ
      ===================================================== */}
      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">

          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="bg-slate-800 px-4 sm:px-6 py-4 text-white flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Megaphone className="w-5 h-5 text-indigo-400" />

                <h3 className="font-bold text-base">
                  เพิ่มประกาศใหม่
                </h3>

              </div>

              <button
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <form
              onSubmit={handleCreatePost}
              className="p-4 sm:p-6 space-y-4 max-h-[calc(92vh-64px)] sm:max-h-[75vh] overflow-y-auto"
            >

              {/* =================================================
                  CATEGORY
              ================================================= */}
              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  หมวดหมู่ประกาศ
                  <span className="text-rose-500">
                    {' '}*
                  </span>
                </label>

                <select
                  value={category}
                  onChange={(e) => {

                    const newCategory =
                      e.target.value as CategoryKey;

                    setCategory(newCategory);

                    // reset ห้องเมื่อเปลี่ยนหมวด
                    resetRoomSelection();

                    // reset วันที่
                    setStartDate('');
                    setEndDate('');

                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                >

                  {visibleCategories.map(c => (
                    <option
                      key={c.key}
                      value={c.key}
                    >
                      {c.label}
                    </option>
                  ))}

                </select>

              </div>

              {/* =================================================
                  TITLE
              ================================================= */}
              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  หัวข้อประกาศ
                  <span className="text-rose-500">
                    {' '}*
                  </span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="เช่น ปิดปรับปรุงห้อง 111, พบหูฟังบลูทูธ"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />

              </div>

              {/* =================================================
                  MAINTENANCE DATE
              ================================================= */}
              {category === 'MAINTENANCE' && (

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 animate-in fade-in duration-200">

                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">

                    <CalendarDays className="w-4 h-4 text-slate-600" />

                    <span>
                      กำหนดช่วงเวลาปิดปรับปรุง
                      <span className="text-rose-500">
                        {' '}*
                      </span>
                    </span>

                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div>

                      <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                        วันที่เริ่มปิด
                      </span>

                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                          setStartDate(e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required={
                          category === 'MAINTENANCE'
                        }
                      />

                    </div>

                    <div>

                      <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                        วันสุดท้ายที่ปิด
                      </span>

                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) =>
                          setEndDate(e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required={
                          category === 'MAINTENANCE'
                        }
                      />

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  สถานที่ / ห้องที่เกี่ยวข้อง
                  อาคาร → ประเภทห้อง → ห้อง
              ================================================= */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">

                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">

                  <MapPin className="w-4 h-4 text-indigo-600" />

                  <span>
                    สถานที่ / ห้องที่เกี่ยวข้อง
                    {category === 'MAINTENANCE' && (
                      <span className="text-rose-500">
                        {' '}*
                      </span>
                    )}
                  </span>

                </label>

                {/* ================================
                    อาคาร
                ================================= */}
                <div>

                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">

                    <Building2 className="w-3.5 h-3.5" />

                    อาคาร

                  </label>

                  <select
                    value={selectedBuilding}
                    onChange={(e) =>
                      handleBuildingChange(
                        e.target.value
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >

                    <option value="">
                      -- เลือกอาคาร --
                    </option>

                    {buildings.map(building => (
                      <option
                        key={building}
                        value={building}
                      >
                        {building}
                      </option>
                    ))}

                  </select>

                </div>

                {/* ================================
                    ประเภทห้อง
                ================================= */}
                <div>

                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">

                    <DoorOpen className="w-3.5 h-3.5" />

                    ประเภทห้อง

                  </label>

                  <select
                    value={selectedRoomCategory}
                    onChange={(e) =>
                      handleRoomCategoryChange(
                        e.target.value
                      )
                    }
                    disabled={
                      roomCategories.length === 0
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      roomCategories.length === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : ''
                    }`}
                  >

                    <option value="">
                      -- เลือกประเภทห้อง --
                    </option>

                    {roomCategories.map(roomCategory => (
                      <option
                        key={roomCategory}
                        value={roomCategory}
                      >
                        {roomCategory}
                      </option>
                    ))}

                  </select>

                </div>

                {/* ================================
                    ห้อง
                ================================= */}
                <div>

                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">

                    <DoorOpen className="w-3.5 h-3.5" />

                    ห้อง
                    {category === 'MAINTENANCE' && (
                      <span className="text-rose-500">
                        {' '}*
                      </span>
                    )}

                  </label>

                  <select
                    value={selectedRoomId}
                    onChange={(e) =>
                      handleRoomChange(
                        e.target.value
                      )
                    }
                    disabled={
                      filteredRooms.length === 0
                    }
                    required={
                      category === 'MAINTENANCE'
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      filteredRooms.length === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : ''
                    }`}
                  >

                    <option value="">
                      {selectedBuilding ||
                      selectedRoomCategory
                        ? '-- เลือกห้อง --'
                        : '-- เลือกอาคารและประเภทห้องก่อน --'}
                    </option>

                    {filteredRooms.map(room => (

                      <option
                        key={room.id}
                        value={room.id}
                      >
                        {room.name}
                      </option>

                    ))}

                  </select>

                </div>

                {/* ================================
                    แสดงสถานที่ที่เลือก
                ================================= */}
                {selectedRoomId && location && (

                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100">

                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />

                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold text-indigo-400">
                        สถานที่ที่เลือก
                      </p>

                      <p className="text-xs font-bold text-indigo-700 truncate">
                        {selectedBuilding}
                        {' • '}
                        {selectedRoomCategory}
                        {' • '}
                        {location}
                      </p>

                    </div>

                  </div>

                )}

              </div>

              {/* =================================================
                  MESSAGE
              ================================================= */}
              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  รายละเอียด
                  <span className="text-rose-500">
                    {' '}*
                  </span>
                </label>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="กรอกรายละเอียดเพิ่มเติม..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />

              </div>

              {/* =================================================
                  IMAGE
              ================================================= */}
              {allowImage && (

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">

                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">

                    <ImageIcon className="w-4 h-4 text-indigo-600" />

                    <span>
                      แนบรูปภาพประกอบ
                      (สำหรับหมวด {currentCategoryConfig?.label})
                    </span>

                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />

                  {imagePreview && (

                    <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-32">

                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                      />

                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  )}

                </div>
              )}

              {/* =================================================
                  BUTTON
              ================================================= */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-2xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-2xl text-xs font-bold text-white shadow-md transition-all ${
                    isSubmitting
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  }`}
                >

                  {isSubmitting ? (

                    <span className="flex items-center gap-2">

                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                      กำลังประกาศ...

                    </span>

                  ) : (
                    'บันทึกประกาศ'
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}