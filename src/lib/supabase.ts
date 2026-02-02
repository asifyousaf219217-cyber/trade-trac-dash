import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unohdmxakvaotyyfzucg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVub2hkbXhha3Zhb3R5eWZ6dWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjczOTYsImV4cCI6MjA4MzMwMzM5Nn0.S-t9JUPWSjs3ghZTX831ZI86r_lnZo5nW5dCz3Ems4E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
