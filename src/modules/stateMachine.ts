import { supabase } from '../lib/supabase';

export type TransactionStage = 'PENDING' | 'COT VERIFIED' | 'TAX VERIFIED' | 'IRS VERIFIED' | 'COMPLETED' | 'REJECTED';

export interface StateTransition {
  from: TransactionStage;
  to: TransactionStage;
  label: string;
}

export const TRANSACTION_LIFECYCLE: StateTransition[] = [
  { from: 'PENDING', to: 'COT VERIFIED', label: 'Verify COT' },
  { from: 'COT VERIFIED', to: 'TAX VERIFIED', label: 'Verify TAX' },
  { from: 'TAX VERIFIED', to: 'IRS VERIFIED', label: 'Verify IRS' },
  { from: 'IRS VERIFIED', to: 'COMPLETED', label: 'Complete Transaction' },
];

export const StateMachineEngine = {
  /**
   * Advance a transaction to its next logical state
   */
  async advance(transactionId: string, currentStage: TransactionStage) {
    const transition = TRANSACTION_LIFECYCLE.find(t => t.from === currentStage);
    if (!transition) {
      if (currentStage === 'COMPLETED') throw new Error('Transaction already completed');
      throw new Error(`No valid transition from ${currentStage}`);
    }

    const { error } = await supabase
      .from('transactions')
      .update({ 
        stage: transition.to,
        status: transition.to === 'COMPLETED' ? 'APPROVED' : 'PENDING'
      })
      .eq('id', transactionId);

    if (error) throw error;
    return transition.to;
  },

  /**
   * Force a transaction to a specific state (Admin only)
   */
  async forceState(transactionId: string, targetStage: TransactionStage) {
    const { error } = await supabase
      .from('transactions')
      .update({ 
        stage: targetStage,
        status: targetStage === 'COMPLETED' ? 'APPROVED' : (targetStage === 'REJECTED' ? 'REJECTED' : 'PENDING')
      })
      .eq('id', transactionId);

    if (error) throw error;
  },

  /**
   * Validate if a code is valid for a specific stage
   */
  async validateCode(accountId: string, code: string, stage: 'COT' | 'TAX' | 'IRS') {
    const column = stage.toLowerCase() + '_code';
    const { data, error } = await supabase
      .from('admin_codes')
      .select('*')
      .eq('account_id', accountId)
      .eq(column, code)
      .single();

    if (error || !data) return false;
    return true;
  }
};
