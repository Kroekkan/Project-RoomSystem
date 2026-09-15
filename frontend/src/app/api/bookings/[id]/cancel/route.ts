import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ไม่พบรหัสการจอง" },
        { status: 400 }
      );
    }

    if (!API) {
      return NextResponse.json(
        { message: "ไม่พบ NEXT_PUBLIC_API_URL" },
        { status: 500 }
      );
    }

    // ส่ง cookie access_token จาก Browser ไป Backend
    const cookie = request.headers.get("cookie");

    const res = await fetch(
      `${API}/bookings/${id}/cancel`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || {
          message: "ไม่สามารถยกเลิกการจองได้",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Cancel booking API error:", error);

    return NextResponse.json(
      {
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
      },
      { status: 500 }
    );
  }
}