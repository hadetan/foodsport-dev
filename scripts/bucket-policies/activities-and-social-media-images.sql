CREATE POLICY "Public read for social media images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'social-media-images');

CREATE POLICY "Admins manage social media images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'social-media-images'
  AND EXISTS (
    SELECT 1 FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
)
WITH CHECK (
  bucket_id = 'social-media-images'
  AND EXISTS (
    SELECT 1 FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
);

CREATE POLICY "Public read for activities images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'activities-images');

CREATE POLICY "Admins manage activities images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'activities-images'
  AND EXISTS (
    SELECT 1 FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
)
WITH CHECK (
  bucket_id = 'activities-images'
  AND EXISTS (
    SELECT 1 FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
);