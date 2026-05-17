import { supabase } from '../supabase/client';

export const adminCreateCustomer = async (adminId: string, name: string, email: string, pin: string) => {
  const { data, error } = await supabase.rpc('admin_create_customer', {
    p_admin_id: adminId,
    p_name: name,
    p_email: email,
    p_plain_pin: pin
  });
  if (error) throw error;
  return data as string; // account_number
};

export const adminCreateTransferCode = async (adminId: string, customerId: string, cotCode: string, taxCode: string, irsCode: string, expiresInDays = 7) => {
  const { data, error } = await supabase.rpc('admin_create_transfer_code', {
    p_admin_id: adminId,
    p_customer_id: customerId,
    p_cot_code: cotCode,
    p_tax_code: taxCode,
    p_irs_code: irsCode,
    p_expires_in_days: expiresInDays
  });
  if (error) throw error;
  return data as string; // UUID
};

export const adminUpdateTransaction = async (adminId: string, transactionId: string, updates: any) => {
  const { data, error } = await supabase.rpc('admin_update_transaction', {
    p_admin_id: adminId,
    p_transaction_id: transactionId,
    p_updates: updates
  });
  if (error) throw error;
  return data;
};

// Also we need fetching functions that respect RLS. 
// Admins table is linked to auth_user_id.
export const fetchAllCustomers = async () => {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchAllTransactions = async () => {
  const { data, error } = await supabase.from('transactions').select('*, customers(name)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchAllTransferCodes = async () => {
  const { data, error } = await supabase.from('transfer_codes').select('*, customers(name)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const adminInsertTransaction = async (transaction: any) => {
  const { data, error } = await supabase.from('transactions').insert(transaction).select().single();
  if (error) throw error;
  return data;
};