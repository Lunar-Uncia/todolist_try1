-- This command forces the Supabase API to reload its internal schema cache.
-- Run this in the Supabase SQL Editor to fix errors like 'Could not find the column'.

NOTIFY pgrst, 'reload schema';
