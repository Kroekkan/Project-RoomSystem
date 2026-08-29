'use client'

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Megaphone,
  Wrench,
  PackageSearch,
  PackageCheck,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ImageIcon,
  X,
  Eye
} from "lucide-react";

type CategoryKey = 'GENERAL' | 'DAMAGED' | 'LOST' | 'FOUND' | 'MAINTENANCE';

interface Post {
  id: number;
  category: CategoryKey;
  title: string;
  message: string;
  location?: string;
  imageUrl?: string;
  resolved: boolean;
  author: { id: number; name?: string; email?: string };
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  GENERAL: 'ทั่วไป',
  DAMAGED: 'ห้องชำรุด',
  LOST: 'ของหาย',
  FOUND: 'เจอของ',
  MAINTENANCE: 'ปิดปรับปรุง',
};

const CATEGORY_ICONS: Record<CategoryKey, any> = {
  GENERAL: Megaphone,
  DAMAGED: Wrench,
  LOST: PackageSearch,
  FOUND: PackageCheck,
  MAINTENANCE: AlertTriangle,
};

const CATEGORY_BADGE: Record<CategoryKey, string> = {
  GENERAL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DAMAGED: 'bg-rose-50 text-rose-700 border-rose-200',
  LOST: 'bg-amber-50 text-amber-700 border-amber-200',
  FOUND: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MAINTENANCE: 'bg-slate-100 text-slate-700 border-slate-200',
};

const STATUS_CONFIG: Record<CategoryKey, {
  resolvedText: string;
  unresolvedText: string;
  btnResolveText: string;
  btnUnresolveText: string;
  hasResolve: boolean;
}> = {
  DAMAGED: {
    resolvedText: 'แก้ไขแล้ว',
    unresolvedText: 'ยังไม่แก้ไข',
    btnResolveText: 'แก้ไขแล้ว',
    btnUnresolveText: 'ยกเลิก',
    hasResolve: true,
  },
  LOST: {
    resolvedText: 'พบของแล้ว',
    unresolvedText: 'ยังไม่พบของ',
    btnResolveText: 'พบของแล้ว',
    btnUnresolveText: 'ยกเลิก',
    hasResolve: true,
  },
  FOUND: {
    resolvedText: 'ส่งคืนแล้ว',
    unresolvedText: 'ยังไม่ส่งคืน',
    btnResolveText: 'ส่งคืนแล้ว',
    btnUnresolveText: 'ยกเลิก',
    hasResolve: true,
  },
  GENERAL: {
    resolvedText: 'เสร็จสิ้น',
    unresolvedText: 'รอดำเนินการ',
    btnResolveText: 'เสร็จสิ้น',
    btnUnresolveText: 'ยกเลิก',
    hasResolve: false,
  },
  MAINTENANCE: {
    resolvedText: 'เสร็จสิ้น',
    unresolvedText: 'รอดำเนินการ',
    btnResolveText: 'เสร็จสิ้น',
    btnUnresolveText: 'ยกเลิก',
    hasResolve: false,
  },
};

export default function AdminPublicRelationsManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<CategoryKey | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<CategoryKey>('MAINTENANCE');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);

  const currentCategoryConfig = Object.keys(CATEGORY_LABELS).includes(category);
  const allowImage = ['DAMAGED', 'LOST', 'FOUND'].includes(category);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => fetchPosts(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(`${API}/public-posts`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch public posts error:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({ title: 'ไฟล์มีขนาดใหญ่เกินไป', text: 'กรุณาอัปโหลดรูปภาพขนาดไม่เกิน 5MB', icon: 'warning', heightAuto: false });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      Swal.fire({ title: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: 'warning', timer: 1500, showConfirmButton: false, heightAuto: false });
      return;
    }

    try {
      const res = await fetch(`${API}/public-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category,
          title: title.trim(),
          message: message.trim(),
          location: location.trim() || undefined,
          imageUrl: allowImage && imageFile ? imageFile : undefined,
        }),
      });

      if (!res.ok) throw new Error('โพสต์ประกาศล้มเหลว');

      setIsModalOpen(false);
      setTitle('');
      setMessage('');
      setLocation('');
      setImageFile(null);
      setCategory('MAINTENANCE');

      fetchPosts(false);
      Swal.fire({ title: 'เพิ่มประกาศเรียบร้อย!', icon: 'success', timer: 1200, showConfirmButton: false, heightAuto: false });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเพิ่มประกาศได้', heightAuto: false });
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
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, resolved: !p.resolved } : p)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ลบประกาศนี้?',
      text: 'ประกาศนี้จะถูกลบออกจากระบบอย่างถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      heightAuto: false,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/public-posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        Swal.fire({ title: 'ลบรายการสำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false, heightAuto: false });
      } else if (res.status === 403) {
        Swal.fire({ title: 'ไม่มีสิทธิ์ลบประกาศนี้', icon: 'error', heightAuto: false });
      } else {
        Swal.fire({ title: 'เกิดข้อผิดพลาด', icon: 'error', heightAuto: false });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', icon: 'error', heightAuto: false });
    }
  };

  // 🟢 ฟังก์ชันเปิด Modal ดูรายละเอียดข้อความฉบับเต็ม
  const handleViewDetail = (post: Post) => {
    Swal.fire({
      title: `<div style="font-size:16px; font-weight:bold; text-align:left; color:#1e293b; line-height:1.4; word-break:break-word;">${post.title}</div>`,
      html: `
        <div style="text-align:left; font-size:13px; color:#475569;">
          <div style="margin-bottom:10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:11px; font-weight:bold; padding:3px 10px; border-radius:9999px; background:#f1f5f9; color:#334155; border:1px solid #e2e8f0;">
              หมวดหมู่: ${CATEGORY_LABELS[post.category]}
            </span>
            ${post.location ? `<span style="font-size:12px; color:#64748b;">📍 ${post.location}</span>` : ''}
          </div>
          
          <div style="margin-bottom:14px; background:#f8fafc; padding:14px; border-radius:14px; border:1px solid #e2e8f0; white-space:pre-wrap; line-height:1.6; word-break:break-word; max-height:240px; overflow-y:auto;">
            ${post.message}
          </div>

          ${post.imageUrl ? `
            <div style="margin-bottom:14px; text-align:center;">
              <img src="${post.imageUrl}" style="max-height:220px; width:100%; object-fit:cover; border-radius:14px; border:1px solid #e2e8f0;" />
            </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:10px;">
            <span>ผู้โพสต์: ${post.author?.name || 'ไม่ทราบชื่อ'}</span>
            <span>${new Date(post.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#4f46e5',
      width: 500,
      heightAuto: false,
    });
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedCategoryTab !== 'ALL' && p.category !== selectedCategoryTab) return false;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchMessage = p.message?.toLowerCase().includes(q);
      const matchAuthor = p.author?.name?.toLowerCase().includes(q);
      return matchTitle || matchMessage || matchAuthor;
    }
    return true;
  });

  const counts = (Object.keys(CATEGORY_LABELS) as CategoryKey[]).reduce((acc, key) => {
    acc[key] = posts.filter((p) => p.category === key).length;
    return acc;
  }, {} as Record<CategoryKey, number>);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>จัดการประกาศทั้งหมด (Admin)</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-extrabold">👑 แอดมิน</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">ตรวจสอบ ดูรายละเอียด เปลี่ยนสถานะ หรือลบประกาศในระบบ</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาประกาศ, ผู้โพสต์..."
                className="pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-w-[220px]"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มประกาศ</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategoryTab('ALL')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategoryTab === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ทั้งหมด ({posts.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((key) => {
              const Icon = CATEGORY_ICONS[key];
              const isSelected = selectedCategoryTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategoryTab(key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{CATEGORY_LABELS[key]} ({counts[key]})</span>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-slate-400 font-medium">แสดง {filteredPosts.length} รายการ</div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-4">หมวดหมู่</th>
                  <th className="px-5 py-4 min-w-[280px]">หัวข้อ / รายละเอียด</th>
                  <th className="px-5 py-4">รูปภาพแนบ</th>
                  <th className="px-5 py-4">ผู้โพสต์</th>
                  <th className="px-5 py-4">เวลาโพสต์</th>
                  <th className="px-5 py-4 text-center">สถานะ</th>
                  <th className="px-5 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-5"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-48"></div></td>
                      <td className="p-5"><div className="h-8 bg-slate-100 rounded-lg w-10"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-24"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-20"></div></td>
                      <td className="p-5"><div className="h-6 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                      <td className="p-5"><div className="h-8 bg-slate-100 rounded-xl w-16 mx-auto"></div></td>
                    </tr>
                  ))
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="font-semibold text-sm">ไม่พบประกาศในหมวดหมู่นี้</p>
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => {
                    const statusCfg = STATUS_CONFIG[post.category];
                    const Icon = CATEGORY_ICONS[post.category];

                    return (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* หมวดหมู่ */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold border ${CATEGORY_BADGE[post.category]}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span>{CATEGORY_LABELS[post.category]}</span>
                          </span>
                        </td>

                        {/* 🟢 หัวข้อ / รายละเอียด (ย่อข้อความ + มีปุ่มดูเพิ่มเติม) */}
                        <td className="px-5 py-4 max-w-[280px]">
                          <div className="font-bold text-slate-800 truncate text-xs" title={post.title}>
                            {post.title}
                          </div>
                          <p className="text-slate-500 truncate text-xs mt-0.5" title={post.message}>
                            {post.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100">
                            {post.location ? (
                              <span className="text-[11px] text-slate-400 flex items-center gap-0.5 truncate max-w-[140px]">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{post.location}</span>
                              </span>
                            ) : (
                              <span></span>
                            )}

                            {/* 👁️ ปุ่มดูรายละเอียดเต็ม */}
                            <button
                              onClick={() => handleViewDetail(post)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg transition-colors ml-auto"
                            >
                              <Eye className="w-3 h-3" />
                              <span>ดูเพิ่มเติม</span>
                            </button>
                          </div>
                        </td>

                        {/* รูปภาพแนบ */}
                        <td className="px-5 py-4">
                          {post.imageUrl ? (
                            <button
                              onClick={() => handleViewDetail(post)}
                              className="group relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer shrink-0"
                              title="คลิกเพื่อดูรูปใหญ่"
                            >
                              <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </button>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* ผู้โพสต์ */}
                        <td className="px-5 py-4 text-slate-700">
                          <div className="font-semibold">{post.author?.name || 'ไม่ทราบชื่อ'}</div>
                          {post.author?.email && <div className="text-[11px] text-slate-400">{post.author.email}</div>}
                        </td>

                        {/* เวลา */}
                        <td className="px-5 py-4 text-slate-500">
                          {new Date(post.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>

                        {/* สถานะ */}
                        <td className="px-5 py-4 text-center">
                          {statusCfg.hasResolve ? (
                            post.resolved ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {statusCfg.resolvedText}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {statusCfg.unresolvedText}
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600">
                              -
                            </span>
                          )}
                        </td>

                        {/* ปุ่มจัดการ */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {statusCfg.hasResolve && (
                              <button
                                onClick={() => handleToggleResolved(post)}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                                  post.resolved
                                    ? 'text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {post.resolved ? statusCfg.btnUnresolveText : statusCfg.btnResolveText}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="ลบประกาศ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Modal เพิ่มประกาศสำหรับ Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-800 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">เพิ่มประกาศใหม่ (Admin)</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">หมวดหมู่ประกาศ <span className="text-rose-500">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryKey)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                >
                  {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map(key => (
                    <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">หัวข้อประกาศ <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ปิดปรับปรุงระบบปรับอากาศห้อง 201"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">สถานที่ / ห้องที่เกี่ยวข้อง</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น ห้อง 201, อาคาร 1 ชั้น 2"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">รายละเอียด <span className="text-rose-500">*</span></label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="กรอกรายละเอียดประกาศ..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                ></textarea>
              </div>

              {allowImage && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>แนบรูปภาพประกอบ (สำหรับหมวด {CATEGORY_LABELS[category]})</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {imageFile && (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-32">
                      <img src={imageFile} alt="Preview" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
                >
                  บันทึกประกาศ
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}