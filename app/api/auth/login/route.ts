import { NextRequest, NextResponse } from "next/server";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    // Sign in user with Supabase
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Ungültige E-Mail-Adresse oder Passwort" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Anmeldung fehlgeschlagen. Bitte versuche es erneut." },
        { status: 500 }
      );
    }

    // Return success with user data
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
    });
  } catch (error) {
    console.error("Error in login API route:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
