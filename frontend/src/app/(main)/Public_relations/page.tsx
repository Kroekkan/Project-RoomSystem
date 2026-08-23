'use client'

import { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/hooks/useAuth";
import {
  Megaphone,
  Wrench,
  PackageSearch,
  PackageCheck,
  AlertTriangle,
  Plus,
  Clock,
  User,
  Trash2,
  CheckCircle2,
  MapPin,
} from "lucide-react";

type CategoryKey = 'GENERAL' | 'DAMAGED' | 'LOST' | 'FOUND' | 'MAINTENANCE';

interface Post {
  id: number;
  category: CategoryKey;
  title: string;
  message: string;
  location?: string;
  authorId: number;
  author: { id: number; name?: string; picture?: string };
  createdAt: string;
  resolved: boolean;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  const handleCreatePost = async () => {
    if (!currentUser?.id) {
      Swal.fire({ icon: 'warning', title: 'กรุณาเข้าสู่ระบบก่อนโพสต์ประกาศ', heightAuto: false });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'ประกาศใหม่',
      html: `
        <div style="text-align:left; font-size:14px;">
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:600; margin-bottom:4px;">หมวดหมู่</label>
            <select id="swal-category" class="swal2-select" style="display:block; width:100%; margin:0; box-sizing:border-box;">
              ${CATEGORIES.map((c) => `<option value="${c.key}">${c.label}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:600; margin-bottom:4px;">หัวข้อ</label>
            <input id="swal-title" class="swal2-input" placeholder="เช่น โปรเจกเตอร์ห้อง 301 เสีย" style="display:block; width:100%; margin:0; box-sizing:border-box;">
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:600; margin-bottom:4px;">ห้อง / สถานที่ (ถ้ามี)</label>
            <input id="swal-location" class="swal2-input" placeholder="เช่น ห้อง 301" style="display:block; width:100%; margin:0; box-sizing:border-box;">
          </div>
          <div>
            <label style="display:block; font-weight:600; margin-bottom:4px;">รายละเอียด</label>
            <textarea id="swal-message" class="swal2-textarea" placeholder="อธิบายรายละเอียด" style="display:block; width:100%; margin:0; box-sizing:border-box;"></textarea>
          </div>
        </div>
      `,
      width: 480,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'โพสต์ประกาศ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5',
      heightAuto: false,
      preConfirm: () => {
        const category = (document.getElementById('swal-category') as HTMLSelectElement).value as CategoryKey;
        const title = (document.getElementById('swal-title') as HTMLInputElement).value.trim();
        const location = (document.getElementById('swal-location') as HTMLInputElement).value.trim();
        const message = (document.getElementById('swal-message') as HTMLTextAreaElement).value.trim();

        if (!title || !message) {
          Swal.showValidationMessage('กรุณากรอกหัวข้อและรายละเอียด');
          return;
        }
        return { category, title, location, message };
      },
    });

    if (!formValues) return;

    try {
      const res = await fetch(`${API}/public-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category: formValues.category,
          title: formValues.title,
          message: formValues.message,
          location: formValues.location || undefined,
        }),
      });

      if (!res.ok) throw new Error('โพสต์ประกาศล้มเหลว');

      await fetchPosts(activeFilter === 'ALL' ? undefined : activeFilter);
      Swal.fire({ title: 'โพสต์สำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false, heightAuto: false });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถโพสต์ประกาศได้', heightAuto: false });
    }
  };

  const handleToggleResolved = async (post: Post) => {
    try {
      const res = await fetch(`${API}/public-posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resolved: !post.resolved }),
      });

      if (!res.ok) throw new Error('อัปเดตสถานะล้มเหลว');

      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, resolved: !p.resolved } : p)));
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถอัปเดตสถานะได้', heightAuto: false });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ลบประกาศนี้?',
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
    <div className="p-6 md:p-10 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ประชาสัมพันธ์</h1>
              <p className="text-xs text-slate-400 mt-0.5">แจ้งห้องชำรุด ของหาย ของเจอ และประกาศต่างๆ</p>
            </div>
          </div>

          <button
            onClick={handleCreatePost}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            ประกาศใหม่
          </button>
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

        {/* Board */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-44">
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
              const cat = CATEGORIES.find((c) => c.key === post.category)!;
              const Icon = cat.icon;
              const style = STYLE_MAP[post.category];

              return (
                <div
                  key={post.id}
                  className={`relative bg-white rounded-2xl border ${style.border} shadow-sm p-5 pt-6 transition-transform hover:-translate-y-0.5 hover:shadow-md ${
                    post.resolved ? 'opacity-60' : ''
                  }`}
                >
                  <span className={`absolute -top-2 left-5 w-4 h-4 rounded-full ${style.pin} ring-4 ring-white shadow-sm`} />

                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${style.badge} ${style.badgeText}`}>
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </span>
                    {post.resolved && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        แก้ไขแล้ว
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1.5">{post.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">{post.message}</p>

                  {post.location && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                      <MapPin className="w-3 h-3" />
                      {post.location}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author?.name || 'ไม่ทราบชื่อ'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(post.createdAt)}
                    </div>
                  </div>

                  {canManage(post) && (
                    <div className="flex items-center gap-2 mt-3">
                      {cat.hasResolve && (
                        <button
                          onClick={() => handleToggleResolved(post)}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            post.resolved
                              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {post.resolved ? 'ยกเลิกการแก้ไข' : 'ทำเครื่องหมายว่าแก้ไขแล้ว'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบประกาศ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}