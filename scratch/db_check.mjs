import { createClient } from '@supabase/supabase-js';

const url = 'https://zwzrdjfitlhenmdthgmz.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3enJkamZpdGxoZW5tZHRoZ216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDE4NTQsImV4cCI6MjA5MzgxNzg1NH0.GvnSqJCWm9LQF6aW90__Dq5WPF5qKwX-ZRjohyt07Zc';
const supabase = createClient(url, key);

async function checkSchema() {
  console.log('--- Checking customers columns ---');
  const { data: custData, error: custErr } = await supabase
    .from('customers')
    .select('*')
    .limit(1);
  if (custErr) {
    console.error('customers error:', custErr.message);
  } else {
    console.log('customers record keys:', custData.length > 0 ? Object.keys(custData[0]) : 'Empty table');
  }

  console.log('\n--- Checking transfer_codes columns ---');
  const { data: codeData, error: codeErr } = await supabase
    .from('transfer_codes')
    .select('*')
    .limit(1);
  if (codeErr) {
    console.error('transfer_codes error:', codeErr.message);
  } else {
    console.log('transfer_codes record keys:', codeData.length > 0 ? Object.keys(codeData[0]) : 'Empty table');
  }
}

checkSchema();
