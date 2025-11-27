import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Bitte gib eine gültige E-Mail-Adresse ein" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 6 Zeichen lang sein" },
        { status: 400 }
      );
    }

    // Sign up user with Supabase using admin client
    // This will create the user and auto-confirm their email
    const { data: createData, error: createError } = await supabaseAdminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
    });

    if (createError) {
      console.error("Supabase signup error:", createError);

      // Handle specific error cases
      if (createError.message.includes("already registered") || createError.message.includes("User already registered")) {
        return NextResponse.json(
          { error: "Diese E-Mail-Adresse ist bereits registriert" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Registrierung fehlgeschlagen. Bitte versuche es erneut." },
        { status: 500 }
      );
    }

    // Return success - the client will then sign in
    return NextResponse.json({
      success: true,
      user: {
        id: createData.user.id,
        email: createData.user.email,
      },
    });
  } catch (error) {
    console.error("Error in signup API route:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
