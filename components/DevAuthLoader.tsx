"use client";

import { useEffect } from "react";

/**
 * Development-only component that loads auth helpers into window
 * This makes authentication functions available in browser console
 */
export default function DevAuthLoader() {
  useEffect(() => {
    // Only load in development
    if (process.env.NODE_ENV === "development") {
      import("@/lib/devAuth").then(() => {
        console.log("🔧 Dev Auth loaded. Available commands:");
        console.log("  window.devLogin() - Sign in");
        console.log("  window.devLogout() - Sign out");
        console.log("  window.checkAuth() - Check auth status");
      });
    }
  }, []);

  return null;
}
