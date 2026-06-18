const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.dsxjjykqesjgzzditjjo',
    password: 'Mertobusa.75',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to port 5432!');
    const res = await client.query('SELECT version();');
    console.log('PG Version:', res.rows[0].version);
    await client.end();
  } catch (e) {
    console.error('Error on port 5432:', e.message);
  }
}

run();
