'use client'

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type CategoryKey = 'GENERAL' | 'DAMAGED' | 'LOST' | 'FOUND' | 'MAINTENANCE';

interface Post {
  id: number;
  category: CategoryKey;
  title: string;
  message: string;
  location?: string;
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

const CATEGORY_BADGE: Record<CategoryKey, string> = {
  GENERAL: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  DAMAGED: 'bg-rose-100 text-rose-700 border-rose-300',
  LOST: 'bg-amber-100 text-amber-700 border-amber-300',
  FOUND: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  MAINTENANCE: 'bg-slate-100 text-slate-700 border-slate-300',
};

export default function AdminPublicRelationsManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<CategoryKey | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">จัดการประกาศ (Admin)</h1>
            <p className="text-sm text-slate-500 mt-1">ดูแล ลบ หรือทำเครื่องหมายประกาศทั้งหมดในระบบ</p>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 ค้นหัวข้อ, รายละเอียด, ผู้โพสต์..."
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 min-w-[240px]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategoryTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategoryTab === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({posts.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCategoryTab(key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategoryTab === key ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {CATEGORY_LABELS[key]} ({counts[key]})
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400">แสดง {filteredPosts.length} รายการ</div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-4">หมวดหมู่</th>
                  <th className="px-5 py-4">หัวข้อ / รายละเอียด</th>
                  <th className="px-5 py-4">ผู้โพสต์</th>
                  <th className="px-5 py-4">เวลาโพสต์</th>
                  <th className="px-5 py-4 text-center">สถานะ</th>
                  <th className="px-5 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-5"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-48"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-24"></div></td>
                      <td className="p-5"><div className="h-5 bg-slate-100 rounded-md w-20"></div></td>
                      <td className="p-5"><div className="h-6 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                      <td className="p-5"><div className="h-8 bg-slate-100 rounded-xl w-16 mx-auto"></div></td>
                    </tr>
                  ))
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="font-semibold text-base">ไม่พบประกาศในหมวดหมู่นี้</p>
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${CATEGORY_BADGE[post.category]}`}>
                          {CATEGORY_LABELS[post.category]}
                        </span>
                      </td>

                      <td className="px-5 py-4 max-w-sm">
                        <div className="font-bold text-slate-800 truncate">{post.title}</div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{post.message}</p>
                        {post.location && <div className="text-[11px] text-slate-400 mt-0.5">📍 {post.location}</div>}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        <div className="font-semibold">{post.author?.name || 'ไม่ทราบชื่อ'}</div>
                        {post.author?.email && <div className="text-xs text-slate-400">{post.author.email}</div>}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(post.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {post.resolved ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✅ แก้ไขแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ⏳ รอดำเนินการ
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {post.category !== 'GENERAL' && post.category !== 'MAINTENANCE' && (
                            <button
                              onClick={() => handleToggleResolved(post)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                post.resolved
                                  ? 'text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                  : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {post.resolved ? 'ยกเลิก' : 'แก้ไขแล้ว'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="ลบประกาศ"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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