import { supabase } from '../supabase/client';

export const EdgeFunctions = {
  /**
   * Securely create a customer and account
   */
  async createCustomer(payload: {
    name: string;
    email: string;
    pin: string;
    initialDeposit: number;
    accountType: string;
  }) {
    return supabase.functions.invoke('create-customer', {
      body: payload
    });
  },

  /**
   * Generate security codes for an account
   */
  async generateCodes(accountId: string, transactionId?: string) {
    return supabase.functions.invoke('generate-codes', {
      body: { accountId, transactionId }
    });
  },

  /**
   * Process a privileged state transition
   */
  async processTransaction(transactionId: string, action: 'ADVANCE' | 'REJECT' | 'FORCE_COMPLETE') {
    return supabase.functions.invoke('process-transaction', {
      body: { transactionId, action }
    });
  }
};
