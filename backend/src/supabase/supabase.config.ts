import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

const createSupabaseClient = (configService: ConfigService) => {
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const supabaseKey = configService.get<string>('SUPABASE_KEY');

  if (!supabaseUrl) throw new Error('SUPABASE_URL is not set in environment variables');
  if (!supabaseKey) throw new Error('SUPABASE_KEY is not set in environment variables');

  return createClient(supabaseUrl, supabaseKey);
};

// Create a single instance of ConfigService
const configService = new ConfigService();

// Create a single instance of Supabase client
export const supabase = createSupabaseClient(configService);
