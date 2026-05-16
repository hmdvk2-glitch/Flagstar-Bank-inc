import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwzrdjfitlhenmdthgmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3enJkamZpdGxoZW5tZHRoZ216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDE4NTQsImV4cCI6MjA5MzgxNzg1NH0.GvnSqJCWm9LQF6aW90__Dq5WPF5qKwX-ZRjohyt07Zc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getAdmin() {
  const { data, error } = await supabase
    .from('customers')
    .select('account_number, pin')
    .eq('role', 'admin');

  if (error) {
    console.error(error);
    return;
  }
  console.log('Admin Accounts:', JSON.stringify(data, null, 2));
}

getAdmin();
