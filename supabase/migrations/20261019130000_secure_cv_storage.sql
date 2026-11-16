
BEGIN;

-- 1. Verify that the expected bucket exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'cvs'
  ) THEN
    RAISE EXCEPTION 'Expected Storage bucket "cvs" was not found.';
  END IF;
END
$$;

-- 2. Make the CV bucket private and restrict future uploads.
UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[]
WHERE id = 'cvs';

-- 3. Remove the previously identified broad policies.
DROP POLICY IF EXISTS "Authenticated users can upload cvs"
  ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can view cvs"
  ON storage.objects;

-- 4. Ensure the intended upload policy exists only once.
DROP POLICY IF EXISTS "Users can upload their own CVs"
  ON storage.objects;

CREATE POLICY "Users can upload their own CVs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  AND lower(storage.extension(name)) = 'pdf'
);

COMMIT;
