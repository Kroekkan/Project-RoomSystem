import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "ยังไม่ได้เข้าสู่ระบบ",
        },
        {
          status: 401,
        }
      );
    }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Auth me proxy error:", error);

    return NextResponse.json(
      {
        message: "ไม่สามารถเชื่อมต่อ Backend ได้",
      },
      {
        status: 500,
      }
    );
  }
}