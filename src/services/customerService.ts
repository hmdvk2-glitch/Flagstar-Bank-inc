import { supabase } from '../supabase/client';

/**
 * CUSTOMER SERVICE (v4.0 Hardened)
 * Pure ledger-based interactions.
 */
export const customerService = {
  /**
   * Fetches the vault overview (Read-only).
   */
  getVaultInfo: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Fetches personal ledger activity.
   */
  getLedger: async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Initiates a transfer via the hardened RPC gateway.
   */
  initiateTransfer: async (userId: string, amount: number, recipient: string, narration: string) => {
    const { data: txnId, error } = await supabase.rpc('customer_initiate_transfer', {
      p_sender_id: userId,
      p_amount: amount,
      p_recipient_account: recipient,
      p_narration: narration
    });
    if (error) throw error;
    return txnId;
  }
};
