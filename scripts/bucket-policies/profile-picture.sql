CREATE POLICY "Users can upload their own profile picture"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can delete their own profile picture"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Public read for profile pictures"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'profile-pictures'
);

CREATE POLICY "Admins can insert everywhere else"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id <> 'profile-pictures'
  AND EXISTS (
    SELECT 1
    FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
);

CREATE POLICY "Admins can update everywhere else"
ON storage.objects
FOR UPDATE
USING (
  bucket_id <> 'profile-pictures'
  AND EXISTS (
    SELECT 1
    FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
);

CREATE POLICY "Admins can delete everywhere else"
ON storage.objects
FOR DELETE
USING (
  bucket_id <> 'profile-pictures'
  AND EXISTS (
    SELECT 1
    FROM admin_user
    WHERE id = auth.uid()::text
      AND status = 'active'
  )
);