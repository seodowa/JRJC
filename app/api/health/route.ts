import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // adjust path

export async function GET() {
  // createClient is async now
  const supabase = await createClient();

  try {
    // Option 1: test DB access (replace with an existing table)
    const { data, error } = await supabase.from("Accounts").select("ID").limit(1);

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
