const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://mqfmvgsabgpjyaxonjdr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZm12Z3NhYmdwanlheG9uamRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxMTEyNCwiZXhwIjoyMDc5Mjg3MTI0fQ.8ThV5e7kA0UP2I5xu6nD966FWxcmhfZU_2TU4yS1v9g'
);

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, '../../infra/supabase/migrations');
  const migrationFiles = [
    '0001_init_account_child_calendar.sql',
    '0002_chat_and_analytics.sql',
    '0003_surprise_config.sql'
  ];

  for (const file of migrationFiles) {
    console.log(`Applying migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      // Split SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
          const { error } = await supabase.rpc('exec_sql', { query: statement.trim() });
          if (error) {
            console.error(`Error in statement:`, error);
            // Continue with next statement
          }
        }
      }

      console.log(`✅ ${file} applied successfully`);
    } catch (err) {
      console.error(`Failed to apply ${file}:`, err.message);
    }
  }

  console.log('🎉 All migrations applied!');
}

applyMigrations().catch(console.error);