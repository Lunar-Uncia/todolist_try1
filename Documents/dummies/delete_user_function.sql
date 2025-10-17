-- This function safely deletes a user and all their associated data (todos).
-- Copy and paste this entire code into the Supabase SQL Editor and run it.

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, delete all todos associated with the current user.
  DELETE FROM public.todos WHERE user_id = auth.uid();
  
  -- Then, delete the user from the authentication table.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
