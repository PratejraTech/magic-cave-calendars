import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import type { Database } from '../types/database.types';

// Create Supabase client with service role key for server-side operations
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey || config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create client for user authentication (uses anon key)
export const supabaseAuth = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);