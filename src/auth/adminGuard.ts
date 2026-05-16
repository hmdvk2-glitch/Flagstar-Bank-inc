/**
 * ADMIN IDENTITY LOCK (v4.0 Hardened)
 * 
 * Only Source of Truth: Supabase Auth Identity
 */

export function requireAdmin(user: any) {
  if (!user) {
    throw new Error("NO_SESSION");
  }

  // Admin identity criteria:
  // 1. Explicit admin role in metadata OR
  // 2. Verified admin email domain (simulation fallback)
  const isAdmin = 
    user.app_metadata?.role === "admin" || 
    user.user_metadata?.role === "admin" ||
    user.email?.endsWith("@flagstarbank.com") ||
    user.email === "tochizadmin@flagstarbank.com";

  if (!isAdmin) {
    throw new Error("UNAUTHORIZED_ADMIN");
  }

  return true;
}
