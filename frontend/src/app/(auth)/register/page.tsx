'use client'

import { useState } from "react"
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Register () {
    const [ name, setName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ surepassword, setSurePassword ] = useState("");
    const [ branch, setBranch ] = useState("");
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
                confirmButtonColor: "#4f46e5",
            });

            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/create`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, branch }),
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
                confirmButtonColor: '#00aeff',
                scrollbarPadding: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    router.replace('/Login');
                }
            })

        } catch (err: any) {
            const errorMessage = err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';

            await Swal.fire({
                title: "เกิดข้อมูลผิดพลาด",
                text: errorMessage,
                icon: "error",
                confirmButtonColor: "#4f46e5",
            });

        } finally {

            setLoading(false);

        }

    }

    return (
        <form 
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            }}
        >
            <button onClick={() => router.push('/')}>
                กลับ
            </button>

            <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                required
            />

            <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมล"
                required
            />

            <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                required
            />

            <input 
                type="password"
                value={surepassword}
                onChange={(e) => setSurePassword(e.target.value)}
                placeholder="ยีนยันรหัสผ่าน"
                required
            />

            <input 
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="หมวด/สาขา"
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
            </button>

            <button onClick={() => router.push('/Login')}>
                เข้าสู่ระบบ
            </button>

        </form>
    )
}