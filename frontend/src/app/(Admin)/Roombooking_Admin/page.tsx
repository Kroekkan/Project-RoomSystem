'use client'

import { useEffect, useState } from "react"
import Swal from "sweetalert2"

interface Room {
    id: number;
    name: string;
    _count?: { schedules: number };
}

interface ScheduleItem {
    id?: number;
    subject: string;
    teacher: string;
    classroom: string;
}

type DaySchedule = { [period: number]: ScheduleItem | null };
type ScheduleData = { [day: string]: DaySchedule };

const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const dayColors: { [k: string]: string } = {
    "จันทร์": "bg-yellow-400", "อังคาร": "bg-pink-400", "พุธ": "bg-green-400",
    "พฤหัสบดี": "bg-orange-400", "ศุกร์": "bg-blue-400",
};

const subjectColors: { [k: string]: string } = {
    "คณิตศาสตร์": "bg-blue-100 text-blue-700 border-blue-200",
    "ภาษาอังกฤษ": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "วิทยาศาสตร์": "bg-purple-100 text-purple-700 border-purple-200",
    "ภาษาไทย": "bg-rose-100 text-rose-700 border-rose-200",
    "สังคมศึกษา": "bg-amber-100 text-amber-700 border-amber-200",
    "เทคโนโลยี": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "พลศึกษา": "bg-orange-100 text-orange-700 border-orange-200",
    "ศิลปะ": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "การงานอาชีพ": "bg-lime-100 text-lime-700 border-lime-200",
};
const defaultColor = "bg-slate-100 text-slate-700 border-slate-200";

function apiToScheduleData(apiData: any[]): ScheduleData {
    const result: ScheduleData = {};
    days.forEach((d) => (result[d] = {}));
    apiData.forEach((item) => {
        if (!result[item.day]) result[item.day] = {};
        result[item.day][item.period] = {
            id: item.id,
            subject: item.subject,
            teacher: item.teacher,
            classroom: item.classroom,
        };
    });
    return result;
}

export default function SchedulePage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [roomSearch, setRoomSearch] = useState("");
    const [isRoomLoading, setIsRoomLoading] = useState(true);

    const [schedule, setSchedule] = useState<ScheduleData>({});
    const [isScheduleLoading, setIsScheduleLoading] = useState(false);

    const [hoveredCell, setHoveredCell] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDay, setModalDay] = useState("");
    const [modalPeriod, setModalPeriod] = useState(0);
    const [modalSubject, setModalSubject] = useState("");
    const [modalTeacher, setModalTeacher] = useState("");
    const [modalClassroom, setModalClassroom] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`);
            if (res.ok) {
                const data = await res.json();
                setRooms(Array.isArray(data) ? data : []);
            }
        } catch (err) { console.error(err); }
        finally { setIsRoomLoading(false); }
    };

    useEffect(() => {
        if (selectedRoom) fetchSchedules(selectedRoom.id);
    }, [selectedRoom]);

    const fetchSchedules = async (roomId: number) => {
        setIsScheduleLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/schedules`);
            if (res.ok) {
                const data = await res.json();
                setSchedule(apiToScheduleData(data));
            }
        } catch (err) { console.error(err); }
        finally { setIsScheduleLoading(false); }
    };

    const handleAddRoom = async () => {
        const { value: roomName } = await Swal.fire({
            title: "เพิ่มห้องใหม่",
            input: "text",
            inputLabel: "ชื่อห้อง",
            inputPlaceholder: "เช่น 201, 202, 203",
            showCancelButton: true,
            confirmButtonText: "เพิ่ม",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#6366f1",
            heightAuto: false,
            inputValidator: (value) => { if (!value?.trim()) return "กรุณากรอกชื่อห้อง"; },
        });

        if (roomName) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: roomName.trim() }),
                });
                if (res.ok) {
                    await fetchRooms();
                    Swal.fire({ title: "เพิ่มห้องสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false, });
                } else {
                    Swal.fire({
                        title: "เกิดข้อผิดพลาด",
                        text: "ชื่อห้องอาจซ้ำ",
                        icon: "error",
                        heightAuto: false
                    });
                }
            } catch { Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: "",
                icon: "error",
                heightAuto: false
            }); }
        }
    };

    const handleDeleteRoom = async (room: Room) => {
        const result = await Swal.fire({
            title: `ลบห้อง "${room.name}"?`,
            text: "ตารางสอนทั้งหมดของห้องนี้จะถูกลบด้วย",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
            heightAuto: false,
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${room.id}`, { method: "DELETE" });
                if (selectedRoom?.id === room.id) { setSelectedRoom(null); setSchedule({}); }
                await fetchRooms();
                Swal.fire({ title: "ลบห้องสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false, });
            } catch { Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: "",
                icon: "error",
                heightAuto: false
            }); }
        }
    };

    const handleCellClick = (day: string, period: number) => {
        if (!selectedRoom) { Swal.fire({ title: "กรุณาเลือกห้องก่อน", icon: "info", showConfirmButton: false, heightAuto: false, }); return; }
        const item = schedule[day]?.[period] || null;
        setModalDay(day);
        setModalPeriod(period);
        if (item) {
            setModalSubject(item.subject); setModalTeacher(item.teacher); setModalClassroom(item.classroom);
            setEditingScheduleId(item.id || null); setIsEditing(true);
        } else {
            setModalSubject(""); setModalTeacher(""); setModalClassroom("");
            setEditingScheduleId(null); setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!modalSubject.trim()) { Swal.fire({ title: "กรุณากรอกชื่อวิชา", icon: "warning", showConfirmButton: false, heightAuto: false, }); return; }
        if (!selectedRoom) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${selectedRoom.id}/schedules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    day: modalDay,
                    period: modalPeriod,
                    subject: modalSubject.trim(),
                    teacher: modalTeacher.trim() || "-",
                    classroom: modalClassroom.trim() || "-",
                }),
            });

            if (res.ok) {
                await fetchSchedules(selectedRoom.id);
                setIsModalOpen(false);
                Swal.fire({ title: isEditing ? "แก้ไขสำเร็จ!" : "เพิ่มสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false, });
            }
        } catch { Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", showConfirmButton: false, heightAuto: false, }); }
    };

    const handleDeleteSchedule = () => {
        if (!editingScheduleId || !selectedRoom) return;

        Swal.fire({
            title: "ลบคาบเรียนนี้?",
            text: `ลบ "${modalSubject}" วัน${modalDay} คาบที่ ${modalPeriod}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
            heightAuto: false,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${selectedRoom.id}/schedules/${editingScheduleId}`, { method: "DELETE" });
                    await fetchSchedules(selectedRoom.id);
                    setIsModalOpen(false);
                    Swal.fire({ title: "ลบสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false, });
                } catch { Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", showConfirmButton: false, heightAuto: false, }); }
            }
        });
    };

    const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(roomSearch.toLowerCase()));

    return (
        <div className="min-h-auto bg-gradient-to-br from-slate-50 to-slate-100 flex">

            <aside className="w-72 h-169 bg-white border-l border-slate-200 flex flex-col shrink-0 order-2">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">🏫 รายชื่อห้อง</h2>
                    <p className="text-xs text-slate-400 mt-0.5">ทั้งหมด {rooms.length} ห้อง</p>
                </div>

                <div className="px-4 py-3 border-b border-slate-100">
                    <input
                        type="text"
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        placeholder="🔍 ค้นหาห้อง..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    {isRoomLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-xl"></div>
                        ))
                    ) : filteredRooms.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-8">ไม่พบห้อง</p>
                    ) : (
                        filteredRooms.map((room) => (
                            <div
                                key={room.id}
                                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                                    selectedRoom?.id === room.id
                                        ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                                        : 'hover:bg-slate-50 border border-transparent'
                                }`}
                                onClick={() => setSelectedRoom(room)}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                        selectedRoom?.id === room.id
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {room.name.slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-semibold ${selectedRoom?.id === room.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                            {room.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            {room._count?.schedules || 0} คาบ
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room); }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                                    title="ลบห้อง"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={handleAddRoom}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        เพิ่มห้องใหม่
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-8 overflow-auto order-1">
                <div className="max-w-[1200px] mx-auto">

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">
                            📅 {selectedRoom ? `ตารางสอน — ${selectedRoom.name}` : 'ตารางสอน'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {selectedRoom ? 'คลิกที่ช่องเพื่อจัดการคาบเรียน' : 'เลือกห้องจากแถบด้านซ้ายเพื่อเริ่มต้น'}
                        </p>
                    </div>

                    {!selectedRoom ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center justify-center py-32">
                            <div className="text-6xl mb-4">🏫</div>
                            <h2 className="text-xl font-bold text-slate-600">เลือกห้องเรียน</h2>
                            <p className="text-sm text-slate-400 mt-2">กรุณาเลือกห้องจากแถบด้านซ้ายเพื่อดูตารางสอน</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[950px]">
                                    <thead>
                                        <tr>
                                            <th className="sticky left-0 z-10 bg-slate-700 text-white px-4 py-3 text-sm font-semibold w-24 text-center">วัน / คาบ</th>
                                            {periods.map((p) => (
                                                <th key={p} className="bg-slate-700 text-white px-2 py-3 text-center text-xs font-semibold min-w-[95px]">
                                                    <div>คาบที่ {p}</div>
                                                    {p === 5 && <div className="text-[10px] font-normal text-slate-300 mt-0.5">พักกลางวัน</div>}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isScheduleLoading ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="animate-pulse border-b border-slate-100">
                                                    <td className="px-4 py-5 bg-slate-200"></td>
                                                    {periods.map((p) => (
                                                        <td key={p} className="px-1.5 py-1.5">
                                                            <div className="h-14 bg-slate-100 rounded-xl"></div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            days.map((day) => (
                                                <tr key={day} className="border-b border-slate-100 last:border-b-0">
                                                    <td className={`sticky left-0 z-10 px-3 py-3 text-center font-bold text-white text-sm ${dayColors[day]}`}>
                                                        {day}
                                                    </td>
                                                    {periods.map((p) => {
                                                        const item = schedule[day]?.[p] || null;
                                                        const cellKey = `${day}-${p}`;
                                                        const isHovered = hoveredCell === cellKey;
                                                        const isLunchBreak = p === 5 && !item;
                                                        const colorClass = item ? (subjectColors[item.subject] || defaultColor) : "";

                                                        return (
                                                            <td key={p}
                                                                className={`px-1.5 py-1.5 text-center transition-all duration-200 cursor-pointer ${
                                                                    isLunchBreak ? 'bg-amber-50/60' : isHovered && !item ? 'bg-indigo-50/50' : 'bg-white'
                                                                }`}
                                                                onMouseEnter={() => setHoveredCell(cellKey)}
                                                                onMouseLeave={() => setHoveredCell(null)}
                                                                onClick={() => handleCellClick(day, p)}
                                                            >
                                                                {isLunchBreak ? (
                                                                    <div className="text-[10px] text-amber-400 font-medium py-4">🍽️ พัก</div>
                                                                ) : item ? (
                                                                    <div className={`rounded-xl border px-2 py-2.5 ${colorClass} transition-all duration-200 ${
                                                                        isHovered ? 'scale-[1.04] shadow-md ring-2 ring-indigo-300/40' : 'shadow-sm'
                                                                    }`}>
                                                                        <div className="font-bold text-xs leading-tight truncate">{item.subject}</div>
                                                                        <div className="text-[10px] mt-1 opacity-70 truncate">{item.teacher}</div>
                                                                        <div className="text-[10px] mt-0.5 opacity-60">🏫 {item.classroom}</div>
                                                                    </div>
                                                                ) : (
                                                                    <div className={`py-4 transition-all duration-200 rounded-xl ${
                                                                        isHovered ? 'bg-indigo-50 border-2 border-dashed border-indigo-300' : 'text-slate-200 text-lg'
                                                                    }`}>
                                                                        {isHovered ? <span className="text-indigo-400 text-xs font-semibold">+ เพิ่ม</span> : '—'}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-slate-400 text-center mt-4">💡 คลิกที่ช่องใดก็ได้เพื่อเพิ่ม แก้ไข หรือลบคาบเรียน</p>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                            <h2 className="text-white font-bold text-lg">{isEditing ? '✏️ แก้ไขคาบเรียน' : '➕ เพิ่มคาบเรียน'}</h2>
                            <p className="text-indigo-100 text-sm mt-0.5">วัน{modalDay} — คาบที่ {modalPeriod} — {selectedRoom?.name}</p>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อวิชา <span className="text-rose-500">*</span></label>
                                <input type="text" value={modalSubject} onChange={(e) => setModalSubject(e.target.value)}
                                    placeholder="เช่น คณิตศาสตร์" autoFocus
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่ออาจารย์ผู้สอน</label>
                                <input type="text" value={modalTeacher} onChange={(e) => setModalTeacher(e.target.value)}
                                    placeholder="เช่น อ.สมชาย"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ห้องสอน</label>
                                <input type="text" value={modalClassroom} onChange={(e) => setModalClassroom(e.target.value)}
                                    placeholder="เช่น 301, Lab1"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                {isEditing && (
                                    <button onClick={handleDeleteSchedule}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors cursor-pointer">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        ลบ
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                                    ยกเลิก
                                </button>
                                <button onClick={handleSave}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer shadow-sm">
                                    {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มคาบเรียน'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}