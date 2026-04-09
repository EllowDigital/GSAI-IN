
-- Enable Row Level Security on the gallery_images table (if not already enabled)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Anyone can insert rows into gallery_images
CREATE POLICY "Anyone can insert gallery images"
  ON public.gallery_images
  FOR INSERT
  WITH CHECK (true);

-- Anyone can update rows in gallery_images
CREATE POLICY "Anyone can update gallery images"
  ON public.gallery_images
  FOR UPDATE
  USING (true);

-- Anyone can select rows in gallery_images
CREATE POLICY "Anyone can select gallery images"
  ON public.gallery_images
  FOR SELECT
  USING (true);

-- Anyone can delete rows in gallery_images
CREATE POLICY "Anyone can delete gallery images"
  ON public.gallery_images
  FOR DELETE
  USING (true);
