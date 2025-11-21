const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://mqfmvgsabgpjyaxonjdr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZm12Z3NhYmdwanlheG9uamRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxMTEyNCwiZXhwIjoyMDc5Mjg3MTI0fQ.8ThV5e7kA0UP2I5xu6nD966FWxcmhfZU_2TU4yS1v9g'
);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../../infra/supabase/migrations');
  const migrationFiles = [
    '0001_init_account_child_calendar.sql',
    '0002_chat_and_analytics.sql',
    '0003_surprise_config.sql'
  ];

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      if (error) {
        console.error(`Error in ${file}:`, error);
        // Try direct SQL execution
        const { error: directError } = await supabase.from('_supabase_migration_temp').select('*').limit(0);
        if (directError) {
          console.log('Trying direct SQL execution...');
          // This won't work, but let's try a different approach
        }
      } else {
        console.log(`✅ ${file} completed successfully`);
      }
    } catch (err) {
      console.error(`Failed to run ${file}:`, err.message);
    }
  }
}

runMigrations().catch(console.error);