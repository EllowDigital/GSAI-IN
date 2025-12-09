-- Create promotion history table
CREATE TABLE public.promotion_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  from_belt_id UUID REFERENCES public.belt_levels(id),
  to_belt_id UUID NOT NULL REFERENCES public.belt_levels(id),
  promoted_by UUID REFERENCES auth.users(id),
  promoted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.promotion_history ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin roles can view promotion history" 
ON public.promotion_history 
FOR SELECT 
USING (has_role('admin'::text));

CREATE POLICY "Admin roles can insert promotion history" 
ON public.promotion_history 
FOR INSERT 
WITH CHECK (has_role('admin'::text));

CREATE POLICY "Admin roles can delete promotion history" 
ON public.promotion_history 
FOR DELETE 
USING (has_role('admin'::text));

-- Create index for faster lookups
CREATE INDEX idx_promotion_history_student ON public.promotion_history(student_id);
CREATE INDEX idx_promotion_history_date ON public.promotion_history(promoted_at DESC);