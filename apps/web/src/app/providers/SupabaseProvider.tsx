import { createClient } from '@supabase/supabase-js';
import { ReactNode, createContext, useContext } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SupabaseContext = createContext(supabase);

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}