'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

export default function Login () {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
                method: "POST",
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to Login');
            }

            const result = await Swal.fire({
                title: 'สำเร็จ',
                text: 'เข้าสู่ระบบสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#00aeff',
            });
            
            if (result.isConfirmed) {
                router.replace('/');
            }
                    

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
        <form onSubmit={handleSubmit}>
            <button onClick={() => router.push('/')}>
                กลับ
            </button>

            <label>อีเมล:</label>
            <input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมล"
                required
            />

            <label>รหัสผ่าน:</label>
            <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                required
            />

            <button type="submit">
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            <button onClick={() => router.push('/Register')}>
                ลงทะเบียน
            </button>

        </form>
    )

}