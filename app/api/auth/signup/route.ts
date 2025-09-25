import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/lib";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
  
    
    const { username, password, account_type } = await req.json();
   
    
    if (!username || !password || !account_type) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const supabase = await createClient();
   

    
    const { data: existing, error: checkError } = await supabase
      .from("Accounts")
      .select('"ID"')
      .eq("Username", username)
      .maybeSingle();

    console.log("Username check result:", { existing, checkError });

    if (checkError) {
      console.error("Username check error:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

   
    const { data, error } = await supabase
      .from("Accounts")
      .insert([{ 
        "Username": username, 
        "Password": password, // Consider hashing this!
        "Account_Type": account_type 
      }])
      .select()
      .single();

   

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

   
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    const session = await encrypt({ 
      user: { id: data.ID, username: data.Username }, 
      expires 
    });

  

    (await cookies()).set("session", session, { expires, httpOnly: true });

    return NextResponse.json({ message: "Signed up successfully", user: data });
    
  } catch (err: any) {
    console.error("Signup error:", err.message);
    console.error("Full error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}