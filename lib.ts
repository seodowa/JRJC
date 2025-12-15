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


