import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log("OAuth callback received, code:", code ? "present" : "missing");

  if (code) {
    try {
      // Create response object first
      const response = NextResponse.redirect(`${requestUrl.origin}/studio`);

      // Create server client that can set cookies in the response
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              // Set cookies in the response
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("OAuth callback error:", error);
        // Redirect to home with error
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_failed`);
      }

      console.log("Session created successfully for user:", data.user?.email);

      // Return response with cookies set
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
