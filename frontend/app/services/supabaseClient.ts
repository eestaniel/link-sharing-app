import { createClient } from '@supabase/supabase-js';

// Ensure the environment variables are set
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl) throw new Error('SUPABASE_URL is not set in environment variables');
if (!supabaseKey) throw new Error('SUPABASE_KEY is not set in environment variables');

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
