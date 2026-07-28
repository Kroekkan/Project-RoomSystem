'use client'

import { useState } from "react"
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Register () {
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState('');;
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
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
                confirmButtonColor: '#4f46e5',
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
            <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />

            <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? "กำลังบันทึก..." : "สร้างบัญชี"}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}

        </form>
    )
}