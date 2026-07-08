/*
# Fix signup trigger: default to 'parent' role only

1. Changes
- Update `handle_new_user()` trigger function to always set role='parent' for public signups.
- Remove the COALESCE that read role from raw_user_meta_data (which allowed arbitrary role selection).
- Public registration is now exclusively for Encarregado de Educação (parent).
- All other roles (admin, direction, secretaria, teacher, etc.) are created by admin via dashboard.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador'),
    'parent'
  );
  RETURN NEW;
END;
$$;
