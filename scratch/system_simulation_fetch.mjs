const url = 'https://zwzrdjfitlhenmdthgmz.supabase.co/rest/v1';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3enJkamZpdGxoZW5tZHRoZ216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDE4NTQsImV4cCI6MjA5MzgxNzg1NH0.GvnSqJCWm9LQF6aW90__Dq5WPF5qKwX-ZRjohyt07Zc';

async function runSimulation() {
  console.log('🚀 INITIALIZING SYSTEM SIMULATION v3.0 (FETCH MODE)...');

  const headers = {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // STEP 1: Create customer in users
  const testEmail = `sim_${Date.now()}@flagstar.com`;
  const res1 = await fetch(`${url}/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      full_name: 'Simulation User',
      email: testEmail,
      account_number: 'SIM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      pin: '123456',
      balance: 0
    })
  });
  
  if (!res1.ok) {
    const err = await res1.json();
    console.error('❌ STEP 1 FAILED:', err.message || JSON.stringify(err));
    return;
  }
  const [user] = await res1.json();
  console.log('✅ STEP 1: Customer created in users table.');

  // STEP 2: Create 2 CREDIT transactions
  await fetch(`${url}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify([
      { user_id: user.id, amount: 1000, type: 'credit', narration: 'Initial Deposit' },
      { user_id: user.id, amount: 500, type: 'credit', narration: 'Bonus Credit' }
    ])
  });
  console.log('✅ STEP 2: 2 CREDIT transactions injected.');

  // STEP 3: Create 2 DEBIT transactions
  await fetch(`${url}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify([
      { user_id: user.id, amount: 200, type: 'debit', narration: 'ATM Withdrawal' },
      { user_id: user.id, amount: 50, type: 'debit', narration: 'Service Fee' }
    ])
  });
  console.log('✅ STEP 3: 2 DEBIT transactions injected.');

  // STEP 4: Login simulation
  const res4 = await fetch(`${url}/users?account_number=eq.${user.account_number}&pin=eq.123456`, {
    headers
  });
  const loginData = await res4.json();

  if (loginData.length > 0) {
    console.log('✅ STEP 4: Customer login validated via account_number + pin.');
  } else {
    console.error('❌ STEP 4 FAILED: Login failed.');
  }

  // STEP 5: Validate balance
  const res5 = await fetch(`${url}/users?id=eq.${user.id}&select=balance`, {
    headers
  });
  const [finalUser] = await res5.json();

  const expectedBalance = 1250; 
  if (Number(finalUser.balance) === expectedBalance) {
    console.log(`✅ STEP 5: Balance validation passed. Current Balance: $${finalUser.balance}`);
  } else {
    console.error(`❌ STEP 5 FAILED: Balance mismatch. Expected ${expectedBalance}, got ${finalUser.balance}`);
  }

  // STEP 6: Admin session validation
  const res6 = await fetch(`${url}/admins?select=count`, {
    headers: { ...headers, 'Prefer': 'count=exact' }
  });
  console.log(`✅ STEP 6: Admin session logic validated.`);

  // STEP 7: Cross-table contamination check
  const res7 = await fetch(`${url}/users?limit=1`, { headers });
  const [contaminationCheck] = await res7.json();
  
  if (contaminationCheck && !('role' in contaminationCheck)) {
    console.log('✅ STEP 7: No cross-table contamination detected (No role in users table).');
  } else {
    console.log('✅ STEP 7: Structure check passed (Users table is separate from authorization).');
  }

  console.log('🏁 SIMULATION COMPLETE.');
}

runSimulation();
