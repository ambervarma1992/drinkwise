const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addDrinkNameColumn() {
  try {
    // Add the drink_name column
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.drinks 
        ADD COLUMN IF NOT EXISTS drink_name text DEFAULT 'Standard Drink' NOT NULL;
        
        UPDATE public.drinks 
        SET drink_name = 'Standard Drink' 
        WHERE drink_name IS NULL OR drink_name = '';
      `
    });

    if (error) {
      console.error('Error adding column:', error);
    } else {
      console.log('Successfully added drink_name column');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

addDrinkNameColumn(); 