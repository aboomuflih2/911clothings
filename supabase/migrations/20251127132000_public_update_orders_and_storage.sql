-- Public policies for payment proof updates and uploads
DO $$
BEGIN
  -- Allow anyone to update orders (payment fields) — use with caution
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='Anyone can update orders'
  ) THEN
    CREATE POLICY "Anyone can update orders"
    ON public.orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
  END IF;

  -- Allow anyone to insert into payment-proofs bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='objects' AND policyname='Anyone can insert payment proofs'
  ) THEN
    CREATE POLICY "Anyone can insert payment proofs"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'payment-proofs');
  END IF;

  -- Ensure anyone can select payment proofs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='objects' AND policyname='Anyone can select payment proofs'
  ) THEN
    CREATE POLICY "Anyone can select payment proofs"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'payment-proofs');
  END IF;
END$$;

