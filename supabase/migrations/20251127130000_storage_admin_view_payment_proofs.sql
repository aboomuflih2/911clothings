-- Allow admins to view payment proofs in private bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'objects'
      AND policyname = 'Admins can view payment proofs'
  ) THEN
    CREATE POLICY "Admins can view payment proofs"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin')
    );
  END IF;
END$$;

