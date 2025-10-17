-- This script adds the 'memo' and 'is_complete' columns to your 'todos' table.
-- Run this in your Supabase SQL Editor to fix the memo and task completion functionality.

-- Adds a 'memo' column to store text notes for each todo.
ALTER TABLE public.todos
ADD COLUMN memo TEXT;

-- Adds an 'is_complete' column to track the completion status of each todo.
-- It defaults to FALSE for new todos.
ALTER TABLE public.todos
ADD COLUMN is_complete BOOLEAN DEFAULT FALSE;
