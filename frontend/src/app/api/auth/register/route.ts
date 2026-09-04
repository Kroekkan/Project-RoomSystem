import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. ส่งข้อมูลไปสมัครสมาชิกที่ Backend
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/create`, // หรือ path register ของคุณ
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

    let token = data.token;

    // 2. ถ้า Backend register แล้วไม่ได้ส่ง token กลับมา ให้สั่ง login ให้อัตโนมัติเบื้องหลัง
    if (!token && body.email && body.password) {
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: body.email,
            password: body.password,
          }),
          cache: "no-store",
        }
      );

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        token = loginData.token;
      }
    }

    const response = NextResponse.json(
      {
        message: data.message || "สมัครสมาชิกสำเร็จ",
        role: data.role,
      },
      {
        status: 200,
      }
    );

    // 3. เซ็ต Cookie access_token ทันที (เหมือนกับตอน Login)
    if (token) {
      response.cookies.set("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Register proxy error:", error);

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