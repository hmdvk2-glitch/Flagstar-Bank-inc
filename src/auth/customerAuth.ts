import { supabase } from '../supabase/client';
import { clearSession, hydrateSession } from './session';

export const customerAuth = {
  login: async (accountNumber: string, pin: string) => {
    // 1. Lookup email by account number (Since Supabase Auth requires email)
    const { data, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .eq('account_number', accountNumber)
      .single();

    if (lookupError || !data) {
      throw new Error("Invalid Account Number or PIN");
    }

    // 2. Authenticate against Primary Truth Layer (Supabase Auth)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: pin
    });

    if (authError) {
      throw new Error("Invalid Account Number or PIN");
    }
    
    // 3. Sync global auth state
    await hydrateSession();
  },
  
  logout: async () => {
    await clearSession();
  }
};
