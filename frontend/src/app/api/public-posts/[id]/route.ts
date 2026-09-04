import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// PATCH: แก้ไขสถานะประกาศ (Toggle Resolved)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_URL}/public-posts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// DELETE: ลบประกาศ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const { id } = await params;

    const backendResponse = await fetch(`${BACKEND_URL}/public-posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendResponse.json().catch(() => null);
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการลบ" }, { status: 500 });
  }
}