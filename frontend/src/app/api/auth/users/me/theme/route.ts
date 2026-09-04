import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    // 1. ดึง Token จาก Cookie ของ Next.js
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 2. แนบ Bearer Token ส่งต่อไปยัง Backend
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me/theme`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Theme proxy error:", error);
    return NextResponse.json(
      { message: "ไม่สามารถบันทึก Theme ได้" },
      { status: 500 }
    );
  }
}