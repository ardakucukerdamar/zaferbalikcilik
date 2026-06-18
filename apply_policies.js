const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: '2a05:d014:14a4:4002:232f:8828:9a32:13ec',
    port: 5432,
    user: 'postgres',
    password: 'Mertobusa.75',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log('Connected to PostgreSQL database.');

  const sql = `
    -- Disable any existing conflicting policies if they exist (safe drop)
    DROP POLICY IF EXISTS "Allow public read categories" ON categories;
    DROP POLICY IF EXISTS "Allow authenticated manage categories" ON categories;
    DROP POLICY IF EXISTS "Allow public read menu_items" ON menu_items;
    DROP POLICY IF EXISTS "Allow authenticated manage menu_items" ON menu_items;
    DROP POLICY IF EXISTS "Allow public read gallery" ON gallery;
    DROP POLICY IF EXISTS "Allow authenticated manage gallery" ON gallery;
    DROP POLICY IF EXISTS "Allow public read reviews" ON reviews;
    DROP POLICY IF EXISTS "Allow public insert reviews" ON reviews;
    DROP POLICY IF EXISTS "Allow authenticated manage reviews" ON reviews;
    DROP POLICY IF EXISTS "Allow public read settings" ON settings;
    DROP POLICY IF EXISTS "Allow authenticated manage settings" ON settings;
    DROP POLICY IF EXISTS "Allow public insert reservations" ON reservations;
    DROP POLICY IF EXISTS "Allow authenticated manage reservations" ON reservations;

    -- Ensure RLS is enabled on all tables
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

    -- Categories policies
    CREATE POLICY "Allow public read categories" ON categories FOR SELECT TO public USING (true);
    CREATE POLICY "Allow authenticated manage categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Menu items policies
    CREATE POLICY "Allow public read menu_items" ON menu_items FOR SELECT TO public USING (true);
    CREATE POLICY "Allow authenticated manage menu_items" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Gallery policies
    CREATE POLICY "Allow public read gallery" ON gallery FOR SELECT TO public USING (true);
    CREATE POLICY "Allow authenticated manage gallery" ON gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Reviews policies
    CREATE POLICY "Allow public read reviews" ON reviews FOR SELECT TO public USING (true);
    CREATE POLICY "Allow public insert reviews" ON reviews FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Allow authenticated manage reviews" ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Settings policies
    CREATE POLICY "Allow public read settings" ON settings FOR SELECT TO public USING (true);
    CREATE POLICY "Allow authenticated manage settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Reservations policies
    CREATE POLICY "Allow public insert reservations" ON reservations FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Allow authenticated manage reservations" ON reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);
  `;

  try {
    await client.query(sql);
    console.log('Successfully enabled RLS and applied all public and authenticated access policies!');
  } catch (error) {
    console.error('Error executing SQL policies:', error.message);
  } finally {
    await client.end();
  }
}

run();
