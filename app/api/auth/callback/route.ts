import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log("OAuth callback received, code:", code ? "present" : "missing");

  if (code) {
    try {
      // Create server client that can manage cookies
      const supabase = await createServerClient();

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("OAuth callback error:", error);
        // Redirect to home with error
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`);
      }

      console.log("Session created successfully for user:", data.user?.email);

      // Create a response that redirects to studio
      const response = NextResponse.redirect(`${requestUrl.origin}/studio`);

      // The session should already be set in cookies by the storage handlers
      // but let's ensure the response preserves them
      return response;
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`);
    }
  }

  // No code provided - redirect to home
  console.log("No code provided, redirecting to home");
  return NextResponse.redirect(requestUrl.origin);
}
