import { useAuth } from "@/app/hooks/useAuth"

export function IsLogin () {
    const { user, isLoading } = useAuth();

    return (
        <h1>ยินดีต้อนรับคุณ {user?.name}</h1>
    )
}