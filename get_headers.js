const url = 'https://dsxjjykqesjgzzditjjo.supabase.co/rest/v1/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeGpqeWtxZXNqZ3p6ZGl0ampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjE4NDYsImV4cCI6MjA5NzMzNzg0Nn0.mBlw8RXMjDDuagtIqGX54AveEBr-gskKZujiaW1Bvts';

async function run() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log('Status:', res.status);
    console.log('Headers:');
    for (const [k, v] of res.headers.entries()) {
      console.log(`- ${k}: ${v}`);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
