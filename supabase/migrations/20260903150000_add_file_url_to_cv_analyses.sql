ALTER TABLE public.cv_analyses
ADD COLUMN IF NOT EXISTS file_url text;
