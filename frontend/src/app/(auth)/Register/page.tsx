'use client'

import { useState } from "react"
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Mail, Lock, Sparkles, BriefcaseBusiness, User, CalendarDays, BellRing, ShieldCheck } from "lucide-react";

export default function Register () {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ name, setName ] = useState("");
    const [ branch, setBranch ] = useState("การบัญชี");
    const [ customBranch, setCustomBranch ] = useState(""); // 🟢 State สำหรับกรอกแผนกเอง
    const [ surepassword, setSurePassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // หาค่าแผนกที่แท้จริง (ถ้าเลือก อื่นๆ ให้ใช้ค่าที่พิมพ์เอง)
        const finalBranch = branch === "OTHER" ? customBranch.trim() : branch;

        if (!finalBranch) {
            setLoading(false);
            await Swal.fire({
                title: "ข้อมูลไม่ครบถ้วน",
                text: "กรุณาระบุชื่อแผนก/สาขาวิชาของคุณ",
                icon: "warning",
                confirmButtonColor: "#f472b6",
            });
            return;
        }

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
                body: JSON.stringify({ 
                    email, 
                    password, 
                    name, 
                    branch: finalBranch // 🟢 ส่ง finalBranch ไปยัง Backend
                }),
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
                confirmButtonColor: "#f472b6",
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
            } else {
                await Swal.fire({
                    title: "เกิดข้อผิดพลาด",
                    text: err.message || "ไม่สามารถสร้างบัญชีได้",
                    icon: "error",
                    confirmButtonColor: "#f472b6",
                });
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen w-full bg-gray-100 flex items-center justify-center p-4 overflow-hidden">

            {/* Main Container */}
            <div className="w-full max-w-6xl min-h-[700px] min-h-0 bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

                {/* ================= LEFT : INTRO ================= */}
                <div className="relative flex items-center justify-center p-8 md:p-12 lg:p-14 overflow-hidden bg-white">

                    {/* Background Glow */}
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 w-full max-w-xl">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-7">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <span>ระบบจองห้องเรียนออนไลน์ Roomify</span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-5">
                            <h1 className="text-3xl md:text-4xl xl:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                                จองห้องเรียนง่ายๆ
                                <br />
                                แค่ไม่กี่คลิก
                                <br />
                                พร้อมระบบแจ้งเตือนผ่าน{" "}
                                <span className="text-emerald-600">
                                    LINE
                                </span>
                            </h1>

                            <p className="text-slate-500 text-sm md:text-base leading-7 max-w-lg">
                                ตรวจสอบตารางใช้ห้องประจำ จองห้องเรียนชดเชย
                                หรือห้องปฏิบัติการได้ทันที
                                พร้อมรับผลการอนุมัติจากผู้ดูแลระบบผ่านแชท LINE
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 mt-10">

                            {/* Feature 1 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                                    <CalendarDays className="w-4 h-4" />
                                </div>

                                <h3 className="font-bold text-slate-800 text-sm mb-1">
                                    ตารางเรียน Real-time
                                </h3>

                                <p className="text-xs text-slate-500 leading-5">
                                    เช็กตารางเรียนและคาบว่างได้อย่างแม่นยำ
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                                    <BellRing className="w-4 h-4" />
                                </div>

                                <h3 className="font-bold text-slate-800 text-sm mb-1">
                                    แจ้งเตือนผ่าน LINE
                                </h3>

                                <p className="text-xs text-slate-500 leading-5">
                                    รับผลการอนุมัติคำขอจองผ่าน LINE โดยตรง
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>

                                <h3 className="font-bold text-slate-800 text-sm mb-1">
                                    อนุมัติและยกเลิกสะดวก
                                </h3>

                                <p className="text-xs text-slate-500 leading-5">
                                    จัดการคำขอจองผ่านเว็บหรือ LINE ได้ทันที
                                </p>
                            </div>

                        </div>
                    </div>
                </div>


                {/* ================= RIGHT : REGISTER ================= */}
                <div className="relative flex items-center justify-center bg-slate-50/70 p-4 md:p-6 overflow-hidden">

                    {/* Register Card */}
                    <div className="w-full max-w-md max-h-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-y-auto">

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 md:p-7 flex flex-col gap-3"
                        >

                            {/* Header */}
                            <div className="flex flex-col items-center text-center gap-1 mb-1">

                                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center mb-1">
                                    <User className="w-5 h-5 text-pink-500" />
                                </div>

                                <h1 className="text-2xl font-bold text-slate-800">
                                    สร้างบัญชีใหม่
                                </h1>

                                <p className="text-sm text-gray-400">
                                    มาเริ่มต้นไปด้วยกันนะ
                                </p>

                            </div>


                            {/* Email */}
                            <div className="relative">

                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="อีเมล"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sky-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-gray-400 text-sm"
                                />

                            </div>


                            {/* Name */}
                            <div className="relative">

                                <User
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ชื่อ - นามสกุล"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sky-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-gray-400 text-sm"
                                />

                            </div>


                            {/* Password */}
                            <div className="relative">

                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="รหัสผ่าน"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sky-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-gray-400 text-sm"
                                />

                            </div>


                            {/* Confirm Password */}
                            <div className="relative">

                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />

                                <input
                                    type="password"
                                    value={surepassword}
                                    onChange={(e) => setSurePassword(e.target.value)}
                                    placeholder="ยืนยันรหัสผ่าน"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sky-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-gray-400 text-sm"
                                />

                            </div>


                            {/* Branch */}
                            <div className="flex flex-col gap-2">

                                <div className="flex items-center gap-2">

                                    <BriefcaseBusiness
                                        className="text-gray-400"
                                        size={18}
                                    />

                                    <span className="text-slate-700 text-sm font-medium">
                                        แผนก
                                    </span>

                                </div>


                                <select
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-white font-medium text-slate-800 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 cursor-pointer"
                                >

                                    <option value="การบัญชี">
                                        การบัญชี
                                    </option>

                                    <option value="คอมพิวเตอร์ธุรกิจ">
                                        คอมพิวเตอร์ธุรกิจ
                                    </option>

                                    <option value="คอมพิวเตอร์กราฟิกฯ">
                                        คอมพิวเตอร์กราฟิกฯ
                                    </option>

                                    <option value="การตลาด">
                                        การตลาด
                                    </option>

                                    <option value="การจัดการโลจิสติกส์">
                                        การจัดการโลจิสติกส์
                                    </option>

                                    <option value="ภาษาต่างประเทศ">
                                        ภาษาต่างประเทศ
                                    </option>

                                    <option value="สามัญแกนธุรกิจ">
                                        สามัญแกนธุรกิจ
                                    </option>

                                    <option value="OTHER">
                                        ➕ อื่นๆ (ระบุเอง)
                                    </option>

                                </select>


                                {/* Custom Branch */}
                                {branch === "OTHER" && (

                                    <div className="animate-in fade-in duration-200">

                                        <input
                                            type="text"
                                            value={customBranch}
                                            onChange={(e) => setCustomBranch(e.target.value)}
                                            placeholder="ระบุแผนก/สาขาวิชาของคุณ"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-sky-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-gray-400 text-sm"
                                        />

                                    </div>

                                )}

                            </div>


                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-1 w-full py-2.5 rounded-xl bg-black text-white font-medium shadow-md hover:shadow-lg hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                            >
                                {loading
                                    ? "กำลังสร้างบัญชี..."
                                    : "สร้างบัญชี"}
                            </button>


                            {/* Login */}
                            <button
                                type="button"
                                onClick={() => router.push('/Login')}
                                className="text-center text-sm text-gray-400 hover:text-sky-400 transition-colors mt-1"
                            >
                                มีบัญชีอยู่แล้ว?{" "}
                                <span className="font-semibold text-sky-400">
                                    เข้าสู่ระบบ
                                </span>
                            </button>

                        </form>


                        {/* Google Login */}
                        <div className="px-6 md:px-7 pb-5">

                            <a
                                href="http://localhost:4000/users/google"
                                className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
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

                                <span>
                                    สมัครด้วย Google
                                </span>

                            </a>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}