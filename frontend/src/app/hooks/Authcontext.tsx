'use client';
import { createContext, useContext, useEffect, useState } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    branch: string;
    role?: string;
    themeSettings: Record<string, string> | null;
}

type AuthContextType = {
    user: User | null;
    setUser: (u: User | null) => void;
    isLoading: boolean;
    refetchAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuth = async () => {
        try {
            const res = await fetch(`/api/users/me`, {
                method: "GET",
                credentials: "include",
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, refetchAuth: checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

// ตั้งชื่อ useAuth เหมือนเดิม เพื่อไม่ต้องแก้ import path ในไฟล์อื่น ๆ ที่เรียกใช้อยู่แล้ว
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}