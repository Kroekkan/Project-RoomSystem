import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware (request: NextRequest) {
    console.log('MIDDLEWARE RUNNING:', request.nextUrl.pathname);
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;
    const protectedPaths = ['/admin', '/Roombooking', '/Public_realtions', '/Setting', '/Roombooking_Admin', '/Public_realtions_Admin', '/Manage_users', '/Setting_Admin'];
    const adminPaths = ['/admin', '/Roombooking_Admin', '/Public_realtions_Admin', '/Manage_users', '/Setting_Admin'];

    const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p));
    const isAdminPath = adminPaths.some(p => pathname.startsWith(p));

    if (!token && isProtectedPath) {
        return NextResponse.redirect(new URL('/Login', request.url));
    }

    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'MySuperSecretKey_123456789');
            const { payload } = await jwtVerify( token, secret );

            const role = payload.role as string;

            if (isAdminPath && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/', request.url));
            }

            if (pathname === '/Login') {
                return NextResponse.redirect(new URL('/', request.url));
            }

            if (pathname === '/Register') {
                return NextResponse.redirect(new URL('/', request.url));
            }

        } catch (err) {

            const response = NextResponse.redirect(new URL('/Login', request.url));
            response.cookies.delete('access_token');
            return response;

        }
    }

    return NextResponse.next();

}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};