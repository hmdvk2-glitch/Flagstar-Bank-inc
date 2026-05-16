import { createCustomer } from '../src/supabase/alignment.js';

async function setup() {
  try {
    const admin = await createCustomer({
      name: 'System Admin',
      email: 'admin@flagstar-secure.com',
      accountNumber: '100999',
      pin: '123456',
      balance: 1000000,
      role: 'admin',
      restrictions: { cot: true, tax: true, irs: true }
    });
    console.log('Admin provisioned:', admin);
    
    // Set role to admin manually via supabase client if needed, 
    // but createCustomer in alignment.ts handles it if we modify it.
  } catch (err) {
    console.error('Setup failed:', err);
  }
}

setup();
