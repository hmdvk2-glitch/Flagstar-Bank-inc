import { supabase } from '../supabase/client';
import { authStore } from '../store/authStore';

const CUSTOMER_SESSION_KEY = 'flagstar_customer_session';

export async function hydrateSession() {
  // 1. Check Supabase Native Auth (Primary Identity Source)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Check if this user is an Admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (adminData) {
      authStore.setUser({ 
        ...adminData, 
        role: 'admin', 
        id: adminData.id,
        auth_user_id: session.user.id 
      });
      return;
    }

    // If not admin, check if they are a customer (id matches auth.users.id)
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (userData) {
      authStore.setUser({ ...userData, role: 'customer' });
      return;
    }
  }

  // 2. Fallback: Secondary Account Number Login (Simulation Mode)
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
        authStore.setUser({ ...user, role: 'customer' });
        return;
      }
    } catch (e) {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    }
  }

  authStore.setUser(null);
}

export async function clearSession() {
  await supabase.auth.signOut();
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  authStore.setUser(null);
}

export function saveCustomerSession(user: any) {
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(user));
  authStore.setUser({ ...user, role: 'customer' });
}
