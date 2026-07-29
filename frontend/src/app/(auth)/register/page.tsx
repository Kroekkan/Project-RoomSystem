'use client'

import { useState } from "react"
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Register () {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ surepassword, setSurePassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState('');;
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
                confirmButtonColor: "#4f46e5",
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
                confirmButtonColor: '#00aeff',
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
        <form onSubmit={handleSubmit}>
            <button onClick={() => router.push('/')}>
                กลับ
            </button>

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

            <button type="submit" disabled={loading}>
                {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button onClick={() => router.push('/Login')}>
                เข้าสู่ระบบ
            </button>

        </form>
    )
}