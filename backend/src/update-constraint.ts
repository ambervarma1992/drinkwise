import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateConstraint() {
  try {
    // Drop the existing constraint
    await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE public.drinks DROP CONSTRAINT IF EXISTS drinks_buzz_level_check'
    });

    // Add the new constraint
    await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE public.drinks ADD CONSTRAINT drinks_buzz_level_check CHECK (buzz_level BETWEEN 0 AND 10)'
    });

    console.log('Successfully updated buzz_level constraint');
  } catch (error) {
    console.error('Error updating constraint:', error);
  }
}

updateConstraint(); 