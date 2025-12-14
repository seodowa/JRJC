import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin"; // Import supabaseAdmin

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Set expiration time on creation
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    // This will catch expired tokens or invalid signatures
    console.error("JWT Decryption Error:", error);
    return null;
  }
}

export async function getSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;

  const sessionPayload = await decrypt(sessionCookie);
  if (!sessionPayload) return null;

  // --- START: Stale Session Invalidation Check ---
  try {
    const { data: account, error } = await supabaseAdmin
      .from('Accounts')
      .select('role_last_changed_at')
      .eq('ID', sessionPayload.user.id)
      .single();
    
    if (error || !account) {
        // If user not found, invalidate session
        return null;
    }

    // `iat` is in seconds, so we convert it to milliseconds to compare with JS Date
    const tokenIssuedAt = new Date(sessionPayload.iat * 1000);
    const roleLastChangedAt = new Date(account.role_last_changed_at);

    if (tokenIssuedAt < roleLastChangedAt) {
      // The role was changed AFTER the token was issued. Invalidate session.
      console.log(`Stale session detected for user ${sessionPayload.user.id}. Invalidating.`);
      return null;
    }
  } catch (dbError) {
      console.error("Database error during session validation:", dbError);
      return null; // Fail-safe: if DB check fails, invalidate session.
  }
  // --- END: Stale Session Invalidation Check ---

  return sessionPayload;
}


export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // No need to update the session on every request if we set expiration on creation.
  // The middleware can be simplified or removed if this was its only purpose.
  // For now, leaving the logic commented out as it might be used for other things.
  /*
  const parsed = await decrypt(session);
  if (!parsed) return;

  parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
  */
  return NextResponse.next();
}
