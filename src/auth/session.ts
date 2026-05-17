import { supabase } from '../supabase/client';
import { authStore } from '../store/authStore';

/**
 * BOOT SEQUENCE (v6.1 Hardened Session Layer)
 *
 * Flow:
 *   getSession() → profile lookup → role validation → AUTHENTICATED
 *                → no session / invalid role → GUEST
 */

export async function hydrateSession() {
  try {
    // 1. Get Supabase session (single source of truth)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      authStore.reset();
      return;
    }

    // 2. Fetch user profile (role + account metadata)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    // 3. Build safe user payload (NO TRUSTED SPREAD)
    const userPayload = {
      id: session.user.id,
      email: session.user.email,
      role: profile?.role ?? 'guest',
      balance: profile?.balance ?? 0,
    };

    // 4. Strict role validation (FAIL-SECURE)
    const allowedRoles = ['admin', 'customer'];

    if (!allowedRoles.includes(userPayload.role)) {
      await supabase.auth.signOut();
      authStore.reset();
      return;
    }

    // 5. Commit authenticated state
    authStore.transition(userPayload, 'AUTHENTICATED');
  } catch (err) {
    // FAIL SAFE: never leave partial auth state
    await supabase.auth.signOut();
    authStore.reset();
  }
}

/**
 * Destroy all session state (logout)
 */
export async function clearSession() {
  try {
    await supabase.auth.signOut();
  } finally {
    authStore.reset();
  }
}