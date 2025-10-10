-- Fix 1: Secure payment_settings table - Remove public access
DROP POLICY IF EXISTS "Anyone can view payment settings" ON public.payment_settings;

CREATE POLICY "Admins can manage payment settings"
ON public.payment_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Protect user_roles table from privilege escalation
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));