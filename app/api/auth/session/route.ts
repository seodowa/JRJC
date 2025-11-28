import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib";
import { createClient } from "@supabase/supabase-js"; // Use direct client for Admin access

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const session = await decrypt(sessionCookie);
    if (new Date() > new Date(session.expires)) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    // 1. Initialize Supabase Admin Client (Bypasses RLS)
    // We use the service role key to ensure we can read the user data regardless of policies
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Fetch fresh data from "Accounts" table
    // We use the email from the cookie to find the real, current record in the DB
    const { data: account } = await supabaseAdmin
        .from('Accounts')
        .select('Username, Email')
        .eq('Email', session.user.email) 
        .single();

    // 3. If we found the user in the DB, return that FRESH data
    if (account) {
        return NextResponse.json({
            user: {
                ...session.user, // Keep other session properties (like ID, role, etc.)
                username: account.Username, // Use the fresh Username from DB
                email: account.Email        // Use the fresh Email from DB
            }
        });
    }

    // Fallback: If DB lookup fails (e.g. row deleted), return the stale cookie data
    return NextResponse.json({ user: session.user });

  } catch (error) {
    console.error("Session API Error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}