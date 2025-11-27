/**
 * DEVELOPMENT ONLY - Simple authentication helper
 *
 * This file provides a quick way to sign in during development.
 * Open browser console and run: window.devLogin()
 */

import { supabaseBrowserClient } from "./supabaseClient";

// Store in window for browser console access
declare global {
  interface Window {
    devLogin: () => Promise<void>;
    devSignup: (email: string, password: string) => Promise<void>;
    devLogout: () => Promise<void>;
    checkAuth: () => Promise<void>;
  }
}

/**
 * Quick login for development
 * Usage: Open browser console and run: window.devLogin()
 */
export async function devLogin() {
  const email = prompt("Enter email:");
  const password = prompt("Enter password:");

  if (!email || !password) {
    console.error("Email and password required");
    return;
  }

  const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Login failed:", error.message);
    alert(`Login failed: ${error.message}`);
  } else {
    console.log("✅ Logged in successfully as:", data.user?.email);
    alert(`Logged in as ${data.user?.email}`);
    window.location.reload();
  }
}

/**
 * Quick signup for development
 */
export async function devSignup(email: string, password: string) {
  const { data, error } = await supabaseBrowserClient.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("❌ Signup failed:", error.message);
    alert(`Signup failed: ${error.message}`);
  } else {
    console.log("✅ Signed up successfully:", data.user?.email);
    alert(`Signed up as ${data.user?.email}. Check your email for confirmation.`);
  }
}

/**
 * Logout
 */
export async function devLogout() {
  const { error } = await supabaseBrowserClient.auth.signOut();

  if (error) {
    console.error("❌ Logout failed:", error.message);
  } else {
    console.log("✅ Logged out successfully");
    alert("Logged out");
    window.location.reload();
  }
}

/**
 * Check current authentication status
 */
export async function checkAuth() {
  const { data: { session } } = await supabaseBrowserClient.auth.getSession();

  if (session) {
    console.log("✅ Authenticated as:", session.user.email);
    console.log("User ID:", session.user.id);
    console.log("Session expires:", new Date(session.expires_at! * 1000));
  } else {
    console.log("❌ Not authenticated");
    console.log("Run window.devLogin() to sign in");
  }
}

// Expose to window for console access
if (typeof window !== "undefined") {
  window.devLogin = devLogin;
  window.devSignup = devSignup;
  window.devLogout = devLogout;
  window.checkAuth = checkAuth;
}
