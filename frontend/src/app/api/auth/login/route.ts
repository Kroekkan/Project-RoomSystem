import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    }

    // JWT ที่ Backend สร้างให้
    const token = data.token;

    if (!token) {
      return NextResponse.json(
        { message: "ไม่พบ access token จาก Backend" },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      {
        message: data.message,
        role: data.role,
      },
      {
        status: 200,
      }
    );

    // ให้ Vercel เป็นคนสร้าง Cookie
    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login proxy error:", error);

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