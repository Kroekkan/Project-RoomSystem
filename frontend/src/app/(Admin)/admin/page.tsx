'use client'

import { useAuth } from "@/app/hooks/useAuth"
import { Person } from "../component/Person";
import Booking_History from "../component/Booking_History";

export default function admin () {
    const { user, isLoading } = useAuth();

    return (
        <div className="p-10">
            <h1>ยินดีต้อนรับคุณ  {user?.name}</h1>
            <Person />
            <Booking_History />
        </div>
    )
}