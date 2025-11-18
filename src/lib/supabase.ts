import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://cwnjfuowvwoamdgpsnrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bmpmdW93dndvYW1kZ3BzbnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzA4ODksImV4cCI6MjA3ODg0Njg4OX0.k6ib-VYby9UgobniXJwBH6E5f0Zq0zj95B1TRrd9QbA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
