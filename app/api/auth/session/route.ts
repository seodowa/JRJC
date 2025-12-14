import { NextResponse } from "next/server";
import { getSession } from "@/lib";
import { cookies } from "next/headers";

export async function GET() {
  // Use the centralized, secure getSession function which handles all validation,
  // including the stale-session check against `role_last_changed_at`.
  const session = await getSession();

  if (!session || !session.user) {
    // The session is invalid. Instruct the browser to delete the cookie.
    cookies().delete('session');
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // If getSession() passes, the user is valid. Return their data.
  return NextResponse.json({ user: session.user });
}