const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dsxjjykqesjgzzditjjo.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeGpqeWtxZXNqZ3p6ZGl0ampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjE4NDYsImV4cCI6MjA5NzMzNzg0Nn0.mBlw8RXMjDDuagtIqGX54AveEBr-gskKZujiaW1Bvts';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeGpqeWtxZXNqZ3p6ZGl0ampvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc2MTg0NiwiZXhwIjoyMDk3MzM3ODQ2fQ.TnIIItYWHfDdm94zLD29gdn-8LWdcbC-bi7pta2FibM';

const clientAnon = createClient(supabaseUrl, anonKey);
const clientService = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  console.log('--- TESTING WITH SERVICE ROLE KEY (Bypasses RLS) ---');
  const { data: catsService, error: errCatsS } = await clientService.from('categories').select('*');
  const { data: itemsService, error: errItemsS } = await clientService.from('menu_items').select('*').limit(3);
  
  if (errCatsS) console.error('Cats S Error:', errCatsS.message);
  else console.log(`Cats S Count: ${catsService?.length || 0}`);
  
  if (errItemsS) console.error('Items S Error:', errItemsS.message);
  else console.log(`Items S Count: ${itemsService?.length || 0}`);

  console.log('\n--- TESTING WITH ANON KEY (Client public key) ---');
  const { data: catsAnon, error: errCatsA } = await clientAnon.from('categories').select('*');
  const { data: itemsAnon, error: errItemsA } = await clientAnon.from('menu_items').select('*').limit(3);
  
  if (errCatsA) console.error('Cats A Error:', errCatsA.message);
  else console.log(`Cats A Count: ${catsAnon?.length || 0}`);
  
  if (errItemsA) console.error('Items A Error:', errItemsA.message);
  else console.log(`Items A Count: ${itemsAnon?.length || 0}`);
}

test();
