import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/lib";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const supabase = await createClient();

  // Fetch user by username - match the capitalization from signup
  const { data: user, error } = await supabase
    .from("Accounts")  // Capital 'A'
    .select('"ID", "Username", "Password", "Account_Type"')  // All capitalized with quotes
    .eq("Username", username)  // Capital 'U'
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!user || user.Password !== password) {  // Capital 'P'
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  // Create session - match the property names from your database
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  const session = await encrypt({
    user: { 
      id: user.ID,  // Capital 'ID'
      username: user.Username,  // Capital 'Username'
      account_type: user.Account_Type  // Capital 'Account_Type'
    },
    expires,
  });

  (await cookies()).set("session", session, { expires, httpOnly: true });

  return NextResponse.json({ 
    message: "Logged in successfully", 
    user: {
      ID: user.ID,
      Username: user.Username,
      Account_Type: user.Account_Type
    }
  });
}