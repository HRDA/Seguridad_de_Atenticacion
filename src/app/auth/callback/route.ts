import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }
  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const destination = safeNextPath(requestUrl.searchParams.get("next"));
  const config = getSupabaseConfig();

  if (code && config) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(destination, requestUrl.origin));
      }
    } catch {
      // The browser receives a generic failure; provider details stay server-side.
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", requestUrl.origin));
}