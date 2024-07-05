import { createClient } from '@supabase/supabase-js';


const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
