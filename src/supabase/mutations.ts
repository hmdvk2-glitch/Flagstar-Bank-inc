import { supabase } from './client';
import { Database } from './types';

type TransactionInsert = Database['public']['Tables']['transactions']['Row'];

export const Mutations = {
  /**
   * Log an administrative action
   */
  async logAudit(action: string, targetId: string, details: any) {
    const { data: { user } } = await supabase.auth.getUser();
    return supabase
      .from('audit_logs')
      .insert({
        admin_id: user?.id,
        action,
        target_id: targetId,
        details
      });
  },

  /**
   * Initiate a transaction (member level)
   */
  async createTransaction(transaction: any) {
    return supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
  },

  /**
   * Update transaction stage (privileged but routed for simulation)
   */
  async updateTransactionStage(id: string, stage: string, status: string) {
    return supabase
      .from('transactions')
      .update({ stage, status })
      .eq('id', id);
  }
};
