-- Step 1: Create function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Step 2: Add discipline column to belt_levels
ALTER TABLE public.belt_levels ADD COLUMN IF NOT EXISTS discipline TEXT DEFAULT 'general';

-- Step 3: Add stripe_count to student_progress for BJJ stripes
ALTER TABLE public.student_progress ADD COLUMN IF NOT EXISTS stripe_count INTEGER DEFAULT 0;

-- Step 4: Add check constraint for stripe_count
ALTER TABLE public.student_progress DROP CONSTRAINT IF EXISTS student_progress_stripe_count_check;
ALTER TABLE public.student_progress ADD CONSTRAINT student_progress_stripe_count_check CHECK (stripe_count >= 0 AND stripe_count <= 4);