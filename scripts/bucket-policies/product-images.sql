CREATE POLICY "Public read for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins manage product images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
);