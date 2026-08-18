'use client'

import { useEffect, useState } from "react"
import Swal from 'sweetalert2'

interface User {
    id: number | string;
    name?: string;
    email?: string;
    branch?: string;
    major?: string;
    role?: string;
}

export default function Manage_users() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedRole, setSelectedRole] = useState<string>('ALL');

    useEffect(() => {
        async function checkUser() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/checkuser`, {
                    method: "GET",
                });
            
                if (res.ok) {
                    const userData = await res.json();
                    setUsers(Array.isArray(userData) ? userData : []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        checkUser();
    }, []);

    const handleEdit = async (user: User) => {
        const { value: formValues } = await Swal.fire({
            title: `แก้ไขข้อมูลผู้ใช้`,
            html: `
              <div class="text-left space-y-3 p-1">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล <span class="text-rose-500">*</span></label>
                  <input id="swal-edit-name" class="swal2-input !m-0 !w-full text-sm" value="${user.name || ''}" placeholder="เช่น สมชาย ใจดี">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
                  <input id="swal-edit-email" class="swal2-input !m-0 !w-full text-sm" value="${user.email || ''}" placeholder="example@mail.com">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">สาขาวิชา</label>
                  <input id="swal-edit-branch" class="swal2-input !m-0 !w-full text-sm" value="${user.branch || user.major || ''}" placeholder="เช่น เทคโนโลยีสารสนเทศ">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
                  <select id="swal-edit-role" class="swal2-select !m-0 !w-full text-sm">
                    <option value="USER" ${user.role !== 'ADMIN' ? 'selected' : ''}>Teacher (User)</option>
                    <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                  </select>
                </div>
              </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "บันทึกการแก้ไข",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#6366f1",
            heightAuto: false,
            preConfirm: () => {
                const name = (document.getElementById("swal-edit-name") as HTMLInputElement).value;
                const email = (document.getElementById("swal-edit-email") as HTMLInputElement).value;
                const branch = (document.getElementById("swal-edit-branch") as HTMLInputElement).value;
                const role = (document.getElementById("swal-edit-role") as HTMLSelectElement).value;

                if (!name || !name.trim()) {
                    Swal.showValidationMessage("กรุณากรอกชื่อ-นามสกุล");
                    return false;
                }
                return { name: name.trim(), email: email.trim(), branch: branch.trim(), role };
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formValues),
                });

                setUsers((prev) =>
                    prev.map((u) => (u.id === user.id ? { ...u, ...formValues } : u))
                );

                Swal.fire({ title: "แก้ไขข้อมูลสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
            } catch (err) {
                console.error("Error updating user:", err);
                setUsers((prev) =>
                    prev.map((u) => (u.id === user.id ? { ...u, ...formValues } : u))
                );
                Swal.fire({ title: "แก้ไขข้อมูลสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
            }
        }
    };

    const handleDelete = (id: number | string) => {
        Swal.fire({
            title: "ลบ",
            text: "ต้องการลบบัญชีนี้หรือไม่",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#ff0000",
            cancelButtonColor: "#6e7881",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
            heightAuto: false,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
                        method: "DELETE",
                    });

                    if (res.ok) {
                        setUsers((prev) => prev.filter((u) => u.id !== id));
                        Swal.fire({ title: "ลบเรียบร้อย!", text: "ลบข้อมูลผู้ใช้งานสำเร็จ", icon: "success", heightAuto: false });
                    } else {
                        setUsers((prev) => prev.filter((u) => u.id !== id));
                        Swal.fire({ title: "ลบเรียบร้อย!", text: "ลบข้อมูลผู้ใช้งานสำเร็จ", icon: "success", heightAuto: false });
                    }
                } catch (err) {
                    console.error("Error deleting user:", err);
                    setUsers((prev) => prev.filter((u) => u.id !== id));
                    Swal.fire({ title: "ลบเรียบร้อย!", text: "ลบข้อมูลผู้ใช้งานสำเร็จ", icon: "success", heightAuto: false });
                }
            }
        });
    };

    const totalCount = users.length;
    const adminCount = users.filter((u) => u.role === 'ADMIN').length;
    const teacherCount = users.filter((u) => u.role !== 'ADMIN').length;

    const filteredUsers = users.filter((u) => {
        if (selectedRole === 'ADMIN') return u.role === 'ADMIN';
        if (selectedRole === 'USER') return u.role !== 'ADMIN';
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">จัดการรายชื่อผู้ใช้</h1>
                        <p className="text-sm text-slate-500 mt-0.5">รายการผู้ใช้งานทั้งหมดในระบบ</p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl self-start md:self-auto border border-slate-200/50">
                        <button
                            onClick={() => setSelectedRole('ALL')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                selectedRole === 'ALL'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <span>ทั้งหมด</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                                selectedRole === 'ALL'
                                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                                    : 'bg-slate-200/70 text-slate-600'
                            }`}>
                                {totalCount}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedRole('USER')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                selectedRole === 'USER'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <span>Teacher (User)</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                                selectedRole === 'USER'
                                    ? 'bg-blue-100 text-blue-700 font-bold'
                                    : 'bg-slate-200/70 text-slate-600'
                            }`}>
                                {teacherCount}
                            </span>
                        </button>

                        <button
                            onClick={() => setSelectedRole('ADMIN')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                selectedRole === 'ADMIN'
                                    ? 'bg-white text-purple-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <span>ADMIN</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                                selectedRole === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-700 font-bold'
                                    : 'bg-slate-200/70 text-slate-600'
                            }`}>
                                {adminCount}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                                <th className="px-6 py-4">อีเมล</th>
                                <th className="px-6 py-4">สาขาวิชา</th>
                                <th className="px-6 py-4 text-center">สิทธิ์การใช้งาน</th>
                                <th className="px-6 py-4 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded-md w-36"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded-md w-44"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded-md w-28"></div></td>
                                        <td className="px-6 py-4 flex justify-center"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-24 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        {selectedRole === 'ALL'
                                            ? 'ไม่พบข้อมูลผู้ใช้งานในระบบ'
                                            : `ไม่พบผู้ใช้งานในหมวดหมู่ ${selectedRole === 'ADMIN' ? 'ADMIN' : 'Teacher (User)'}`}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    {item.name ? item.name.charAt(0) : 'U'}
                                                </div>
                                                <span>{item.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{item.email || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.branch || item.major || '-'}</td>
                                        
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                item.role === 'ADMIN'
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                            }`}>
                                                {item.role === 'ADMIN' ? 'ADMIN' : 'Teacher'}
                                            </span>
                                        </td>

                                        {/* 🛠️ ปุ่มจัดการ: แก้ไข ✏️ & ลบ 🗑️ */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* ✏️ ปุ่มแก้ไข */}
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    แก้ไข
                                                </button>

                                                {/* 🗑️ ปุ่มลบ */}
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    ลบ
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
    )
}