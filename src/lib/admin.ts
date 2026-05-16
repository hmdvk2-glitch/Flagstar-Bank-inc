import { supabase } from '../supabase/client';

export const adminLogic = {
  createCustomer: async (data: { name: string, email: string, accountNumber: string, pin: string, balance: number, cot: boolean, tax: boolean, irs: boolean }) => {
    // 1. Insert user
    const { data: user, error: cError } = await supabase
      .from('users')
      .insert({
        full_name: data.name,
        email: data.email,
        account_number: data.accountNumber,
        pin: data.pin,
        balance: 0 // Initialize at 0, balance will be set by transaction trigger
      })
      .select()
      .single();

    if (cError) throw cError;

    // 2. Initialize transfer codes
    await supabase.from('transfer_codes').insert({
      user_id: user.id,
      cot_code: 'COT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      cot_enabled: data.cot,
      tax_code: 'TAX-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      tax_enabled: data.tax,
      irs_code: 'IRS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      irs_enabled: data.irs,
      status: 'PENDING'
    });

    // 3. Create initial deposit transaction (This will update the balance via trigger)
    if (data.balance > 0) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: data.balance,
        type: 'credit',
        narration: 'Account Opening Deposit',
        status: 'COMPLETED',
        stage: 'COMPLETED'
      });
    }

    return user;
  },

  creditAccount: async (adminId: string, userId: string, amount: number, narration: string) => {
    // The Ledger Rule: No direct balance mutation. Insert transaction only.
    // The DB Trigger 'on_transaction_insert' handles the user balance update.
    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      amount,
      type: 'credit',
      narration,
      admin_actor_id: adminId,
      status: 'COMPLETED',
      stage: 'COMPLETED'
    });
    
    if (error) throw error;
  },

  debitAccount: async (adminId: string, userId: string, amount: number, narration: string) => {
    // Check balance first (Read Only)
    const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
    if (!user) throw new Error('User not found');
    if (Number(user.balance) < amount) throw new Error('Insufficient funds for debit');

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      amount,
      type: 'debit',
      narration,
      admin_actor_id: adminId,
      status: 'COMPLETED',
      stage: 'COMPLETED'
    });

    if (error) throw error;
  },

  getAllCustomers: async () => {
    // Read from users table (Truth source for customers)
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  },

  updateRestrictions: async (userId: string, updates: any) => {
    await supabase.from('transfer_codes').update(updates).eq('user_id', userId);
  }
};
