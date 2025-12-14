import { getSession } from "@/lib";
import { ALLOWED_ADMIN_ROLES } from "@/lib/auth-config";
import { NextResponse } from "next/server";

/**
 * Verifies if the current user has a valid session and an authorized admin role.
 * Returns the session object if valid, otherwise returns null.
 */
export async function verifyAdmin() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return null;
  }

  // Check if the user's role is in the allowed list
  // The session.user.account_type is populated during login (verify-otp)
  if (!ALLOWED_ADMIN_ROLES.includes(session.user.account_type)) {
    return null; 
  }

  return session;
}

/**
 * Returns a standard Next.js 401 Unauthorized response.
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized: Insufficient permissions' }, { status: 401 });
}
