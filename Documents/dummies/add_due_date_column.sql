-- This command adds the 'due_date' column to your 'todos' table.
-- Run this if you are getting an error saying the column could not be found.

ALTER TABLE public.todos
ADD COLUMN due_date TIMESTAMPTZ;
