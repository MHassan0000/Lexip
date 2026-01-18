-- =============================================
-- SUPABASE STORAGE BUCKET FOR THUMBNAILS
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create the thumbnails bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'thumbnails',
    'thumbnails',
    true,
    52428800, -- 50MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to thumbnails
CREATE POLICY "Public read access for thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'thumbnails' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);


-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'thumbnails' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
