import { supabase } from './client';

export const Mutations = {
  async createCustomer(data: { name: string, email: string, accountNumber: string, pin: string, balance: number }) {
    // 1. Create customer
    const { data: customer, error: cError } = await supabase
      .from('customers')
      .insert({
        full_name: data.name,
        email: data.email,
        account_number: data.accountNumber,
        pin: data.pin,
        balance: data.balance
      })
      .select()
      .single();

    if (cError) throw cError;

    // 2. Initialize transfer codes
    await supabase.from('transfer_codes').insert({
      customer_id: customer.id,
      cot_code: 'COT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      tax_code: 'TAX-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      irs_code: 'IRS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    });

    // 3. Create initial transaction record
    await supabase.from('transactions').insert({
      customer_id: customer.id,
      type: 'credit',
      amount: data.balance,
      narration: 'Account Opening Balance'
    });

    return customer;
  },

  async recordTransaction(customerId: string, amount: number, type: 'credit' | 'debit', narration: string) {
    // 1. Get current balance
    const { data: customer } = await supabase.from('customers').select('balance').eq('id', customerId).single();
    if (!customer) throw new Error('Customer not found');

    const newBalance = type === 'credit' ? Number(customer.balance) + amount : Number(customer.balance) - amount;

    // 2. Update balance
    const { error: bError } = await supabase
      .from('customers')
      .update({ balance: newBalance })
      .eq('id', customerId);

    if (bError) throw bError;

    // 3. Insert transaction
    return supabase.from('transactions').insert({
      customer_id: customerId,
      type,
      amount,
      narration
    });
  },

  async updateRestrictions(customerId: string, restrictions: any) {
    return supabase
      .from('transfer_codes')
      .update(restrictions)
      .eq('customer_id', customerId);
  }
};
