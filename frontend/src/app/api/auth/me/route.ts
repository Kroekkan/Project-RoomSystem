import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    console.log("NEXT COOKIE:", token ? "มี token" : "ไม่มี token");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(
      `/api/users/me`,
      {
        method: "GET",
        credentials: 'include',
        headers: {
          Cookie: `access_token=${token}`,
        },
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    console.log("BACKEND /users/me:", backendResponse.status, data);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Me proxy error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถเชื่อมต่อ Backend ได้" },
      { status: 500 }
    );
  }
}