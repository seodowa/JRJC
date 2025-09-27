import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib";

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
    return NextResponse.json({ user: session.user });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
