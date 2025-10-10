-- Create stores table for branch locations
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  phone text NOT NULL,
  email text,
  opening_hours jsonb NOT NULL DEFAULT '{"monday": "10:00 AM - 8:00 PM", "tuesday": "10:00 AM - 8:00 PM", "wednesday": "10:00 AM - 8:00 PM", "thursday": "10:00 AM - 8:00 PM", "friday": "10:00 AM - 8:00 PM", "saturday": "10:00 AM - 9:00 PM", "sunday": "11:00 AM - 7:00 PM"}'::jsonb,
  latitude numeric(10, 8) NOT NULL,
  longitude numeric(11, 8) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Anyone can view active stores
CREATE POLICY "Anyone can view active stores"
ON public.stores
FOR SELECT
USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();