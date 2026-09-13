import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = (await cookies()).get("access_token")?.value; // ชื่อ cookie ให้ตรงกับที่ backend set

  const body = await req.json();

  const res = await fetch(`${API}/bookings/${params.id}/checkin`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ส่งเป็น header แทนพึ่ง cookie ข้าม domain
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}