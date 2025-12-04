// proxy.ts
import { type NextRequest, NextResponse } from "next/server";
import { decrypt } from '@/lib'; // Import your decrypt function

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run auth checks on protected routes
  const protectedRoutes = ['/adminSU/dashboard', '/adminSU/bookings', '/adminSU/cars', '/adminSU/reviews', '/adminSU/settings'];
  const isProtected = protectedRoutes.some((path) => pathname.startsWith(path));

  // Pass through non-protected routes
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for your custom session
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    // No session — redirect to the login page
    return NextResponse.redirect(new URL('/adminSU', request.url));
  }

  try {
    // Decrypt and validate your custom session
    const session = await decrypt(sessionCookie);
    
    // Check if session is expired
    if (new Date() > new Date(session.expires)) {
      return NextResponse.redirect(new URL('/adminSU', request.url));
    }

    // Optional: Check user role for admin routes
    if (pathname.startsWith('/adminSU/dashboard')) {
      const userRole = session.user.account_type;
      
    }

    // Valid session — continue
    return NextResponse.next();

  } catch (error) {
    // Invalid session — redirect to login
    console.error('Session validation error:', error);
    return NextResponse.redirect(new URL('/adminSU', request.url));
  }
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}