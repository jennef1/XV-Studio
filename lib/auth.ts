"use client";

import { supabaseBrowserClient } from "./supabaseClient";

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  error: string;
}

export interface AuthSuccess {
  success: true;
  user: any;
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthSuccess | AuthError> {
  try {
    // First, create the user account
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Anmeldung fehlgeschlagen" };
    }

    // After successful signup, sign in the user to create a session
    const { data: signInData, error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Auto sign-in error after signup:", signInError);
      return { error: "Konto wurde erstellt, aber Anmeldung fehlgeschlagen. Bitte versuche dich manuell anzumelden." };
    }

    return { success: true, user: signInData.user };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthSuccess | AuthError> {
  try {
    // Sign in directly with Supabase client
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Ungültige E-Mail-Adresse oder Passwort" };
      }

      return { error: "Anmeldung fehlgeschlagen. Bitte versuche es erneut." };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." };
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<void> {
  console.log("Starting Google OAuth flow...");
  console.log("Redirect URL:", `${window.location.origin}/api/auth/callback`);

  const { data, error } = await supabaseBrowserClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  console.log("OAuth response:", { data, error });

  if (error) {
    console.error("Google OAuth error:", error);
    throw new Error("Google Anmeldung fehlgeschlagen");
  }

  console.log("OAuth initiated successfully, URL:", data?.url);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabaseBrowserClient.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
    throw new Error("Abmeldung fehlgeschlagen");
  }
}

/**
 * Get the current user session
 */
export async function getSession() {
  const { data, error } = await supabaseBrowserClient.auth.getSession();
  if (error) {
    console.error("Get session error:", error);
    return null;
  }
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data, error } = await supabaseBrowserClient.auth.getUser();
  if (error) {
    console.error("Get user error:", error);
    return null;
  }
  return data.user;
}
