const url = 'https://zwzrdjfitlhenmdthgmz.supabase.co/rest/v1';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3enJkamZpdGxoZW5tZHRoZ216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDE4NTQsImV4cCI6MjA5MzgxNzg1NH0.GvnSqJCWm9LQF6aW90__Dq5WPF5qKwX-ZRjohyt07Zc';

async function inspectSchema() {
  const headers = { 'apikey': apikey, 'Authorization': `Bearer ${apikey}` };
  
  console.log('--- TABLES ---');
  const res = await fetch(`${url}/`, { headers });
  const schema = await res.json();
  console.log(JSON.stringify(schema, null, 2));
}

inspectSchema();
