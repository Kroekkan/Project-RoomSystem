import { useEffect, useState } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    branch: string;
    role?: string;
    background: string;
    navbar: string;
    header: string;
}

export function useAuth () {
    const [ user, setUser ] = useState<User | null>(null);
    const [ isLoading, setIsloading ] = useState<boolean>(true);

    const checkAuth = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
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
            setIsloading(false);
        }
    };

    useEffect(() => {
        checkAuth();
      }, []);

      return { user, setUser, isLoading, refetchAuth: checkAuth };
}