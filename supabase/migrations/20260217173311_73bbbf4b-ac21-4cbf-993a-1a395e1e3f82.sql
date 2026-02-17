
-- Add category, archived, and reminder_time to habits
ALTER TABLE public.habits ADD COLUMN category text NOT NULL DEFAULT 'General';
ALTER TABLE public.habits ADD COLUMN archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.habits ADD COLUMN reminder_time time WITHOUT TIME ZONE;

-- Add note to completions
ALTER TABLE public.completions ADD COLUMN note text;
