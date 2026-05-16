const url = 'https://zwzrdjfitlhenmdthgmz.supabase.co/rest/v1/admins?select=*';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3enJkamZpdGxoZW5tZHRoZ216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDE4NTQsImV4cCI6MjA5MzgxNzg1NH0.GvnSqJCWm9LQF6aW90__Dq5WPF5qKwX-ZRjohyt07Zc';

fetch(url, {
  method: 'GET',
  headers: {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`
  }
})
.then(res => res.json())
.then(data => console.log('Admins:', JSON.stringify(data, null, 2)))
.catch(err => console.error('Error:', err));
