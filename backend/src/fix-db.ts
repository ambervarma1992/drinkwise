import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

async function fixDatabase() {
  try {
    // Make a direct HTTP request to Supabase's REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        query: `
          -- Drop existing constraint
          ALTER TABLE public.drinks DROP CONSTRAINT IF EXISTS drinks_buzz_level_check;
          
          -- Add new constraint
          ALTER TABLE public.drinks ADD CONSTRAINT drinks_buzz_level_check 
            CHECK (buzz_level >= 0 AND buzz_level <= 10);
            
          -- Verify constraint
          SELECT conname, pg_get_constraintdef(oid) 
          FROM pg_constraint 
          WHERE conname = 'drinks_buzz_level_check';
        `
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating database:', error);
      return;
    }

    const result = await response.json();
    console.log('Database update result:', result);

    // Try a test insert
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: insertError } = await supabase
      .from('drinks')
      .insert({
        session_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        units: 1,
        buzz_level: 0,
        timestamp: new Date().toISOString()
      });

    if (insertError) {
      console.error('Test insert error:', insertError);
    } else {
      console.log('Test insert successful');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

fixDatabase(); 