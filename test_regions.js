const { Client } = require('pg');

const regions = [
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
  'ap-south-1', 'ca-central-1', 'sa-east-1'
];

async function run() {
  console.log('Testing connection to all regions...');
  for (const r of regions) {
    const host = `aws-0-${r}.pooler.supabase.com`;
    const client = new Client({
      host,
      port: 6543,
      user: 'postgres.dsxjjykqesjgzzditjjo',
      password: 'Mertobusa.75',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000 // 3 seconds timeout
    });

    try {
      await client.connect();
      console.log(`\n🎉 SUCCESS! Connected successfully to region: ${r} (${host})`);
      await client.end();
      return;
    } catch (e) {
      if (e.message.includes('tenant/user') && e.message.includes('not found')) {
        // Expected if it's the wrong region
      } else {
        console.log(`Region ${r} returned different error: ${e.message}`);
      }
    }
  }
  console.log('\nFinished testing. No region succeeded.');
}

run();
