const url = 'https://zwzrdjfitlhenmdthgmz.supabase.co/rest/v1/customers';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3enJkamZpdGxoZW5tZHRoZ216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDE4NTQsImV4cCI6MjA5MzgxNzg1NH0.GvnSqJCWm9LQF6aW90__Dq5WPF5qKwX-ZRjohyt07Zc';

const body = JSON.stringify({
  name: 'System Administrator',
  email: 'admin@flagstar-secure.com',
  account_number: '100999',
  pin: '123456',
  role: 'admin',
  balance: 1000000
});

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: body
})
.then(res => res.json())
.then(data => console.log('Success:', JSON.stringify(data, null, 2)))
.catch(err => console.error('Error:', err));
