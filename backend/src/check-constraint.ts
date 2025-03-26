import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraint() {
  try {
    // Check the current constraint
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT con.conname, pg_get_constraintdef(con.oid)
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'drinks'
        AND con.conname = 'drinks_buzz_level_check';
      `
    });

    if (error) {
      console.error('Error checking constraint:', error);
      return;
    }

    console.log('Current constraint:', data);

    // Try to insert a test record with buzz_level = 0
    const testData = {
      session_id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      units: 1,
      buzz_level: 0,
      timestamp: new Date().toISOString()
    };

    console.log('Attempting test insert:', testData);

    const { error: insertError } = await supabase
      .from('drinks')
      .insert(testData);

    if (insertError) {
      console.error('Test insert error:', insertError);
    } else {
      console.log('Test insert successful');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkConstraint(); 