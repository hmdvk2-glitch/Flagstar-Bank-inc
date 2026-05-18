import { supabase } from '../supabase/client';

export type TransferStage = 'cot' | 'tax' | 'irs';

export const transferLogic = {
  getRestrictions: async (userId: string) => {
    const { data } = await supabase.from('transfer_codes').select('*').eq('user_id', userId).single();
    return data;
  },
  
  verifyCode: async (userId: string, stage: TransferStage, code: string) => {
    const { data } = await supabase.from('transfer_codes').select(`${stage}_code, ${stage}_enabled`).eq('user_id', userId).single();
    if (!data) return false;
    
    const isEnabled = data[`${stage}_enabled` as keyof typeof data];
    const correctCode = data[`${stage}_code` as keyof typeof data];
    
    if (!isEnabled) return true;
    return code === correctCode;
  },

  executeTransfer: async (userId: string, amount: number, recipient: string, narration: string) => {
    // 1. Basic Input Validation
    if (!userId) throw new Error('System Error: Missing active session');
    if (!recipient || recipient.trim() === '') throw new Error('Recipient identity is required');
    
    // 2. Execute Atomic Transfer via Hardened RPC
    // This handles balance checks, race condition locking, and state initialization in one atomic DB call.
    const { data: txnId, error: rpcError } = await supabase.rpc('customer_initiate_transfer', {
      p_sender_id: userId,
      p_amount: amount,
      p_recipient_account: recipient,
      p_narration: narration || `Wire Transfer to ${recipient}`
    });

    if (rpcError) throw new Error('Ledger Core rejected the mutation: ' + rpcError.message);
    
    return { id: txnId };
  }
};
