import { supabase } from './supabase/client';
import { SecurityEngine } from './core/securityEngine';

export const AppBootstrap = {
  /**
   * Run initial system checks and return the initial state
   */
  async init() {
    console.log('[SYSTEM] Initializing Flagstar Bank Enterprise v2.0...');
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { route: '#/login', user: null, role: null };
    }

    // Securely fetch profile and role
    const { data: profile, error } = await supabase
      .from('customers')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      return { route: '#/login', user: null, role: null };
    }

    return {
      route: profile.role === 'admin' ? '#/admin' : '#/dashboard',
      user: session.user,
      role: profile.role
    };
  }
};
