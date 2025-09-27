// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;



export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run auth checks on protected routes
  const protectedRoutes = ['/adminSU/dashboard'];
  const isProtected = protectedRoutes.some((path) => pathname.startsWith(path));

  // Pass through non-protected routes
  if (!isProtected) {
    return NextResponse.next();
  }

  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Get current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // No session — redirect to login
    return NextResponse.redirect(new URL('/adminSU', request.url));
  }

  // Optionally: check user role
  // const userRole = session.user.user_metadata.role;
  // if (pathname.startsWith('/admin') && userRole !== 'admin') {
  //   return NextResponse.redirect(new URL('/unauthorized', request.url));
  // }

  // Valid session — continue
  return response;
}
