-- Create discipline_levels table for non-belt disciplines
CREATE TABLE public.discipline_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discipline TEXT NOT NULL,
  level_name TEXT NOT NULL,
  level_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(discipline, level_order)
);

-- Enable RLS on discipline_levels
ALTER TABLE public.discipline_levels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for discipline_levels
CREATE POLICY "Admin roles can manage discipline levels" 
ON public.discipline_levels 
FOR ALL 
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));

CREATE POLICY "Public can read discipline levels" 
ON public.discipline_levels 
FOR SELECT 
USING (true);

-- Create updated_at trigger for discipline_levels
CREATE TRIGGER update_discipline_levels_updated_at
BEFORE UPDATE ON public.discipline_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create student_discipline_progress table for non-belt disciplines
CREATE TABLE public.student_discipline_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  discipline_level_id UUID NOT NULL REFERENCES public.discipline_levels(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'on_hold')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  coach_notes TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, discipline_level_id)
);

-- Enable RLS on student_discipline_progress
ALTER TABLE public.student_discipline_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_discipline_progress
CREATE POLICY "Admin roles can manage student discipline progress" 
ON public.student_discipline_progress 
FOR ALL 
USING (has_role('admin'::text))
WITH CHECK (has_role('admin'::text));

-- Create updated_at trigger for student_discipline_progress
CREATE TRIGGER update_student_discipline_progress_updated_at
BEFORE UPDATE ON public.student_discipline_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();