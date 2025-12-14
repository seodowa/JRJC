import { NextResponse } from "next/server";
import { getSession } from "@/lib";

export async function GET() {
  // Use the centralized, secure getSession function which handles all validation,
  // including the stale-session check against `role_last_changed_at`.
  const session = await getSession();

  if (!session || !session.user) {
    // The session is invalid. Create a response to send to the client.
    const response = NextResponse.json({ user: null }, { status: 401 });
    // Instruct the browser to delete the session cookie.
    response.cookies.delete('session');
    return response;
  }

  // If getSession() passes, the user is valid. Return their data.
  return NextResponse.json({ user: session.user });
}