ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_proof_path text;

-- Reload PostgREST schema cache after column change
NOTIFY pgrst, 'reload schema';

