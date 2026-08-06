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
                        Swal.fire("ลบเรียบร้อย!", "ลบข้อมูลผู้ใช้งานสำเร็จ", "success");
                    } else {
                        setUsers((prev) => prev.filter((u) => u.id !== id));
                        Swal.fire("ลบเรียบร้อย!", "ลบข้อมูลผู้ใช้งานสำเร็จ", "success");
                    }
                } catch (err) {
                    console.error("Error deleting user:", err);
                    setUsers((prev) => prev.filter((u) => u.id !== id));
                    Swal.fire("ลบเรียบร้อย!", "ลบข้อมูลผู้ใช้งานสำเร็จ", "success");
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">จัดการรายชื่อผู้ใช้</h1>
                        <p className="text-sm text-slate-500 mt-0.5">รายการผู้ใช้งานทั้งหมดในระบบ</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        ทั้งหมด {users.length} คน
                    </span>
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
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-16 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        ไม่พบข้อมูลผู้ใช้งานในระบบ
                                    </td>
                                </tr>
                            ) : (
                                users.map((item) => (
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

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                ลบ
                                            </button>
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