const url = 'https://zwzrdjfitlhenmdthgmz.supabase.co/rest/v1/customers';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3enJkamZpdGxoZW5tZHRoZ216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDE4NTQsImV4cCI6MjA5MzgxNzg1NH0.GvnSqJCWm9LQF6aW90__Dq5WPF5qKwX-ZRjohyt07Zc';

async function seed() {
  const payload = {
    full_name: 'System Administrator',
    email: 'admin@flagstar-secure.com',
    account_number: '100999',
    pin: '123456',
    role: 'admin',
    balance: 1000000
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': apikey,
        'Authorization': `Bearer ${apikey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (res.ok) {
      console.log('Admin provisioned successfully:', data);
    } else {
      console.error('Provisioning failed:', data);
      if (data.message && data.message.includes('full_name')) {
        console.log('Retrying with "name" column...');
        delete payload.full_name;
        payload.name = 'System Administrator';
        // Retry...
      }
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

seed();
