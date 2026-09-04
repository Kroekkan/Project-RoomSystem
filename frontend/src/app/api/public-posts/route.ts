import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// POST: เพิ่มประกาศใหม่
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const backendResponse = await fetch(`${BACKEND_URL}/public-posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Proxy create post error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}