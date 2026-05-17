import { supabase } from '../supabase/client';

export const customerLogin = async (accountNumber: string, pin: string) => {
  const { data, error } = await supabase.rpc('customer_login', {
    p_account_number: accountNumber,
    p_pin: pin
  });
  if (error) throw error;
  return data; // { token, customer_id, account_number, name, balance, kyc_status, session_expires_at }
};

export const useTransferCode = async (customerId: string, codeId: string, toAccount: string, amount: number, narration: string) => {
  const { data, error } = await supabase.rpc('use_transfer_code', {
    p_customer_id: customerId,
    p_code_id: codeId,
    p_to_account: toAccount,
    p_amount: amount,
    p_narration: narration
  });
  if (error) throw error;
  return data;
};

export const fetchCustomerTransactions = async (customerId: string) => {
  const { data, error } = await supabase.from('transactions').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const checkTransferCode = async (customerId: string, codeId: string) => {
  const { data, error } = await supabase.from('transfer_codes').select('*').eq('id', codeId).eq('customer_id', customerId).single();
  if (error) throw error;
  return data;
};
