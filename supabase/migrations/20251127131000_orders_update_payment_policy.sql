-- Allow authenticated users to update payment proof/path and status on their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND policyname = 'Users can update own order payment fields'
  ) THEN
    CREATE POLICY "Users can update own order payment fields"
    ON public.orders
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

