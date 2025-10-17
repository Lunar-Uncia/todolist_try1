-- This SQL command updates the 'todos' table.
-- It sets the 'user_id' column to automatically be filled with the ID of the logged-in user when a new todo is created.
-- This makes the code more robust and secure.

ALTER TABLE public.todos
ALTER COLUMN user_id SET DEFAULT auth.uid();
