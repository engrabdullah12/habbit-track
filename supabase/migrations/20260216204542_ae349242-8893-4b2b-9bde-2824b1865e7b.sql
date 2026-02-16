
-- Create habits table
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create completions table
CREATE TABLE public.completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, completion_date)
);

-- Helper function: check if current user owns the habit
CREATE OR REPLACE FUNCTION public.is_habit_owner(p_habit_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.habits WHERE id = p_habit_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

-- Habits RLS policies
CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own habits" ON public.habits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE USING (user_id = auth.uid());

-- Completions RLS policies
CREATE POLICY "Users can view their own completions" ON public.completions FOR SELECT USING (is_habit_owner(habit_id));
CREATE POLICY "Users can create completions for own habits" ON public.completions FOR INSERT WITH CHECK (is_habit_owner(habit_id));
CREATE POLICY "Users can delete their own completions" ON public.completions FOR DELETE USING (is_habit_owner(habit_id));
