
-- Add an image_url column to the public.news table for news images
ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS image_url text;
