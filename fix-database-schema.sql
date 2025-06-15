-- Add missing author_name column if it doesn't exist
ALTER TABLE public.clip_vectors ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Set default value for existing records
UPDATE public.clip_vectors SET author_name = 'Unknown' WHERE author_name IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE public.clip_vectors ALTER COLUMN author_name SET NOT NULL;