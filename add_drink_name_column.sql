-- Add drink_name column to existing drinks table
ALTER TABLE public.drinks 
ADD COLUMN IF NOT EXISTS drink_name text DEFAULT 'Standard Drink' NOT NULL;

-- Update existing drinks to have a default drink name
UPDATE public.drinks 
SET drink_name = 'Standard Drink' 
WHERE drink_name IS NULL OR drink_name = ''; 