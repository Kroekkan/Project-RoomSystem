'use client'

import { useEffect, useState, useMemo } from "react"
import Swal from "sweetalert2"

interface Room {
    id: number;
    name: string;
    building?: string;
    category?: string;
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

const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const time = ["8:30-9:20", "9:20-10:10", "10:10-10:40", "10:40-11:30", "11:30-12:20", 
    "12:20-13:10", "13:10-14:00", "14:00-14:50", "14:50-15:40", "15:40-16:30"
]
const Shortentime = ["8:30-9:10", "9:10-9:50", "9:50-10:20", "10:20-11:00", "11:00-11:40", 
    "11:40-12:20", "12:20-13:00", "13:00-13:40", "13:40-14:20", "14:20-15:00"
]

const dayColors: { [k: string]: string } = {
    "จันทร์": "bg-yellow-400", "อังคาร": "bg-pink-400", "พุธ": "bg-green-400",
    "พฤหัสบดี": "bg-orange-400", "ศุกร์": "bg-blue-400", "เสาร์": "bg-purple-400",
    "อาทิตย์": "bg-red-400"
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

function getPeriodTitle(p: number): string {
    if (p === 3) return "พัก 30";
    return `คาบที่ ${p > 3 ? p - 1 : p}`;
}

export default function SchedulePage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [roomSearch, setRoomSearch] = useState("");
    const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
    const [isRoomLoading, setIsRoomLoading] = useState(true);

    // 🔘 สถานะการเลือกหลายห้อง (Bulk Delete)
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);

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

    const buildingList = useMemo(() => {
        const buildings = rooms
            .map((r) => r.building?.trim())
            .filter((b): b is string => Boolean(b));
        return Array.from(new Set(buildings));
    }, [rooms]);

    // ➕ เพิ่มห้องใหม่
    const handleAddRoom = async () => {
        const { value: formValues } = await Swal.fire({
            title: "เพิ่มห้องใหม่",
            html: `
              <div class="text-left space-y-3 p-1 ">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">อาคาร / ตึก <span class="text-rose-500">*</span></label>
                  <input id="swal-room-building" class="swal2-input !m-0 !w-full text-sm" placeholder="เช่น อาคาร 1, อาคาร 2">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อห้อง <span class="text-rose-500">*</span></label>
                  <input id="swal-room-name" class="swal2-input !m-0 !w-full text-sm" placeholder="เช่น 201, 202">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่ห้อง</label>
                  <select id="swal-room-category" class="swal2-select !m-0 !w-full text-sm">
                    <option value="ห้องเรียนทั่วไป">🏫 ห้องเรียนทั่วไป</option>
                    <option value="ห้องปฏิบัติการ">🔬 ห้องปฏิบัติการ</option>
                  </select>
                </div>
              </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "เพิ่มห้อง",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#6366f1",
            heightAuto: false,
            preConfirm: () => {
                const building = (document.getElementById("swal-room-building") as HTMLInputElement).value;
                const name = (document.getElementById("swal-room-name") as HTMLInputElement).value;
                const category = (document.getElementById("swal-room-category") as HTMLSelectElement).value;

                if (!building || !building.trim()) {
                    Swal.showValidationMessage("กรุณากรอกชื่ออาคาร");
                    return false;
                }
                if (!name || !name.trim()) {
                    Swal.showValidationMessage("กรุณากรอกชื่อห้อง");
                    return false;
                }
                return { building: building.trim(), name: name.trim(), category };
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        building: formValues.building,
                        name: formValues.name,
                        category: formValues.category
                    }),
                });
                if (res.ok) {
                    await fetchRooms();
                    Swal.fire({ title: "เพิ่มห้องสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
                } else {
                    Swal.fire({ title: "เกิดข้อผิดพลาด", text: "ชื่อห้องอาจซ้ำ", icon: "error", heightAuto: false });
                }
            } catch {
                Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", heightAuto: false });
            }
        }
    };

    // ✏️ แก้ไขห้อง
    const handleEditRoom = async (room: Room) => {
        const isLab = room.category === "ห้องปฏิบัติการ" || room.name.includes("Lab") || room.name.includes("ปฏิบัติการ");
        const currentCategory = room.category || (isLab ? "ห้องปฏิบัติการ" : "ห้องเรียนทั่วไป");

        const { value: formValues } = await Swal.fire({
            title: `แก้ไขห้อง "${room.name}"`,
            html: `
              <div class="text-left space-y-3 p-1">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">อาคาร / ตึก <span class="text-rose-500">*</span></label>
                  <input id="swal-edit-room-building" class="swal2-input !m-0 !w-full text-sm" value="${room.building || ''}" placeholder="เช่น อาคาร 1, อาคาร 2">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อห้อง <span class="text-rose-500">*</span></label>
                  <input id="swal-edit-room-name" class="swal2-input !m-0 !w-full text-sm" value="${room.name}" placeholder="เช่น 201, 202, Lab 1">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่ห้อง</label>
                  <select id="swal-edit-room-category" class="swal2-select !m-0 !w-full text-sm">
                    <option value="ห้องเรียนทั่วไป" ${currentCategory === "ห้องเรียนทั่วไป" ? "selected" : ""}>🏫 ห้องเรียนทั่วไป</option>
                    <option value="ห้องปฏิบัติการ" ${currentCategory === "ห้องปฏิบัติการ" ? "selected" : ""}>🔬 ห้องปฏิบัติการ</option>
                  </select>
                </div>
              </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "บันทึก",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#6366f1",
            heightAuto: false,
            preConfirm: () => {
                const building = (document.getElementById("swal-edit-room-building") as HTMLInputElement).value;
                const name = (document.getElementById("swal-edit-room-name") as HTMLInputElement).value;
                const category = (document.getElementById("swal-edit-room-category") as HTMLSelectElement).value;

                if (!building || !building.trim()) {
                    Swal.showValidationMessage("กรุณากรอกชื่ออาคาร");
                    return false;
                }
                if (!name || !name.trim()) {
                    Swal.showValidationMessage("กรุณากรอกชื่อห้อง");
                    return false;
                }
                return { building: building.trim(), name: name.trim(), category };
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${room.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        building: formValues.building,
                        name: formValues.name,
                        category: formValues.category
                    }),
                });
                if (res.ok) {
                    await fetchRooms();
                    if (selectedRoom?.id === room.id) {
                        setSelectedRoom({
                            ...selectedRoom,
                            building: formValues.building,
                            name: formValues.name,
                            category: formValues.category
                        });
                    }
                    Swal.fire({ title: "แก้ไขห้องสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
                } else {
                    Swal.fire({ title: "เกิดข้อผิดพลาด", text: "ชื่อห้องอาจซ้ำ", icon: "error", heightAuto: false });
                }
            } catch {
                Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", heightAuto: false });
            }
        }
    };

    // 🗑️ ลบห้องทีละห้อง
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
                Swal.fire({ title: "ลบห้องสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
            } catch { Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", heightAuto: false }); }
        }
    };

    // 🗑️ ลบห้องที่เลือก (บางส่วน)
    const handleDeleteSelectedRooms = async () => {
        if (selectedRoomIds.length === 0) return;

        const result = await Swal.fire({
            title: `ลบห้องที่เลือก ${selectedRoomIds.length} ห้อง?`,
            text: "ตารางสอนทั้งหมดของห้องที่เลือกจะถูกลบออกด้วย",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: `ลบ ${selectedRoomIds.length} ห้อง`,
            cancelButtonText: "ยกเลิก",
            heightAuto: false,
        });

        if (result.isConfirmed) {
            try {
                await Promise.all(
                    selectedRoomIds.map((id) =>
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`, { method: "DELETE" })
                    )
                );
                if (selectedRoom && selectedRoomIds.includes(selectedRoom.id)) {
                    setSelectedRoom(null);
                    setSchedule({});
                }
                setSelectedRoomIds([]);
                await fetchRooms();
                Swal.fire({ title: "ลบห้องที่เลือกสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
            } catch {
                Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", heightAuto: false });
            }
        }
    };

    // 🗑️ ลบห้องทั้งหมดในระบบ
    const handleDeleteAllRooms = async () => {
        if (rooms.length === 0) return;

        const result = await Swal.fire({
            title: `⚠️ ยืนยันลบห้องทั้งหมด ${rooms.length} ห้อง?`,
            text: "ห้องเรียนและตารางสอนทั้งหมดในระบบจะถูกลบถาวร ไม่สามารถกู้คืนได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "ยืนยันลบห้องทั้งหมด",
            cancelButtonText: "ยกเลิก",
            heightAuto: false,
        });

        if (result.isConfirmed) {
            try {
                await Promise.all(
                    rooms.map((room) =>
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${room.id}`, { method: "DELETE" })
                    )
                );
                setSelectedRoom(null);
                setSchedule({});
                setSelectedRoomIds([]);
                await fetchRooms();
                Swal.fire({ title: "ลบห้องทั้งหมดสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
            } catch {
                Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", heightAuto: false });
            }
        }
    };

    const handleCellClick = (day: string, period: number) => {
        if (period === 3) return;

        if (!selectedRoom) { Swal.fire({ title: "กรุณาเลือกห้องก่อน", icon: "info", showConfirmButton: false, heightAuto: false }); return; }
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
        if (!modalSubject.trim()) { Swal.fire({ title: "กรุณากรอกชื่อวิชา", icon: "warning", showConfirmButton: false, heightAuto: false }); return; }
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
                Swal.fire({ title: isEditing ? "แก้ไขสำเร็จ!" : "เพิ่มสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
            }
        } catch { Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", showConfirmButton: false, heightAuto: false }); }
    };

    const handleDeleteSchedule = () => {
        if (!editingScheduleId || !selectedRoom) return;

        Swal.fire({
            title: "ลบคาบเรียนนี้?",
            text: `ลบ "${modalSubject}" วัน${modalDay} ${getPeriodTitle(modalPeriod)}`,
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
                    Swal.fire({ title: "ลบสำเร็จ!", icon: "success", timer: 1200, showConfirmButton: false, heightAuto: false });
                } catch { Swal.fire({ title: "เกิดข้อผิดพลาด", icon: "error", showConfirmButton: false, heightAuto: false }); }
            }
        });
    };

    // 🔍 กรองห้องตาม อาคาร -> หมวดหมู่ -> ค้นหา
    const filteredRooms = rooms.filter((r) => {
        const matchesSearch = r.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
                              (r.building && r.building.toLowerCase().includes(roomSearch.toLowerCase()));
        
        const matchesBuilding = selectedBuilding === "ALL" || r.building === selectedBuilding;

        const isLab = r.category === "ห้องปฏิบัติการ" || r.name.includes("Lab") || r.name.includes("ปฏิบัติการ");
        let matchesCategory = true;
        if (selectedCategory === "LAB") matchesCategory = isLab;
        if (selectedCategory === "GENERAL") matchesCategory = !isLab;

        return matchesSearch && matchesBuilding && matchesCategory;
    });

    // 🔘 ตรวจสอบว่าเลือกครบทุกห้องตามที่กรองหรือไม่
    const isAllFilteredSelected = filteredRooms.length > 0 && filteredRooms.every(r => selectedRoomIds.includes(r.id));

    const handleToggleSelectAll = () => {
        if (isAllFilteredSelected) {
            setSelectedRoomIds(prev => prev.filter(id => !filteredRooms.some(r => r.id === id)));
        } else {
            const filteredIds = filteredRooms.map(r => r.id);
            setSelectedRoomIds(prev => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    const handleToggleRoomSelection = (roomId: number, e: React.MouseEvent | React.ChangeEvent) => {
        e.stopPropagation();
        setSelectedRoomIds(prev =>
            prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
        );
    };

    return (
        <div className="h-170 bg-app-bg flex">

            {/* Sidebar ด้านซ้าย */}
            <aside className="w-80 h-auto bg-white border-l border-slate-200 flex flex-col shrink-0 order-2">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">รายชื่อห้อง</h2>
                        <p className="text-[11px] text-slate-400">ทั้งหมด {rooms.length} ห้อง</p>
                    </div>

                    {/* 🔘 ปุ่มเข้าสู่โหมดเลือกหลายห้อง */}
                    <button
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            if (isSelectionMode) setSelectedRoomIds([]);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelectionMode
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {isSelectionMode ? 'ยกเลิกเลือก' : '☑️ เลือกหลายห้อง'}
                    </button>
                </div>

                {/* 🛠️ แถบเครื่องมือจัดการเลือกหลายห้อง (Bulk Action Bar) */}
                {isSelectionMode && (
                    <div className="px-3 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
                            <input
                                type="checkbox"
                                checked={isAllFilteredSelected}
                                onChange={handleToggleSelectAll}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                            />
                            <span>เลือกทั้งหมด ({selectedRoomIds.length})</span>
                        </label>

                        <div className="flex items-center gap-1">
                            {selectedRoomIds.length > 0 && (
                                <button
                                    onClick={handleDeleteSelectedRooms}
                                    className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg shadow-sm transition-colors text-[11px] cursor-pointer"
                                >
                                    ลบที่เลือก ({selectedRoomIds.length})
                                </button>
                            )}
                            {rooms.length > 0 && (
                                <button
                                    onClick={handleDeleteAllRooms}
                                    className="px-2 py-1 bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-600 font-medium rounded-lg transition-colors text-[11px] cursor-pointer"
                                    title="ลบห้องทั้งหมดในระบบ"
                                >
                                    ลบทั้งหมด
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 🎛️ ตัวกรอง: เลือกอาคาร -> เลือกหมวดหมู่ห้อง */}
                <div className="px-4 pt-3 pb-2 space-y-2 border-b border-slate-100">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">เลือกอาคาร</label>
                        <select
                            value={selectedBuilding}
                            onChange={(e) => setSelectedBuilding(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="ALL">ทุกอาคาร</option>
                            {buildingList.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">เลือกหมวดหมู่ห้อง</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="ALL">ทุกหมวดหมู่</option>
                            <option value="GENERAL">🏫 ห้องเรียนทั่วไป</option>
                            <option value="LAB">🔬 ห้องปฏิบัติการ</option>
                        </select>
                    </div>
                </div>

                {/* ช่องค้นหาห้อง */}
                <div className="px-4 py-2 border-b border-slate-100">
                    <input
                        type="text"
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        placeholder="🔍 ค้นหาชื่อห้องหรืออาคาร..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                </div>

                {/* แสดงผลรายการห้อง */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    {isRoomLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse h-12 bg-slate-100 rounded-xl"></div>
                        ))
                    ) : filteredRooms.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-8">ไม่พบห้องตามเงื่อนไขที่เลือก</p>
                    ) : (
                        filteredRooms.map((room) => {
                            const isLab = room.category === "ห้องปฏิบัติการ" || room.name.includes("Lab") || room.name.includes("ปฏิบัติการ");
                            const isChecked = selectedRoomIds.includes(room.id);

                            return (
                                <div
                                    key={room.id}
                                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                                        isChecked
                                            ? 'bg-indigo-50/80 border border-indigo-300'
                                            : selectedRoom?.id === room.id
                                            ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                                            : 'hover:bg-slate-50 border border-transparent'
                                    }`}
                                    onClick={(e) => {
                                        if (isSelectionMode) {
                                            handleToggleRoomSelection(room.id, e);
                                        } else {
                                            setSelectedRoom(room);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        {/* ☑️ Checkbox สำหรับเลือกหลายห้อง */}
                                        {isSelectionMode && (
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => handleToggleRoomSelection(room.id, e)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                                            />
                                        )}

                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            selectedRoom?.id === room.id
                                                ? 'bg-indigo-500 text-white'
                                                : isLab ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {isLab ? '🔬' : room.name.slice(0, 1)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-sm font-semibold ${selectedRoom?.id === room.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    {room.name}
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isLab ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {isLab ? 'ปฏิบัติการ' : 'ทั่วไป'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                                {room.building && <span>{room.building}</span>}
                                                <span>• {room._count?.schedules || 0} คาบ</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🛠️ ปุ่มแก้ไข & ลบเดี่ยว */}
                                    {!isSelectionMode && (
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditRoom(room); }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                                                title="แก้ไขห้อง"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room); }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                                                title="ลบห้อง"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-3 border-t border-slate-100 space-y-2">
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

            {/* Main Area */}
            <main className="flex-1 p-4 md:p-8 overflow-auto order-1">
                <div className="max-w-[1200px] mx-auto">

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-black">
                            {selectedRoom ? `ตารางสอน — ${selectedRoom.name} ${selectedRoom.building ? `(${selectedRoom.building})` : ''}` : 'ตารางสอน'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {selectedRoom ? 'คลิกที่ช่องเพื่อจัดการคาบเรียน' : 'เลือกห้องจากแถบด้านซ้ายเพื่อเริ่มต้น'}
                        </p>
                    </div>

                    {!selectedRoom ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center justify-center py-32">
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
                                            {periods.map((p, inx) => (
                                                <th key={p} className="bg-slate-700 text-white px-2 py-3 text-center text-xs font-semibold min-w-[95px]">
                                                    <div>{getPeriodTitle(p)}</div>
                                                    <div className="mt-1">{time[inx]}</div>
                                                    <div className="mt-1">{Shortentime[inx]}</div>
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
                                                        const isBreak = p === 3;
                                                        const colorClass = item ? defaultColor : "";

                                                        return (
                                                            <td key={p}
                                                                className={`px-1.5 py-1.5 text-center transition-all duration-200 ${
                                                                    isBreak
                                                                        ? 'bg-amber-50/70 cursor-not-allowed select-none'
                                                                        : isHovered && !item ? 'bg-indigo-50/50 cursor-pointer' : 'bg-white cursor-pointer'
                                                                }`}
                                                                onMouseEnter={() => !isBreak && setHoveredCell(cellKey)}
                                                                onMouseLeave={() => setHoveredCell(null)}
                                                                onClick={() => handleCellClick(day, p)}
                                                            >
                                                                {isBreak ? (
                                                                    <div className="text-[10px] text-amber-600 font-semibold py-4 flex items-center justify-center gap-1">
                                                                        พัก 30
                                                                    </div>
                                                                ) : item ? (
                                                                    <div className={`rounded-xl border px-2 py-2.5 ${colorClass} transition-all duration-200 ${
                                                                        isHovered ? 'scale-[1.04] shadow-md ring-2 ring-indigo-300/40' : 'shadow-sm'
                                                                    }`}>
                                                                        <div className="font-bold text-xs leading-tight truncate">{item.subject}</div>
                                                                        <div className="text-[10px] mt-1 opacity-70 truncate">{item.teacher}</div>
                                                                        <div className="text-[10px] mt-0.5 opacity-60">{item.classroom}</div>
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

                    <p className="text-xs text-slate-400 text-center mt-4">💡 คลิกที่ช่องใดก็ได้เพื่อเพิ่ม แก้ไข หรือลบคาบเรียน (ยกเว้นช่วงพัก 30)</p>
                </div>
            </main>

            {/* Modal เพิ่ม / แก้ไขคาบเรียน */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                            <h2 className="text-white font-bold text-lg">{isEditing ? '✏️ แก้ไขคาบเรียน' : '➕ เพิ่มคาบเรียน'}</h2>
                            <p className="text-indigo-100 text-sm mt-0.5">
                                วัน{modalDay} — {getPeriodTitle(modalPeriod)} — {selectedRoom?.name}
                            </p>
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
                                    placeholder="เช่น 301, 411"
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