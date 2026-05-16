import { supabase } from '../supabase/client';
import { clearSession, saveCustomerSession } from './session';

export const customerAuth = {
  login: async (accountNumber: string, pin: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('account_number', accountNumber)
      .eq('pin', pin)
      .single();

    if (error || !data) throw new Error("Invalid Account Number or PIN");
    
    saveCustomerSession(data);
  },
  
  logout: async () => {
    await clearSession();
  }
};
