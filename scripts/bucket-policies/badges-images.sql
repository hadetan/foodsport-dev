CREATE POLICY "Public read for badge images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'badges-images');

CREATE POLICY "Admins manage badge images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'badges-images'
  AND EXISTS (
    SELECT 1 FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
)
WITH CHECK (
  bucket_id = 'badges-images'
  AND EXISTS (
    SELECT 1 FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
);