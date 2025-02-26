import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

require('dotenv').config();

console.log(process.env.SUPABASE_URL)

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

export default supabase;