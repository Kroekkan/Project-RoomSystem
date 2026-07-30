import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import Swal from "sweetalert2";

export function useLogout () {
    const { setUser } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, {
            method: "POST",
            credentials: "include",
            },
        );

        if (res.ok) {
            setUser(null);

            await Swal.fire({
            title: "สำเร็จ",
            text: "ออกจากระบบสำเร็จ",
            icon: "success",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#00aeff",
            heightAuto: false,
            });

            router.replace('/Login');
        }
        } catch (err) {
        console.error("Logout falied:", err);
        }
    };

    return {handleLogout}
}