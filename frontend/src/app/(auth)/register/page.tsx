'use client'

import { useState } from "react"
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Mail, Lock, ArrowLeft, BriefcaseBusiness, User } from "lucide-react";

export default function Register () {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ name, setName ] = useState("");
    const [ branch, setBranch ] = useState("");
    const [ surepassword, setSurePassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

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
                body: JSON.stringify({ email, password, name, branch }),
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
            
            if ( err.message === "password must be longer than or equal to 6 characters" ) {
                await Swal.fire({
                    title: "เกิดข้อมูลผิดพลาด",
                    text: "รหัสผ่านต้องมีความยาว 6 ตัวอักษรขึ้นไป",
                    icon: "error",
                    confirmButtonColor: "#f472b6",
                });
            }

        } finally {

            setLoading(false);

        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-300 p-4">
            <div className="w-full max-w-md relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-sky-200/30border border-white">

                <form
                    onSubmit={handleSubmit}
                    className="relative p-8 flex flex-col gap-4"
                >
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-sky-400 transition-colors w-fit"
                    >
                        <ArrowLeft size={16} />
                        กลับ
                    </button>

                    <div className="flex flex-col items-center text-center gap-1 mb-2">
                        <h1 className="text-2xl font-bold text-black">
                            สร้างบัญชีใหม่
                        </h1>
                        <p className="text-sm text-gray-400">มาเริ่มต้นไปด้วยกันนะ</p>
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="อีเมล"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-sky-100 focus:border-black focus:ring-2 focus:ring-sky-200 outline-none transition-all placeholder:text-gray-400 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ชื่อ - นามสกุล"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-sky-100 focus:border-black focus:ring-2 focus:ring-sky-200 outline-none transition-all placeholder:text-gray-400 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="รหัสผ่าน"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-sky-100 focus:border-black focus:ring-2 focus:ring-sky-200 outline-none transition-all placeholder:text-gray-400 text-smm"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="password"
                            value={surepassword}
                            onChange={(e) => setSurePassword(e.target.value)}
                            placeholder="ยืนยันรหัสผ่าน"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-sky-100 focus:border-black focus:ring-2 focus:ring-sky-200 outline-none transition-all placeholder:text-gray-400 text-sm"
                        />
                    </div>

                    <div className="flex flex-row">
                        <BriefcaseBusiness className="mt-2 ml-3 text-black" size={18} />
                        <span className="mt-1 ml-1 text-black">แผนก</span>
                        <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="px-3 py-2 ml-4 rounded-xl w-full border border-slate-200 bg-white font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            <option value="การบัญชี">การบัญชี</option>
                            <option value="คอมพิวเตอร์ธุรกิจ">คอมพิวเตอร์ธุรกิจ</option>
                            <option value="คอมพิวเตอร์กราฟิกฯ">คอมพิวเตอร์กราฟิกฯ</option>
                            <option value="การตลาด">การตลาด</option>
                            <option value="การจัดการโลจิสติกส์">การจัดการโลจิสติกส์</option>
                            <option value="ภาษาต่างประเทศ">ภาษาต่างประเทศ</option>
                            <option value="สามัญแกนธุรกิจ">สามัญแกนธุรกิจ</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full py-3 rounded-xl bg-black text-white font-medium shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100"
                    >
                        {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/Login')}
                        className="text-center text-sm text-gray-400 hover:text-sky-400 transition-colors mt-1"
                    >
                        มีบัญชีอยู่แล้ว? <span className="font-semibold text-sky-400">เข้าสู่ระบบ</span>
                    </button>

                </form>

                <button className="flex m-auto">
                    <a
                        href="http://localhost:4000/users/google"
                        className="flex items-center justify-center gap-3 w-100 py-2.5 px-4 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                    fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>

                        <span>เข้าสู่ระบบด้วย Google</span>

                    </a>
                </button>
            </div>
        </div>
    )
}