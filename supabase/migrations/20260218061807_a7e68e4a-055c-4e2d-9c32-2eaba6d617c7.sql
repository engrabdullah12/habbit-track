
-- Create time_entries table for tracking work sessions
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  color TEXT NOT NULL DEFAULT '#6366f1',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  is_running BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own time entries"
ON public.time_entries FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own time entries"
ON public.time_entries FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries"
ON public.time_entries FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries"
ON public.time_entries FOR DELETE
USING (user_id = auth.uid());
