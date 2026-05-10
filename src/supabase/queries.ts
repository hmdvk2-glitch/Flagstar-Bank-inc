import { supabase } from './client';

export const Queries = {
  async getProfile(userId: string) {
    return supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async getAccounts(userId: string) {
    return supabase
      .from('accounts')
      .select('*')
      .eq('customer_id', userId);
  },

  async getTransactions(accountId: string) {
    return supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
  },

  async getAuditLogs() {
    return supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
  }
};
