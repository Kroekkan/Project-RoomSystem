'use client'

import { useState } from "react"
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";

export default function Register () {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ surepassword, setSurePassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if ( password !== surepassword ) {
            setLoading(false);

            await Swal.fire({
                title: "เกิดข้อมูลผิดพลาด",
                text: "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
                icon: "error",
                confirmButtonColor: "#f472b6",
            });

            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/create`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to create user');
            }

            await Swal.fire({
                title: 'สำเร็จ',
                text: 'สร้างบัญชีเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#f472b6',
                scrollbarPadding: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    router.replace('/');
                }
            })

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 p-4">
            <div className="w-full max-w-md relative">

                {/* decorative blobs */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-200 rounded-full blur-2xl opacity-60" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-2xl opacity-60" />

                <form
                    onSubmit={handleSubmit}
                    className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-pink-200/50 border border-white p-8 flex flex-col gap-4"
                >
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-pink-400 transition-colors w-fit"
                    >
                        <ArrowLeft size={16} />
                        กลับ
                    </button>

                    <div className="flex flex-col items-center text-center gap-1 mb-2">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            สร้างบัญชีใหม่
                        </h1>
                        <p className="text-sm text-gray-400">มาเริ่มต้นไปด้วยกันนะ</p>
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="อีเมล"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-pink-50/60 border border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-200 outline-none transition-all placeholder:text-gray-300 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="รหัสผ่าน"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-pink-50/60 border border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-200 outline-none transition-all placeholder:text-gray-300 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="password"
                            value={surepassword}
                            onChange={(e) => setSurePassword(e.target.value)}
                            placeholder="ยืนยันรหัสผ่าน"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-pink-50/60 border border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-200 outline-none transition-all placeholder:text-gray-300 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium shadow-md shadow-pink-200 hover:shadow-lg hover:shadow-pink-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100"
                    >
                        {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
                    </button>

                    {error && (
                        <p className="text-center text-sm text-red-400 bg-red-50 border border-red-100 rounded-lg py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => router.push('/Login')}
                        className="text-center text-sm text-gray-400 hover:text-pink-400 transition-colors mt-1"
                    >
                        มีบัญชีอยู่แล้ว? <span className="font-semibold text-pink-400">เข้าสู่ระบบ</span>
                    </button>
                </form>
            </div>
        </div>
    )
}