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
  Clock,
  User,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarDays,
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

const API = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: typeof Megaphone;
  hasResolve: boolean;
}[] = [
  { key: 'GENERAL', label: 'ทั่วไป', icon: Megaphone, hasResolve: false },
  { key: 'DAMAGED', label: 'ห้องชำรุด', icon: Wrench, hasResolve: true },
  { key: 'LOST', label: 'ของหาย', icon: PackageSearch, hasResolve: true },
  { key: 'FOUND', label: 'เจอของ', icon: PackageCheck, hasResolve: true },
  { key: 'MAINTENANCE', label: 'ปิดปรับปรุง', icon: AlertTriangle, hasResolve: false },
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

export default function Publicrelations() {
  const { user } = useAuth();
  const currentUser = user as { id?: number; role?: string } | null;
  const isAdmin = currentUser?.role === 'ADMIN';

  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<CategoryKey | 'ALL'>('ALL');

  const fetchPosts = async (category?: CategoryKey) => {
    setIsLoading(true);
    try {
      const url = category ? `${API}/public-posts?category=${category}` : `${API}/public-posts`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch public posts error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeFilter === 'ALL' ? undefined : activeFilter);
  }, [activeFilter]);

  const filteredPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  const canManage = (post: Post) => isAdmin || post.authorId === currentUser?.id;

  const handleToggleResolved = async (post: Post) => {
    const statusCfg = STATUS_CONFIG[post.category];

    // ป้องกันการกดซ้ำ
    if (resolvingId === post.id) return;

    setResolvingId(post.id);

    try {
      const res = await fetch(`${API}/public-posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resolved: !post.resolved }),
      });

      if (!res.ok) throw new Error('อัปเดตสถานะล้มเหลว');

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, resolved: !p.resolved }
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
        text: 'ไม่สามารถอัปเดตสถานะได้',
        heightAuto: false,
      });

    } finally {
      setResolvingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ลบประกาศนี้?',
      text: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้',
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
      const res = await fetch(`${API}/public-posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('ลบประกาศล้มเหลว');

      setPosts((prev) => prev.filter((p) => p.id !== id));
      Swal.fire({ title: 'ลบสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, heightAuto: false });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถลบประกาศได้', heightAuto: false });
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-app-bg">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ประชาสัมพันธ์</h1>
              <p className="text-xs text-slate-400 mt-0.5">แจ้งห้องชำรุด ของหาย ของเจอ และประกาศต่างๆ ภายในสถาบัน</p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600">
            ทั้งหมด {posts.length} รายการ
          </span>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ทั้งหมด
          </button>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = activeFilter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveFilter(c.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? `${STYLE_MAP[c.key].badge} ${STYLE_MAP[c.key].badgeText} ring-1 ring-inset ring-current`
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* 📋 รายการการ์ดประกาศ (แสดงเต็มรูปแบบ ไม่ตีกรอบ Scroll) */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-48">
                <div className="h-4 bg-slate-100 rounded w-20 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-20 flex flex-col items-center justify-center text-slate-400">
            <Megaphone className="w-10 h-10 mb-3 text-slate-300" />
            <p className="font-semibold text-sm">ยังไม่มีประกาศในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => {
              const cat = CATEGORIES.find((c) => c.key === post.category) || CATEGORIES[0];
              const Icon = cat.icon;
              const style = STYLE_MAP[post.category] || STYLE_MAP.GENERAL;
              const statusCfg = STATUS_CONFIG[post.category];

              return (
                <div
                  key={post.id}
                  className={`relative bg-white rounded-2xl border ${style.border} shadow-sm p-5 pt-6 transition-transform hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${
                    post.resolved ? 'bg-slate-50/70 opacity-80' : ''
                  }`}
                >
                  <span className={`absolute -top-2 left-5 w-4 h-4 rounded-full ${style.pin} ring-4 ring-white shadow-sm`} />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${style.badge} ${style.badgeText}`}>
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

                    <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1.5">{post.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">{post.message}</p>

                    {post.imageUrl && (
                      <div className="mb-3 rounded-2xl overflow-hidden border border-slate-100 max-h-40 bg-slate-50">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          className="w-full h-36 object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    )}

                    {post.category === 'MAINTENANCE' && (post.startDate || post.endDate) && (
                      <div className="mb-3 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-500 shrink-0" />

                        <span>
                          ปิดตั้งแต่{' '}
                          {post.startDate
                            ? new Date(post.startDate).toLocaleDateString('th-TH', {
                                dateStyle: 'medium',
                              })
                            : '-'}
                          {' ถึง '}
                          {post.endDate
                            ? new Date(post.endDate).toLocaleDateString('th-TH', {
                                dateStyle: 'medium',
                              })
                            : '-'}
                        </span>
                      </div>
                    )}

                    {post.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{post.location}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                        {post.author?.picture ? (
                          <img src={post.author.picture} alt="" className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                        <span className="truncate">{post.author?.name || 'ไม่ทราบชื่อ'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>

                    {canManage(post) && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50">
                        {cat.hasResolve && (
                          <button
                            onClick={() => handleToggleResolved(post)}
                            disabled={resolvingId === post.id}
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
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
                          title="ลบประกาศ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}