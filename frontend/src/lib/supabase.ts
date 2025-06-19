import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database schema
export type Session = {
  id: string;
  user_id: string;
  name: string;
  start_time: string;
  end_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Drink = {
  id: string;
  session_id: string;
  user_id: string;
  units: number;
  buzz_level: number;
  drink_name?: string;
  timestamp: string;
  created_at: string;
}; 