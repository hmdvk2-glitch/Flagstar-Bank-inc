import { supabase } from './client';

export const Queries = {
  async getProfile(userId: string) {
    return supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async login(accountNumber: string, pin: string) {
    return supabase
      .from('customers')
      .select('*')
      .eq('account_number', accountNumber)
      .eq('pin', pin)
      .single();
  },

  async getAccounts() {
    return supabase
      .from('customers')
      .select('*')
      .neq('role', 'admin');
  },

  async getTransactions(customerId: string) {
    return supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
  },

  async getTransferRestrictions(customerId: string) {
    return supabase
      .from('transfer_codes')
      .select('*')
      .eq('customer_id', customerId)
      .single();
  }
};
