import { supabase } from '../supabase/client';
import { authStore } from '../store/authStore';

const CUSTOMER_SESSION_KEY = 'flagstar_customer_session';

/**
 * BOOT SEQUENCE (v5.0 Deterministic)
 * 
 * Flow:
 *   BOOTING → getSession() → admin check → ADMIN_READY
 *                           → customer check → CUSTOMER_READY
 *                           → fallback localStorage → CUSTOMER_READY
 *                           → nothing → ANONYMOUS
 */
export async function hydrateSession() {
  authStore.setPhase('BOOTING');

  try {
    // 1. Supabase Native Auth (Primary Identity Source)
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Check admin table first
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (adminData) {
        authStore.transition(
          { ...adminData, auth_user_id: session.user.id, email: session.user.email },
          'ADMIN_READY'
        );
        return;
      }

      // Check users table (customer with Supabase auth)
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userData) {
        authStore.transition(userData, 'CUSTOMER_READY');
        return;
      }

      // Authenticated in Supabase but no matching record — new admin before setup
      // Treat as admin if they have an active Supabase session (setup flow)
      authStore.transition(
        { id: session.user.id, auth_user_id: session.user.id, email: session.user.email },
        'ADMIN_READY'
      );
      return;
    }

    // 2. Fallback: PIN-based customer session (Simulation Mode)
    const stored = localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('account_number', parsed.account_number)
          .single();

        if (user) {
          authStore.transition(user, 'CUSTOMER_READY');
          return;
        }
      } catch (e) {
        localStorage.removeItem(CUSTOMER_SESSION_KEY);
      }
    }

    // 3. No identity found
    authStore.reset();
  } catch (err) {
    authStore.setPhase('ERROR', 'Session hydration failed');
  }
}

/**
 * Destroy all session state.
 */
export async function clearSession() {
  await supabase.auth.signOut();
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  authStore.reset();
}

/**
 * Persist customer session (PIN-based simulation login).
 */
export function saveCustomerSession(user: any) {
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(user));
  authStore.transition(user, 'CUSTOMER_READY');
}
