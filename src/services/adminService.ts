import { supabase } from '../supabase/client';

/**
 * ADMIN SERVICE (v4.0 Hardened)
 * Strictly uses RPCs for all mutations.
 */
export const adminService = {
  /**
   * Fetches the system-wide ledger.
   */
  getLedger: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, users(full_name, account_number), admins(full_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Fetches all institutional vaults (users).
   */
  getCustomers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Provisions a new customer via RPC.
   */
  createCustomer: async (data: { name: string, email: string, account_number: string, pin: string }) => {
    // In v4.0, we use a dedicated RPC for customer creation to ensure atomic indexing
    const { data: newUser, error } = await supabase.rpc('admin_create_customer', {
      p_name: data.name,
      p_email: data.email,
      p_account: data.account_number,
      p_pin: data.pin
    });
    if (error) throw error;
    return newUser;
  },

  /**
   * Advances a transaction stage via hardened RPC.
   */
  verifyStage: async (txnId: string, stage: string, code: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No active admin session");

    const { data, error } = await supabase.rpc('admin_verify_stage', {
      p_admin_auth_id: session.user.id,
      p_txn_id: txnId,
      p_target_stage: stage,
      p_verification_code: code
    });
    if (error) throw error;
    return data;
  }
};
