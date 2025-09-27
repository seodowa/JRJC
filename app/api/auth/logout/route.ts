import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Delete the custom session cookie created on login
  (await cookies()).delete("session");
  return NextResponse.json({ message: "Logout successful" });
}
