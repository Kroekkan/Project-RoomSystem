import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = ['/Login', '/Register'];

const adminPaths = [
  '/admin',
  '/Manage_rooms',
  '/Manage_users',
  '/Public_relations_Admin',
  '/Roombooking_Admin',
  '/Setting_Admin',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // ดึง JWT
  // ==========================================
  const token = request.cookies.get('access_token')?.value;


  // ==========================================
  // หน้า Login / Register
  // ==========================================
  const isPublic = publicPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(path + '/')
  );

  if (isPublic) {
    return NextResponse.next();
  }


  // ==========================================
  // หน้าแรก /
  // ==========================================
  if (pathname === '/') {

    // ยังไม่ได้ Login → ไป Login
    if (!token) {
      return NextResponse.redirect(
        new URL('/Login', request.url)
      );
    }

    // มี Token → เข้า Homepage ได้
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET
      );

      await jwtVerify(token, secret);

      return NextResponse.next();

    } catch (error) {
      console.error('JWT verification failed:', error);

      // Token หมดอายุ / ไม่ถูกต้อง
      return NextResponse.redirect(
        new URL('/Login', request.url)
      );
    }
  }


  // ==========================================
  // หน้าอื่น ๆ ที่ต้อง Login
  // ==========================================

  // ไม่มี Token → Login
  if (!token) {
    return NextResponse.redirect(
      new URL('/Login', request.url)
    );
  }


  // ==========================================
  // ตรวจสอบว่าเป็นหน้า Admin หรือไม่
  // ==========================================

  const isAdminPath = adminPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(path + '/')
  );


  // ไม่ใช่หน้า Admin → ผ่าน
  if (!isAdminPath) {
    return NextResponse.next();
  }


  // ==========================================
  // ตรวจสอบ JWT + Role
  // ==========================================

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    const { payload } = await jwtVerify(
      token,
      secret
    );

    const role = payload.role;


    // ไม่ใช่ Admin → กลับหน้าแรก
    if (role !== 'ADMIN') {
      return NextResponse.redirect(
        new URL('/', request.url)
      );
    }


    // เป็น Admin → ผ่าน
    return NextResponse.next();

  } catch (error) {
    console.error(
      'JWT verification failed:',
      error
    );

    // Token ไม่ถูกต้อง / หมดอายุ
    return NextResponse.redirect(
      new URL('/Login', request.url)
    );
  }
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};