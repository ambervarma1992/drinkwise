import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixConstraint() {
  try {
    // Drop the existing constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE public.drinks DROP CONSTRAINT IF EXISTS drinks_buzz_level_check'
    });

    if (dropError) {
      console.error('Error dropping constraint:', dropError);
      return;
    }

    // Add the new constraint
    const { error: addError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE public.drinks ADD CONSTRAINT drinks_buzz_level_check CHECK (buzz_level >= 0 AND buzz_level <= 10)'
    });

    if (addError) {
      console.error('Error adding constraint:', addError);
      return;
    }

    console.log('Successfully updated buzz_level constraint');

    // Let's verify by trying to insert a test record
    const { error: testError } = await supabase
      .from('drinks')
      .insert({
        session_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        units: 1,
        buzz_level: 0,
        timestamp: new Date().toISOString()
      });

    if (testError) {
      if (testError.code === '23503') { // Foreign key violation is expected
        console.log('Test insert successful (FK error is expected)');
      } else {
        console.error('Test insert failed:', testError);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

fixConstraint(); 