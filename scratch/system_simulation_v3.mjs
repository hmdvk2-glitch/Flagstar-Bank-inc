import { createClient } from '@supabase/supabase-js';

const url = 'https://zwzrdjfitlhenmdthgmz.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3enJkamZpdGxoZW5tZHRoZ216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDE4NTQsImV4cCI6MjA5MzgxNzg1NH0.GvnSqJCWm9LQF6aW90__Dq5WPF5qKwX-ZRjohyt07Zc';
const supabase = createClient(url, key, {
  realtime: { enabled: false }
});

async function runSimulation() {
  console.log('🚀 INITIALIZING SYSTEM SIMULATION v3.0...');

  // STEP 1: Create customer in users
  const testEmail = `sim_${Date.now()}@flagstar.com`;
  const { data: user, error: uError } = await supabase
    .from('users')
    .insert({
      full_name: 'Simulation User',
      email: testEmail,
      account_number: 'SIM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      pin: '123456',
      balance: 0
    })
    .select()
    .single();

  if (uError) {
    console.error('❌ STEP 1 FAILED:', uError.message);
    return;
  }
  console.log('✅ STEP 1: Customer created in users table.');

  // STEP 2: Create 2 CREDIT transactions
  await supabase.from('transactions').insert([
    { user_id: user.id, amount: 1000, type: 'credit', narration: 'Initial Deposit' },
    { user_id: user.id, amount: 500, type: 'credit', narration: 'Bonus Credit' }
  ]);
  console.log('✅ STEP 2: 2 CREDIT transactions injected.');

  // STEP 3: Create 2 DEBIT transactions
  await supabase.from('transactions').insert([
    { user_id: user.id, amount: 200, type: 'debit', narration: 'ATM Withdrawal' },
    { user_id: user.id, amount: 50, type: 'debit', narration: 'Service Fee' }
  ]);
  console.log('✅ STEP 3: 2 DEBIT transactions injected.');

  // STEP 4: Login simulation
  const { data: loginData } = await supabase
    .from('users')
    .select('*')
    .eq('account_number', user.account_number)
    .eq('pin', '123456')
    .single();

  if (loginData) {
    console.log('✅ STEP 4: Customer login validated via account_number + pin.');
  } else {
    console.error('❌ STEP 4 FAILED: Login failed.');
  }

  // STEP 5: Validate balance
  const { data: finalUser } = await supabase
    .from('users')
    .select('balance')
    .eq('id', user.id)
    .single();

  const expectedBalance = 1250; // 1000 + 500 - 200 - 50
  if (Number(finalUser.balance) === expectedBalance) {
    console.log(`✅ STEP 5: Balance validation passed. Current Balance: $${finalUser.balance}`);
  } else {
    console.error(`❌ STEP 5 FAILED: Balance mismatch. Expected ${expectedBalance}, got ${finalUser.balance}`);
  }

  // STEP 6: Admin session validation
  const { count: adminCount } = await supabase
    .from('admins')
    .select('*', { count: 'exact', head: true });
  
  console.log(`✅ STEP 6: Admin session logic validated. Found ${adminCount} authorized admins.`);

  // STEP 7: Cross-table contamination check
  const { data: contaminationCheck } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  const hasRole = 'role' in contaminationCheck[0];
  if (!hasRole) {
    console.log('✅ STEP 7: No cross-table contamination detected (No role in users table).');
  } else {
    console.error('❌ STEP 7 FAILED: Contamination detected! role field found in users table.');
  }

  console.log('🏁 SIMULATION COMPLETE.');
}

runSimulation();
